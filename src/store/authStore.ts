import { create } from 'zustand';
import { tokenStorage } from '../api/client';
import { authApi } from '../api/auth';

interface AuthState {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  login: (accessToken: string, refreshToken: string, onboarded?: boolean) => void;
  logout: () => Promise<void>;
  setOnboarded: () => void;
}

const ONBOARDED_KEY = 'nd_onboarded';

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
    tokenStorage.clear();
    localStorage.removeItem(ONBOARDED_KEY);
    set({ isAuthenticated: false, isOnboarded: false });
  },

  setOnboarded: () => {
    localStorage.setItem(ONBOARDED_KEY, 'true');
    set({ isOnboarded: true });
  },
}));
