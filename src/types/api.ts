import type { NotificationItem } from './notification';
import type { PostItem } from './post';
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

export interface GetAllPostsResponse {
  message: string;
  posts: PostItem[];
  totalPosts: number;
}
