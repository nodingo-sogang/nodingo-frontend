# 백엔드 API 요청서 (프론트엔드 → 백엔드)

프론트엔드에서 현재 **mock 데이터로만 동작 중**이라 실제 백엔드 API가 필요한 항목 정리입니다.
화면에 실제로 쓰는 필드 기준으로 작성했고, 응답 JSON 예시는 그대로 구현하시면 프론트 연결이 바로 됩니다.

---

## 0. 공통 규약 (기존과 동일)

- **JSON 네이밍:** `snake_case` (현재 백엔드 `property-naming-strategy: SNAKE_CASE` 그대로)
- **공통 응답 래퍼:**
  ```json
  { "success": true, "code": 200, "message": "...", "data": { } }
  ```
- **인증:** `Authorization: Bearer {accessToken}` (온보딩 완료 유저 기준, 기존 그래프 API와 동일)
- **페이징:** 기존 스크랩 API의 `Slice` 스타일(`content`, `has_next`) 재사용 가능

---

## ⚠️ A. 버그 수정 요청 (긴급 — 연동 중 발견)

### A-1. 🔴 퀴즈 채점 인덱스 불일치 (정답 맞혀도 오답 처리)
**증상:** 정답을 골라도 오답 처리되고 XP가 안 들어감. **1번 보기(0번 인덱스)가 정답이면 영영 못 맞힘.**

**원인:** 제출 검증과 정답 저장의 인덱스 기준이 다름
- `QuizSubmitRequest.selectedOptionIndex` → `@Min(1) @Max(4)` = **1-based**
- `Quiz.answerIndex` (AI 생성) → **0-based** (스웨거 응답 `correct_answer_index: 0` 확인)
- 채점이 둘을 직접 비교 → 항상 한 칸 어긋남

```java
// QuizService.submitQuiz — 변경 전
boolean isCorrect = quiz.getAnswerIndex().equals(command.getSelectedOptionIndex());
// 변경 후 (1-based 제출을 0-based로 변환해 비교)
boolean isCorrect = quiz.getAnswerIndex().equals(command.getSelectedOptionIndex() - 1);
```
- `correct_answer_index`(응답)는 **0-based 그대로** 두면 됨 (프론트가 이미 0-based로 정답 표시 중)
- ✅ 프론트는 정답 "표시"는 자체 보정해뒀으나, **XP 적립은 이 수정이 있어야 정상화**됨

### A-2. 🟡 퀴즈 목록에 풀이 여부(`solved`) 플래그
**화면:** 이미 푼 퀴즈는 다시 못 풀게 하거나 "완료" 표시 필요. 현재 목록 API가 풀이 여부를 안 줘서 **제출(400) 후에야** 알 수 있음.
- 요청: `GET /api/graphs/nodes/{keywordId}/quizzes` 각 항목에 `"solved": true|false` 추가
- (현재는 재제출 시 `400 이미 제출한 퀴즈`로만 구분 — 프론트가 "이미 풀었어요" 안내로 임시 처리 중)

### A-3. 🟡 재온보딩 시 추천 재생성 안 됨
**증상:** 페르소나를 바꿔 다시 온보딩해도 추천 탭이 그대로 고정 (예: 문화 선택 → 반도체 추천).

**원인:** `RecommendKeywordInitService.initForNewUser`가 그날 추천이 이미 있으면 스킵
```java
if (recommendKeywordRepository.existsByUserIdAndTargetDate(user.getId(), today)) {
    return; // ← 재온보딩해도 추천 재생성 안 함
}
```
- 요청: `saveOnboardingInfo`가 오늘 관심사를 지우고 다시 넣듯, **재온보딩 시 오늘 RecommendKeyword도 삭제 후 재생성**(또는 테스트용 리셋 엔드포인트)
- → 한 계정으로 페르소나 바꿔가며 추천 변화를 테스트할 수 있게 됨

### A-4. 🔴 일부 그래프 노드 스크랩 시 `POST /api/keywords/{id}/scrap` → 404 (키워드 없음)

**증상:** 그래프에서 어떤 노드는 스크랩이 되는데(예: id 834 "화제성" → `201 Created`), **어떤 노드는 `404 Not Found`** 가 납니다 (예: id 1232 "한·미 금리차 역전").
- 화면엔 ♥가 켜지지만 서버엔 저장 안 됨 → 새로고침하면 사라지고, 보관함도 비어 보임.
- (프론트는 실패 시 ♥를 롤백하도록 보강했지만, **근본 원인은 그 노드를 스크랩할 수 없는 것**)

