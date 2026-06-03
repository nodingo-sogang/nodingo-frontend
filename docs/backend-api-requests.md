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

## 4. ⚪ (후순위/선택) 소셜 기능 — 기획 확정 시 요청

랭킹 화면에 UI는 있으나 발표용 미리보기 상태. 실제 동작시키려면 필요.

- **툭 건들기(poke):** `POST /api/users/{userId}/poke` → 알림 발송
- **타 유저 지식지도:** `GET /api/users/{userId}/graph` → 그래프 노드/엣지 (본인 그래프 조회와 동일 형태)
- **팔로우:** `POST` · `DELETE /api/users/{userId}/follow`

---

### 우선순위 제안
1. **랭킹(1-1)** — 화면 전체가 mock이라 임팩트 큼
2. **뱃지(1-2)** + **game 확장(2-1)** — 프로필 화면 완성
3. 스크랩 목록(3) 연결 — 프론트 작업 (백엔드 불필요)
4. 소셜(4) — 기획 확정 후
