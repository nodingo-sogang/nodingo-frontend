import { apiClient } from './client';
import type {
  ApiResponse,
  NotificationSettingResponse,
  UpdateNotificationTimeRequest,
  UpdateFcmTokenRequest,
} from '../types';

export const notificationApi = {
  getSetting: () =>
    apiClient.get<ApiResponse<NotificationSettingResponse>>('/api/users/notifications'),

  updateTime: (body: UpdateNotificationTimeRequest) =>
    apiClient.patch<ApiResponse<void>>('/api/users/notifications/time', body),

  updateFcmToken: (body: UpdateFcmTokenRequest) =>
    apiClient.patch<ApiResponse<void>>('/api/users/notifications/token', body),
};