**원인 추정:** `GET /api/graphs/nodes`가 반환하는 **노드 id**가, `POST /api/keywords/{keywordId}/scrap`가 기대하는 **스크랩 가능한 Keyword 레코드 id와 불일치**. 즉 그래프엔 보이는데 **스크랩 대상 키워드로는 존재하지 않는 노드**가 있습니다. (이웃/파생 노드가 Keyword 엔티티로 저장돼 있지 않거나, id 체계가 다를 가능성)

```text
요청:  POST /api/keywords/1232/scrap
응답:  404 Not Found  { "success": false, "code": 404, "message": "...키워드를 찾을 수 없습니다." }
정상:  POST /api/keywords/834/scrap  → 201 Created
```

**요청 사항**
- **그래프가 내려주는 모든 노드 id가 `POST /api/keywords/{id}/scrap` 로 스크랩 가능**하도록 정합성 보장
  - 그래프 노드 ↔ 스크랩 키워드의 **id 체계 일치** 확인
  - 또는 스크랩 시 노드 id로 **키워드를 찾지 못하면 생성/매핑**하거나, 그래프 응답에 **scrap 가능 여부/스크랩용 keywordId**를 따로 내려주기
- ✅ 프론트는 노드 id를 그대로 전송 중 — 백엔드에서 그 id를 스크랩 키워드로 해석할 수 있으면 즉시 해결

---

## 🚀 D. 배포(Vercel) 연동 — 로그인 살리기

프론트가 **Vercel에 배포**됐습니다: `https://nodingo-frontend-plum.vercel.app`
- **API 호출(CORS):** 프론트 `vercel.json`에서 `/api/*`를 백엔드로 **서버사이드 프록시**합니다. → 브라우저 기준 same-origin이라 **CORS 변경 불필요.** (백엔드 직접 호출이 없음)
- **OAuth 콜백(네이버):** 네이버 등록 콜백은 백엔드 도메인(`{backend}/login/oauth2/code/naver`) 그대로라 **네이버 콘솔 변경 불필요.**

### D-1. 🔴 OAuth 성공 후 리다이렉트 주소 변경 (유일한 필수 변경)
현재 `app.oauth2.redirect-uri`가 백엔드 자기 페이지(`/auth/callback.html`)를 가리켜서, 배포된 프론트로 토큰이 안 돌아옵니다. `OAuth2SuccessHandler`가 `redirect-uri?accessToken=..&refreshToken=..`로 보내므로, **이 값만 배포 프론트의 콜백 라우트로** 바꾸면 됩니다:

```yaml
# application.yaml (또는 배포 환경변수 APP_OAUTH2_REDIRECT_URI)
app:
  oauth2:
    redirect-uri: https://nodingo-frontend-plum.vercel.app/auth/callback
```
- 프론트 `/auth/callback`(React 라우트)이 `accessToken`/`refreshToken` 쿼리를 읽어 로그인 처리함 → **이 한 줄이면 배포본 로그인 동작.**
- (로컬 개발도 같이 쓰려면 환경별로 분기: dev=`http://localhost:3000/auth/callback`, prod=Vercel 주소)

---

## 1. 🔴 신규 요청 — 현재 백엔드에 없음

### 1-1. 랭킹(리더보드) 조회
**화면:** 랭킹 탭 (이번 주 TOP 100, 친구/관심분야 2개 스코프, 매주 일요일 자정 초기화)

| 항목 | 내용 |
|---|---|
| Method | `GET` |
| Path | `/api/users/ranking` |
| Query | `scope` = `friends` \| `persona` (필수), `period` = `weekly` (기본), `page` = 0 (선택) |

**응답 `data` 예시:**
```json
{
  "scope": "friends",
  "period": "weekly",
  "entries": [
    { "rank": 1, "name": "이서준", "level": 12, "week_xp": 3420, "persona": "경제", "is_me": false },
    { "rank": 2, "name": "김하늘", "level": 10, "week_xp": 2980, "persona": "기술", "is_me": false },
    { "rank": 27, "name": "딩고",   "level": 5,  "week_xp": 820,  "persona": "기술", "is_me": true }
  ],
  "my_entry": { "rank": 27, "name": "딩고", "level": 5, "week_xp": 820, "persona": "기술", "is_me": true }
}
```
**필드 설명**
- `rank`(int), `name`(string), `level`(int), `week_xp`(int, 이번 주 누적 XP)
- `persona`(string, 한글 라벨 또는 enum — 표시는 `#기술` 형태), `is_me`(bool)
- `my_entry`: 내가 TOP 리스트 밖이어도 하단 고정 표시용. (리스트에 내가 있으면 동일 값)
- 아바타는 `level`로 프론트에서 티어 이미지 매핑하므로 **이미지 URL 불필요**.

---

### 1-2. 내 뱃지 목록 조회
**화면:** 프로필 탭 뱃지 그리드 (획득/미획득 모두 표시 + "N/전체")

