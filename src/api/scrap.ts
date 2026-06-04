import { apiClient } from './client';
import type { ApiResponse, NodeSummaryResponse } from '../types';

// Spring Slice 응답에서 content만 사용
interface SummarySlice {
  content: NodeSummaryResponse[];
  last?: boolean;
}
interface NodeSlice {
  content: { id: number; word: string; persona: string }[];
  last?: boolean;
}

export const scrapApi = {
  // 스크랩한 키워드 요약 목록 (보관함 카드용, 4개씩)
  getScrapSummaries: (page = 0) =>
    apiClient.get<ApiResponse<SummarySlice>>('/api/users/scraps/keywords/summaries', {
      params: { page },
    }),

  // 스크랩한 키워드 노드 목록 (그래프용, 20개씩)
  getScrapNodes: (page = 0) =>
    apiClient.get<ApiResponse<NodeSlice>>('/api/users/scraps/keywords/nodes', {
      params: { page },
    }),
};