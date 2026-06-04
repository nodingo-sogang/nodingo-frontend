import { create } from 'zustand';
import { tokenStorage } from '../api/client';
import { authApi } from '../api/auth';

interface AuthState {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  login: (accessToken: string, refreshToken: string, onboarded?: boolean) => void;
  logout: () => Promise<void>;
  withdraw: () => Promise<void>;
  setOnboarded: () => void;
}

const ONBOARDED_KEY = 'nd_onboarded';

// 세션 종료(로그아웃/탈퇴) 시 로컬에 남는 흔적 제거
function clearLocalSession() {
  tokenStorage.clear();
  localStorage.removeItem(ONBOARDED_KEY);
  localStorage.removeItem('nodingo_last_visit');
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!tokenStorage.getAccess(),
  isOnboarded: localStorage.getItem(ONBOARDED_KEY) === 'true',

  login: (accessToken, refreshToken, onboarded = false) => {
    tokenStorage.set(accessToken, refreshToken);
    if (onboarded) localStorage.setItem(ONBOARDED_KEY, 'true');
    set({ isAuthenticated: true, isOnboarded: onboarded });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore — clear locally regardless
    }
    clearLocalSession();
    set({ isAuthenticated: false, isOnboarded: false });
    // 전체 리로드: 메모리 캐시(React Query 등)까지 초기화해 이전 계정 데이터 잔존 방지
    window.location.href = '/login';
  },

  withdraw: async () => {
    try {
      await authApi.withdraw();
    } catch {
      // 실패해도 로컬은 정리 (재시도 시 토큰 만료 등)
    }
    clearLocalSession();
    set({ isAuthenticated: false, isOnboarded: false });
    window.location.href = '/login';
  },

  setOnboarded: () => {
    localStorage.setItem(ONBOARDED_KEY, 'true');
    set({ isOnboarded: true });
  },
}));
