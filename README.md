# nodingo-frontend

뉴스 키워드 그래프 기반 뉴스 추천 서비스 **Nodingo**의 프론트엔드입니다.

---

## 기술 스택

| 항목 | 내용 |
|---|---|
| 프레임워크 | React 18 + TypeScript |
| 빌드 도구 | Vite 6 |
| 라우팅 | React Router v7 |
| 서버 상태 | TanStack Query v5 |
| 클라이언트 상태 | Zustand v5 |
| HTTP 클라이언트 | Axios |
| 스타일 | CSS Modules |

---

## 실행 방법

```bash
npm install
npm run dev
```

`.env` 파일을 프로젝트 루트에 생성하세요. (`.env.example` 참고)

```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## 프로젝트 구조

```
src/
├── api/               # API 호출 함수
│   ├── client.ts      # Axios 인스턴스, 토큰 자동 갱신 인터셉터
│   ├── auth.ts        # 인증 API (refresh, logout)
│   ├── graph.ts       # 그래프/키워드 API
│   ├── news.ts        # 뉴스 API (스크랩 포함)
│   └── user.ts        # 유저 온보딩/설정 API
├── components/
│   ├── common/
│   │   ├── BottomSheet.tsx   # 슬라이드업 시트
│   │   └── Button.tsx        # 공통 버튼
│   └── layout/
│       ├── BottomNav.tsx     # 하단 탭 네비게이션
│       └── Navigation.tsx    # 상단 네비게이션
├── pages/
│   ├── LandingPage.tsx       # 시작 화면
│   ├── LoginPage.tsx         # 로그인 (Google OAuth2)
│   ├── OAuthCallbackPage.tsx # OAuth 콜백 처리
│   ├── OnboardingPage.tsx    # 페르소나/키워드 관심사 선택
│   └── GraphPage.tsx         # 메인 그래프 화면
├── store/
│   └── authStore.ts          # 인증 상태 (Zustand)
├── types/
│   └── index.ts              # 공통 타입 정의
└── mocks/
    └── index.ts              # 개발용 목업 데이터
```

---

## 라우팅

| 경로 | 페이지 | 접근 조건 |
|---|---|---|
| `/` | LandingPage | 누구나 |
| `/login` | LoginPage | 누구나 |
| `/auth/callback` | OAuthCallbackPage | 누구나 |
| `/onboarding` | OnboardingPage | 로그인 필요 |
| `/graph` | GraphPage | 로그인 + 온보딩 완료 |

---

## 인증 흐름

1. Google OAuth2 로그인 → `/auth/callback`에서 access/refresh 토큰 수신
2. 토큰은 `localStorage`에 저장 (`nd_access_token`, `nd_refresh_token`)
3. 모든 API 요청에 `Authorization: Bearer {accessToken}` 자동 첨부
4. 401 응답 시 refresh 토큰으로 자동 재발급, 대기 중인 요청 큐 처리

---

## 주요 기능 구현 현황

### 그래프 화면 (`/graph`)

- **키워드 탭**: 관심사 기반 소분류 키워드 목록 (`GET /api/graphs/tabs`)
- **노드 그래프**: 키워드 연관 관계 시각화, 연결 강도에 따른 엣지 굵기 (`GET /api/graphs/nodes`)
- **Pan / Zoom**: 포인터 드래그로 이동, 마우스 휠·핀치로 확대/축소
- **노드 클릭**: BottomSheet에서 키워드 요약 표시 (`GET /api/graphs/nodes/{nodeId}/summaries`)

### 키워드 스크랩

- 노드 BottomSheet 내 **스크랩 버튼**으로 키워드 스크랩/해제
- 스크랩 상태는 낙관적 업데이트로 즉시 반영 (API 응답 대기 없음)
- 하단 **스크랩 탭**에서 스크랩한 키워드 카드 목록 확인 및 해제 가능

> **백엔드 연결 대기 중**: `POST /DELETE /api/keywords/{keywordId}/scrap` 미구현.
> UI는 완성된 상태이며 백엔드 API 배포 시 자동 연결됩니다.

### 온보딩

- 페르소나(대분류) 선택 → 관심 키워드(중분류/소분류) 선택 → 저장 (`POST /api/users/onboarding`)

---

## API 연동 현황

| API | 메서드 | 상태 |
|---|---|---|
| `POST /api/auth/refresh` | 토큰 재발급 | ✅ 연결 |
| `POST /api/auth/logout` | 로그아웃 | ✅ 연결 |
| `GET /api/users/keywords/personas` | 페르소나 목록 | ✅ 연결 |
| `GET /api/users/keywords/macro` | 중분류 키워드 목록 | ✅ 연결 |
| `GET /api/users/keywords/specific` | 소분류 키워드 목록 | ✅ 연결 |
| `POST /api/users/onboarding` | 온보딩 저장 | ✅ 연결 |
| `GET /api/graphs/tabs` | 소분류 키워드 탭 목록 | ✅ 연결 |
| `GET /api/graphs/nodes` | 그래프 노드/엣지 데이터 | ✅ 연결 |
| `GET /api/graphs/nodes/{nodeId}/summaries` | 노드 요약 | ✅ 연결 |
| `POST /api/news/{newsId}/scrap` | 뉴스 스크랩 | ✅ 연결 |
| `DELETE /api/news/{newsId}/scrap` | 뉴스 스크랩 해제 | ✅ 연결 |
| `POST /api/keywords/{keywordId}/scrap` | 키워드 스크랩 | ⏳ 백엔드 미구현 |
| `DELETE /api/keywords/{keywordId}/scrap` | 키워드 스크랩 해제 | ⏳ 백엔드 미구현 |
