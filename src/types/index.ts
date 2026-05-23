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
