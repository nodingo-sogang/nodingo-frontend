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
