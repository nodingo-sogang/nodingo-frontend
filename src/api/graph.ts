import { apiClient } from './client';
import type { ApiResponse, TabListResponse, GraphDataResponse, NodeSummaryResponse } from '../types';

export const graphApi = {
  getTabs: () =>
    apiClient.get<ApiResponse<TabListResponse>>('/api/graphs/tabs'),

  getGraphData: (keywordId: number) =>
    apiClient.get<ApiResponse<GraphDataResponse>>('/api/graphs/nodes', {
      params: { keywordId },
    }),

  getNodeSummary: (nodeId: number) =>
    apiClient.get<ApiResponse<NodeSummaryResponse>>(`/api/graphs/nodes/${nodeId}/summaries`),

  scrapKeyword: (keywordId: number) =>
    apiClient.post<ApiResponse<void>>(`/api/keywords/${keywordId}/scrap`),

  unscrapKeyword: (keywordId: number) =>
    apiClient.delete<ApiResponse<void>>(`/api/keywords/${keywordId}/scrap`),
};
