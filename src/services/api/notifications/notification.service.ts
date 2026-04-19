import { axiosInstance } from '@services/axios';

class NotificationService {
  async getUserNotifications() {
    const response = await axiosInstance.get('/notifications');
    return response;
  }

  async markNotificationAsRead(notificationId: string) {
    const response = await axiosInstance.put(`/notification/${notificationId}`);
    return response;
  }

  async deleteNotification(notificationId: string) {
    const response = await axiosInstance.delete(`/notification/${notificationId}`);
    return response;
  }
  async markAllNotificationsAsRead() {
    const response = await axiosInstance.put('/notifications');
    return response;
  }
}

export const notificationService = new NotificationService();
