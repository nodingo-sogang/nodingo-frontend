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
}

export interface QuizListResponse {
  quizzes: QuizResponse[];
}

export interface QuizSubmitRequest {
  /** 선택한 보기 인덱스 (1~4, 1-based) */
  selected_option_index: number;
}

export interface QuizRewardResponse {
  correct: boolean;
  /** 정답 보기 인덱스 (1-based) */
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
