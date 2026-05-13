// ─── Auth ────────────────────────────────────────────────────────────────────

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ReissueTokenRequest {
  refreshToken: string;
}

// ─── API Response wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T | null;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface SliceResponse<T> {
  content: T[];
  hasNext: boolean;
}

// ─── User / Onboarding ───────────────────────────────────────────────────────

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
  macroKeywordId: number;
  specificKeywordIds: number[];
}

export interface OnboardingRequest {
  personas: UserPersona[];
  interest: OnboardingInterest;
}

// ─── Graph ────────────────────────────────────────────────────────────────────

export interface TabResponse {
  keywordId: number;
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

export interface NodeSummaryResponse {
  keywordId: number;
  word: string;
  persona: string;
  summary: string;
}

// ─── News ─────────────────────────────────────────────────────────────────────

export interface NewsDetailResponse {
  id: number;
  title: string;
  body: string;
  url: string;
  dateTimePub: string;
  keywords: string[];
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface NotificationRequest {
  notifyHour: number;
  fcmToken: string;
}
