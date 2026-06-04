import { apiClient } from './client';
import type { ApiResponse, RankingListResponse } from '../types';

export type RankingScope = 'FRIENDS' | 'PERSONA';

export const rankingApi = {
  // 주간 리더보드 (scope: 친구 / 관심분야)
  getRanking: (scope: RankingScope, page = 0) =>
    apiClient.get<ApiResponse<RankingListResponse>>('/api/users/ranking', {
      params: { scope, page },
    }),
};