import { apiClient } from './client';
import type { ApiResponse } from '../types';
import type { FriendProfile } from '../types/game';

// 친구 API — 백엔드 모델: 닉네임 검색 → 친구 요청 → 수락 (양방향)
export const friendApi = {
  // 닉네임으로 유저 검색 (1명 반환)
  searchByNickname: (nickname: string) =>
    apiClient.get<ApiResponse<{ user: FriendProfile | null }>>('/api/users/search', {
      params: { nickname },
    }),

  // 친구 요청 보내기
  sendRequest: (targetUserId: number) =>
    apiClient.post<ApiResponse<void>>('/api/friends/request', { target_user_id: targetUserId }),

  // 받은 친구 요청 목록
  getReceivedRequests: () =>
    apiClient.get<ApiResponse<{ friends: FriendProfile[] }>>('/api/friends/received'),

  // 친구 요청 수락
  acceptRequest: (targetUserId: number) =>
    apiClient.post<ApiResponse<void>>('/api/friends/accept', { target_user_id: targetUserId }),

  // 내 친구 목록 (수락된)
  getFriends: () =>
    apiClient.get<ApiResponse<{ friends: FriendProfile[] }>>('/api/friends'),
};