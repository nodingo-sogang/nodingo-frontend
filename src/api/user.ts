import { apiClient } from './client';
import type {
  ApiResponse,
  PersonaListResponse,
  KeywordListResponse,
  OnboardingRequest,
  UserPersona,
} from '../types';

export const userApi = {
  getPersonas: () =>
    apiClient.get<ApiResponse<PersonaListResponse>>('/api/users/keywords/personas'),

  getMacroKeywords: (persona: UserPersona) =>
    apiClient.get<ApiResponse<KeywordListResponse>>('/api/users/keywords/macro', {
      params: { persona },
    }),

  getSpecificKeywords: (macroId: number) =>
    apiClient.get<ApiResponse<KeywordListResponse>>('/api/users/keywords/specific', {
      params: { macroId },
    }),

  postOnboarding: (body: OnboardingRequest) =>
    apiClient.post<ApiResponse<void>>('/api/users/onboarding', body),
};
