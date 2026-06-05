import { apiClient } from './client';
import { personaLabel } from '../types';
import type { ApiResponse } from '../types';
import type { FriendProfile } from '../types/game';

// 백엔드 친구 프로필 raw — 직렬화 흔들림(userId vs user_id) + snake 프로필 이미지 + persona enum
interface FriendProfileRaw {
  userId?: number;
  user_id?: number;
  nickname: string;
  level: number;
  persona?: string;
  profile_image_url?: string | null;
}

// raw → UI 모델 정규화 (user_id 통일, persona 한글, 프로필 이미지 흡수)
function toFriend(r: FriendProfileRaw): FriendProfile {
  return {
    user_id: r.userId ?? r.user_id ?? 0,
    nickname: r.nickname,
    level: r.level,
    persona: personaLabel(r.persona),
    profileImageUrl: r.profile_image_url ?? null,
  };
}

// 친구 API — 백엔드 모델: 닉네임 검색 → 친구 요청 → 수락 (양방향 ACCEPTED)
export const friendApi = {
  // 닉네임 완전 일치로 유저 검색 (1명 반환, 없으면 null). 본인은 검색 안 됨.
  searchByNickname: (nickname: string) =>
    apiClient
      .get<ApiResponse<{ user: FriendProfileRaw | null }>>('/api/users/search', {
        params: { nickname },
      })
      .then((r) => (r.data.data?.user ? toFriend(r.data.data.user) : null)),

  // 친구 요청 보내기 (body 키는 camelCase targetUserId — 스펙 준수)
  sendRequest: (targetUserId: number) =>
    apiClient.post<ApiResponse<void>>('/api/friends/request', { targetUserId }),

  // 받은 친구 요청 목록 (PENDING)
  getReceivedRequests: () =>
    apiClient
      .get<ApiResponse<{ friends: FriendProfileRaw[] }>>('/api/friends/received')
      .then((r) => (r.data.data?.friends ?? []).map(toFriend)),

  // 친구 요청 수락
  acceptRequest: (targetUserId: number) =>
    apiClient.post<ApiResponse<void>>('/api/friends/accept', { targetUserId }),

  // 내 친구 목록 (ACCEPTED)
  getFriends: () =>
    apiClient
      .get<ApiResponse<{ friends: FriendProfileRaw[] }>>('/api/friends')
      .then((r) => (r.data.data?.friends ?? []).map(toFriend)),
};
