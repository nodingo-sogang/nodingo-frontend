import { apiClient } from './client';
import type { ApiResponse, TokenPair } from '../types';

export const authApi = {
  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<TokenPair>>('/api/auth/refresh', { refresh_token: refreshToken }),

  logout: () =>
    apiClient.post<ApiResponse<void>>('/api/auth/logout'),

  naverLoginUrl: () => {
    const base = import.meta.env.VITE_API_BASE_URL ?? '';
    return `${base}/oauth2/authorization/naver`;
  },
};