> 참고: 퀴즈 제출 응답(`QuizRewardResponse.new_badges`)이 주는 뱃지 `id`와 **동일한 id 체계**로 맞춰주세요.

| 항목 | 내용 |
|---|---|
| Method | `GET` |
| Path | `/api/users/badges` |

**응답 `data` 예시:**
```json
{
  "badges": [
    {
      "id": "first_explore",
      "name": "첫 탐험",
      "category": "explore",
      "description": "첫 노드를 탐험했어요",
      "condition": "노드 1개 탐험",
      "earned": true,
      "earned_at": "2026-05-27"
    },
    {
      "id": "quiz_10",
      "name": "퀴즈 마스터",
      "category": "quiz",
      "description": "퀴즈 10개 정답",
      "condition": "퀴즈 10개 맞히기",
      "earned": false,
      "earned_at": null
    }
  ]
}
```
**필드 설명**
- `category` enum: `attendance` | `explore` | `quiz` | `social` | `special` (프론트가 아이콘 매핑에 사용)
- `earned`(bool), `earned_at`(string \| null, 미획득 시 null)

> **⚠️ 중요 — 뱃지 획득은 서버에서 판정·저장해야 함 (현재 버그):**
> 지금 프론트가 뱃지 조건을 **클라이언트에서 계산**하고 획득 상태를 어디에도 저장하지 않아서, **매 로그인/새로고침마다 "첫 접속 환영" 뱃지가 다시 뜹니다.**
> - 백엔드가 뱃지 조건(첫 로그인, 탐험 N회, 퀴즈 N개, 스트릭 N일, 스크랩, 친구 등)을 **이벤트 발생 시 판정해 획득 상태를 영구 저장**해야 함
> - 그러면 프론트는 `GET /api/users/badges`의 `earned`만 표시 → 재발급 없음
> - 참고: 퀴즈 제출 응답의 `new_badges`(이번에 새로 딴 뱃지 id)는 이미 있음 → **다른 트리거(탐험/스트릭/출석 등)도 동일하게 서버에서 지급**하면 일관됨

---

## 2. 🟡 기존 응답 확장 요청

### 2-1. `GET /api/users/game` 응답에 필드 추가
**화면:** 프로필 통계 카드 (완료 퀴즈 누적, 닉네임)

현재 `user_game`은 `level / xp / xp_needed / tier / streak`만 반환합니다. 아래 2개가 더 필요합니다.

```json
{
  "user_game": {
    "level": 5,
    "xp": 82,
    "xp_needed": 240,
    "tier": "시사입문러",
    "streak": 3,
    "name": "딩고",                 // ← 추가: 유저 표시 닉네임 (현재 프론트 하드코딩 중)
    "total_quizzes_solved": 14      // ← 추가: 누적 정답 퀴즈 수 (daily 아님, 전체 통계)
  },
  "daily_goals": { "quizzes_completed": 1, "quizzes_required": 2, "completed": false }
}
```
- `total_nodes_explored`(누적 탐험 노드)는 `GET /api/users/progress`의 `explored_count`로 충당 가능 → **추가 불필요**.

---

## 3. 🟢 (참고) 이미 백엔드에 있음 — 새 요청 아님, 프론트 연결만

아래는 백엔드에 이미 구현돼 있어 **요청 대상이 아닙니다.** 프론트에서 연결만 하면 됩니다. (백엔드 작업 불필요)

- `GET /api/users/scraps/keywords/nodes` · `.../summaries` — 스크랩 보관함
- `GET /api/news/{newsId}` — 뉴스 상세
- `POST` · `DELETE /api/news/{newsId}/scrap` — 기사 스크랩
- `GET` · `PATCH /api/users/notifications/*` — 알림 설정/FCM 토큰

---

## 4. 👥 친구 (초대 코드 방식) — 신규 요청

**화면:** 랭킹 "친구" 탭. 현재 **친구를 맺는 경로가 전혀 없음**(검색 UI 없음, 전부 mock).
**방식:** 유저 검색·고유 닉네임 인프라 없이 **초대 코드**로 연결. (네이버 OAuth는 인증만 제공하고 친구 그래프를 안 줘서 자체 구현 필요)
**모델:** 양방향 친구 — A가 B의 코드를 입력하면 서로 친구. 코드는 유저당 1개 고정.

### 4-1. 내 초대 코드 조회
| Method | Path |
|---|---|
| `GET` | `/api/users/me/invite-code` |

```json
{ "invite_code": "NDG-7F3A" }
```
- 없으면 생성 후 반환, 재호출 시 동일 코드(고정).

### 4-2. 초대 코드로 친구 추가
| Method | Path | Body |
|---|---|---|
| `POST` | `/api/users/friends` | `{ "invite_code": "NDG-7F3A" }` |

