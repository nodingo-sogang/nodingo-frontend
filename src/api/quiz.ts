import { apiClient } from './client';
import type {
  ApiResponse,
  QuizListResponse,
  QuizSubmitRequest,
  QuizRewardResponse,
} from '../types';

export const quizApi = {
  // 특정 노드(keyword)의 퀴즈 목록 조회 (정답 제외)
  getQuizzes: (keywordId: number) =>
    apiClient.get<ApiResponse<QuizListResponse>>(
      `/api/graphs/nodes/${keywordId}/quizzes`,
    ),

  // 퀴즈 정답 제출 및 채점/보상
  submit: (keywordId: number, quizId: number, body: QuizSubmitRequest) =>
    apiClient.post<ApiResponse<QuizRewardResponse>>(
      `/api/graphs/nodes/${keywordId}/quizzes/${quizId}/submit`,
      body,
    ),
};
