import { apiClient } from './client';
import type { ApiResponse } from '../types';
import type { Friend } from '../types/game';

// 친구 (초대 코드 방식) API — 백엔드 미구현 상태(요청서 docs/backend-api-requests.md 4번)
// 현재는 스텁. 백엔드 준비되면 컴포넌트에서 try→catch(mock) 패턴으로 연결만 하면 됨.
export const friendApi = {
  // 내 초대 코드 조회 (없으면 서버가 생성해서 반환)
  getMyInviteCode: () =>
    apiClient.get<ApiResponse<{ invite_code: string }>>('/api/users/me/invite-code'),

  // 초대 코드로 친구 추가 (양방향)
  addFriend: (inviteCode: string) =>
    apiClient.post<ApiResponse<Friend>>('/api/users/friends', { invite_code: inviteCode }),

  // 내 친구 목록
  getFriends: () =>
    apiClient.get<ApiResponse<{ friends: Friend[] }>>('/api/users/friends'),

  // 친구 삭제
  removeFriend: (userId: number) =>
    apiClient.delete<ApiResponse<void>>(`/api/users/friends/${userId}`),
};