```json
{ "user_id": 12, "name": "찬우", "level": 8, "persona": "기술" }
```
- 양방향 친구 생성(A↔B 동시). 에러: `404`(코드 없음) / `409`(이미 친구) / `400`(내 코드)

### 4-3. 내 친구 목록
| Method | Path |
|---|---|
| `GET` | `/api/users/friends` |

```json
{ "friends": [ { "user_id": 12, "name": "찬우", "level": 8, "persona": "기술" } ] }
```

### 4-4. 친구 삭제 (선택)
`DELETE /api/users/friends/{userId}`

### 4-5. 친구 랭킹 연동
- 위 친구 관계를 기준으로 **`GET /api/users/ranking?scope=friends`(1-1)** 가 친구들만 반환
- → "나" 행도 서버값이 되어 사이드바 레벨과 일치(현재는 mock이라 Lv 불일치)

### (선택) 부가 소셜
- **툭 건들기(poke):** `POST /api/users/{userId}/poke` → 알림 (랭킹 👋 버튼)
- **타 유저 지식지도:** `GET /api/users/{userId}/graph` → 그래프 (본인 그래프와 동일 형태, 랭킹 "지식지도 보기")

---

### 우선순위 제안
1. **랭킹(1-1)** — 화면 전체가 mock이라 임팩트 큼
2. **뱃지(1-2)** + **game 확장(2-1)** — 프로필 화면 완성
3. 스크랩 목록(3) 연결 — 프론트 작업 (백엔드 불필요)
4. 친구 초대코드(4) — 백엔드 소셜 API 합의 후 (프론트 친구추가 UI 동반 필요)

---

## 5. 🆕 스크랩 그래프 (엣지 포함) — 신규 요청

**화면:** 스크랩 보관함에 **리스트 ↔ 그래프 뷰 토글**을 추가합니다. 그래프 뷰는 내가 스크랩한 키워드들을 **노드 + 관계선(엣지)** 으로 보여줍니다.

**왜 필요한가:** 현재 `GET /api/users/scraps/keywords/nodes`(그래프용)는 **노드(id·word·persona)만** 주고 **엣지가 없어서**, 스크랩 키워드 간 관계를 그래프로 그릴 수 없습니다. (프론트는 일단 엣지 없는 노드 배치만 구현 중)

**핵심:** 메인 그래프(`GET /api/graphs/nodes`)가 이미 `nodes + edges`를 생성하므로, **그 파이프라인을 "내 스크랩 키워드 집합"에 대해 재사용**해 양 끝점이 모두 스크랩 노드인 엣지를 추려 내려주면 됩니다.

| 항목 | 내용 |
|---|---|
| Method | `GET` |
| Path | `/api/users/scraps/keywords/graph` |
| 인증 | `Authorization: Bearer {accessToken}` (본인 스크랩 기준) |

**응답 `data` 예시** (메인 그래프 `GraphDataResponse`와 **동일 형태** → 프론트 렌더링 코드 재사용):
```json
{
  "nodes": [
    { "id": 834, "word": "화제성",   "persona": "CULTURE",    "score": 0.7 },
    { "id": 502, "word": "반도체",   "persona": "TECHNOLOGY", "score": 0.9 },
    { "id": 104, "word": "환율",     "persona": "ECONOMY",    "score": 0.6 }
  ],
  "edges": [
    { "source": 834, "target": 502, "weight": 0.55 },
    { "source": 502, "target": 104, "weight": 0.62 }
  ]
}
```

**필드/규칙**
- `nodes[]`: `id`(키워드 id, 그래프 노드 id와 동일), `word`, `persona`(enum), `score`(0~1, 없으면 0.5로 둬도 됨 — 노드 크기용)
- `edges[]`: `source`/`target`(둘 다 **스크랩한 노드 id**), `weight`(0~1)
- **엣지 추출 규칙:** 양 끝점이 모두 "내 스크랩 노드 집합"에 속하는 관계만 포함 (스크랩 안 한 노드로 가는 엣지는 제외)
- 스크랩이 0개면 `nodes: [], edges: []`
- 페이징 불필요(전체 스크랩 그래프 한 번에). 스크랩이 매우 많을 때만 추후 상위 N개 캡 논의

**구현 난이도:** 메인 그래프가 이미 엣지를 생성 중이라 **관계 데이터/생성 로직 재사용이면 반나절~하루** 예상. 관계 저장(Neo4j 등)이 있으면 `MATCH (a)-[r]-(b) WHERE a.id IN $scraps AND b.id IN $scraps` 류로 바로 추출 가능.

→ 이 응답만 주면 프론트는 메인 그래프 컴포넌트를 재사용해 **엣지 포함 스크랩 그래프**로 바로 업그레이드합니다. (지금은 엣지 없는 노드 뷰로 선구현)
