import type { NotificationItem } from './notification';
import type { IUser } from './user';

export interface LoginResponse {
  message: string;
  user: IUser;
  token: string;
}

export interface NotificationsResponse {
  message: string;
  notifications: NotificationItem[];
}
