import { apiClient } from './client';
import type {
  ApiResponse,
  GameProfileResponse,
  UserProgressResponse,
  BadgeListResponse,
} from '../types';

export const gameApi = {
  // 게임 프로필 (레벨/XP/티어/스트릭 + 일일 목표)
  getProfile: () =>
    apiClient.get<ApiResponse<GameProfileResponse>>('/api/users/game'),

  // 내 탐험 진행률 조회 (호출 시 서버에서 출석 체크/보상 처리됨)
  getProgress: () =>
    apiClient.get<ApiResponse<UserProgressResponse>>('/api/users/progress'),

  // 내 뱃지 목록 (서버가 획득 판정·저장)
  getBadges: () =>
    apiClient.get<ApiResponse<BadgeListResponse>>('/api/users/badges'),
};
