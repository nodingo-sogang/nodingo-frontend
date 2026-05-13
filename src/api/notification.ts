import { apiClient } from './client';
import type { ApiResponse, NotificationRequest } from '../types';

export const notificationApi = {
  saveSetting: (body: NotificationRequest) =>
    apiClient.post<ApiResponse<void>>('/api/notification/setting', body),
};
