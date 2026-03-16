export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationPayload {
  message: string;
  type: NotificationType;
}

export interface NotificationItem {
  id: number;
  description: string;
  type: NotificationType;
  icon: string;
  backgroundColor: string;
}
