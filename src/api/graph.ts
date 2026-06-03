import { apiClient } from './client';
import type { ApiResponse, TabListResponse, GraphDataResponse, NodeSummaryResponse } from '../types';

export const graphApi = {
  getTabs: () =>
    apiClient.get<ApiResponse<TabListResponse>>('/api/graphs/tabs'),

  getGraphData: (keywordId: number) =>
    apiClient.get<ApiResponse<GraphDataResponse>>('/api/graphs/nodes', {
      params: { keywordId },
    }),

  // 노드 요약 + 관련 뉴스 (뉴스 무한 스크롤 페이징: page 0부터)
  getNodeSummary: (nodeId: number, page = 0) =>
    apiClient.get<ApiResponse<NodeSummaryResponse>>(`/api/graphs/nodes/${nodeId}/summaries`, {
      params: { page },
    }),

  // 노드 탐험 기록 저장 (서버 측 explored/visibility 갱신)
  exploreNode: (keywordId: number) =>
    apiClient.post<ApiResponse<void>>(`/api/graphs/nodes/${keywordId}/explore`),

  scrapKeyword: (keywordId: number) =>
    apiClient.post<ApiResponse<void>>(`/api/keywords/${keywordId}/scrap`),

  unscrapKeyword: (keywordId: number) =>
    apiClient.delete<ApiResponse<void>>(`/api/keywords/${keywordId}/scrap`),
};
