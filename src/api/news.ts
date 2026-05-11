import { apiClient } from './client';
import type { ApiResponse, NewsDetailResponse } from '../types';

export const newsApi = {
  getDetail: (newsId: number) =>
    apiClient.get<ApiResponse<NewsDetailResponse>>(`/api/news/${newsId}`),

  scrap: (newsId: number) =>
    apiClient.post<ApiResponse<void>>(`/api/news/${newsId}/scrap`),

  unscrap: (newsId: number) =>
    apiClient.delete<ApiResponse<void>>(`/api/news/${newsId}/scrap`),
};
