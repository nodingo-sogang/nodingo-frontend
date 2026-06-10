// ─── Auth ────────────────────────────────────────────────────────────────────

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export interface ReissueTokenRequest {
  refresh_token: string;
}

// ─── API Response wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T | null;
}

export interface Pageable {
  page_number: number;
  page_size: number;
  sort: string[];
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface PageResponse<T> {
  content: T[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface SliceResponse<T> {
  content: T[];
  hasNext: boolean;
}

// ─── User / Onboarding ───────────────────────────────────────────────────────

export interface UserProfileResponse {
  name: string;
  email: string;
}

export type UserPersona =
  | 'POLITICS'
  | 'ECONOMY'
  | 'TECHNOLOGY'
  | 'SOCIETY'
  | 'CULTURE'
  | 'INTERNATIONAL';

export const PERSONA_LABEL: Record<UserPersona, string> = {
  POLITICS: '정치',
  ECONOMY: '경제',
  TECHNOLOGY: '기술',
  SOCIETY: '사회',
  CULTURE: '문화',
  INTERNATIONAL: '국제',
};

/** 페르소나 enum 코드(POLITICS 등) → 한글 라벨(정치). 이미 한글이거나 미지정 enum이면 원문 유지. */
export function personaLabel(p?: string | null): string | undefined {
  if (!p) return undefined;
  return PERSONA_LABEL[p as UserPersona] ?? p;
}

export interface PersonaResponse {
  name: UserPersona;
  description: string;
}

export interface PersonaListResponse {
  contents: PersonaResponse[];
}

export interface KeywordResponse {
  id: number;
  word: string;
}

export interface KeywordListResponse {
  contents: KeywordResponse[];
}

export interface OnboardingInterest {
  macro_keyword_id: number;
  specific_keyword_ids: number[];
}

export interface OnboardingRequest {
  personas: UserPersona[];
  interest: OnboardingInterest;
}

// ─── Graph ────────────────────────────────────────────────────────────────────

export interface TabResponse {
  keyword_id: number;
  word: string;
  persona: string;
}

export interface TabListResponse {
  tabs: TabResponse[];
}

export interface GraphNodeResponse {
  id: number;
  label: string;
  score: number;
  summary: string;
  persona: string;

  // ── 게이미피케이션 필드 (백엔드 GraphNodeResponse) ──
  // 백엔드가 반환하면 채워지고, mock/구버전 응답에서는 undefined 일 수 있음
  unlock_level?: number;
  visibility?: string;
  explored?: boolean;
  scrapped?: boolean;
  news_count?: number;
}

export interface GraphEdgeResponse {
  source: number;
  target: number;
  weight: number;
}

export interface GraphDataResponse {
  nodes: GraphNodeResponse[];
  edges: GraphEdgeResponse[];
}

export interface NewsItemBrief {
  id: number;
  title: string;
  url?: string;
  outlet?: string;
  date?: string;
  snippet?: string;
}

export interface NodeSummaryResponse {
  keyword_id: number;
  word: string;
  persona: string;
  summary: string;
  /** 뉴스 무한 스크롤 페이징: 다음 페이지 존재 여부 */
  has_next?: boolean;
  news?: NewsItemBrief[];
}

// ─── News ─────────────────────────────────────────────────────────────────────

export interface NewsDetailResponse {
  id: number;
  title: string;
  body: string;
  url: string;
  date_time_pub: string;
  keywords: string[];
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface OnboardingStatusResponse {
  status: 'COMPLETED' | 'PENDING';
}

export interface NotificationSettingResponse {
  notify_hour: number | null;
  configured: boolean;
}

export interface UpdateNotificationTimeRequest {
  notify_hour: number;
}

export interface UpdateFcmTokenRequest {
  fcm_token: string;
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export interface QuizResponse {
  quiz_id: number;
  question: string;
  options: string[];
  source_outlet: string;
  /** 백엔드 포맷: "yyyy.MM.dd" */
  source_date: string;
  source_url: string;
  /** 내가 이미 제출(풀이)한 퀴즈인지 — 재제출(400) 방지용 선제 표시 */
  solved?: boolean;
}

export interface QuizListResponse {
  quizzes: QuizResponse[];
}

export interface QuizSubmitRequest {
  /** 선택한 보기 인덱스 — 백엔드 검증이 1-based(1~4)를 요구함 (@Min(1)@Max(4)) */
  selected_option_index: number;
}

export interface QuizRewardResponse {
  /** ⚠️ 백엔드 채점 버그(0-based 정답 vs 1-based 제출 불일치)로 신뢰 불가 — 프론트에서 직접 판정 */
  correct: boolean;
  /** 정답 보기 인덱스 (0-based, 0~3) */
  correct_answer_index: number;
  earned_xp: number;
  total_xp: number;
  level: number;
  level_up: boolean;
  new_badges: string[];
  unlocked_nodes: number[];
}

// ─── Game / Progress ──────────────────────────────────────────────────────────

export interface UserGameResponse {
  level: number;
  xp: number;
  xp_needed: number;
  tier: string;
  streak: number;
  /** 유저 표시 닉네임 (네이버 프로필 기반) */
  nickname: string;
  /** 네이버 프로필 이미지 URL (없을 수 있음) */
  profile_image_url?: string | null;
  /** 누적 정답 퀴즈 수 (daily 아님, 전체 통계) */
  total_quizzes_solved: number;
}

export interface DailyGoalsResponse {
  quizzes_completed: number;
  quizzes_required: number;
  completed: boolean;
}

export interface GameProfileResponse {
  user_game: UserGameResponse;
  daily_goals: DailyGoalsResponse;
}

/** GET /api/users/progress — 내 탐험 진행률 (출석 체크 포함) */
export interface UserProgressResponse {
  explored_count: number;
  total_count: number;
  progress_rate: number;
}

// ─── Ranking ───────────────────────────────────────────────────────────────────

/** GET /api/users/ranking 항목 */
export interface RankingEntryResponse {
  rank: number;
  nickname: string;
  level: number;
  /** 정식은 snake_case(week_xp). 일부 응답이 camelCase(weekXp)로 와도 수용 */
  week_xp?: number;
  weekXp?: number;
  /** 페르소나 enum 코드 (POLITICS/ECONOMY/...). 표시는 PERSONA_LABEL로 한글 변환 */
  persona?: string;
  /** 네이버 프로필 이미지 URL (wire=snake, OpenAPI=camel 둘 다 수용) */
  profile_image_url?: string | null;
  profileImageUrl?: string | null;
  /** 백엔드 boolean 직렬화 흔들림 대응: is_me / me / isMe 모두 수용 */
  is_me?: boolean;
  me?: boolean;
  isMe?: boolean;
}

/** GET /api/users/ranking?scope=FRIENDS|PERSONA */
export interface RankingListResponse {
  scope: string;
  period: string;
  entries: RankingEntryResponse[];
  /** 정식은 snake_case(my_entry). camelCase(myEntry)로 와도 수용 */
  my_entry?: RankingEntryResponse | null;
  myEntry?: RankingEntryResponse | null;
}

// ─── Badges ────────────────────────────────────────────────────────────────────

/** GET /api/users/badges 항목 */
export interface BadgeResponse {
  id: string;
  name: string;
  category: string;
  description: string;
  condition: string;
  earned: boolean;
  earned_at: string | null;
}

export interface BadgeListResponse {
  badges: BadgeResponse[];
}
