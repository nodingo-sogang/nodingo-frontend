import { apiClient } from './client';
import type { ApiResponse, TokenPair } from '../types';

export const authApi = {
  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<TokenPair>>('/api/auth/refresh', { refresh_token: refreshToken }),

  logout: () =>
    apiClient.post<ApiResponse<void>>('/api/auth/logout'),

  // 회원 탈퇴 — 네이버 연동 해제 + 모든 데이터 영구 삭제 (Bearer 토큰 자동 첨부)
  withdraw: () =>
    apiClient.delete<ApiResponse<void>>('/api/auth/withdraw'),

  naverLoginUrl: () => {
    const base = import.meta.env.VITE_BACKEND_URL ?? '';
    return `${base}/oauth2/authorization/naver`;
  },
};
