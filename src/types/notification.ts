export type NotificationType = 'follows' | 'reactions' | 'comments' | 'messages';

export interface NotificationUser {
  profilePicture: string;
  username: string;
  avatarColor: string;
  uId: string;
}

export interface NotificationItem {
  _id: string;
  userTo: string;
  userFrom: NotificationUser;
  read: boolean;
  message: string;
  notificationType: NotificationType;
  entityId: string;
  createdItemId: string;
  comment: string;
  reaction: string;
  post: string;
  imgId: string;
  imgVersion: string;
  gifUrl: string;
  commentImage?: string;
  commentGif?: string;
  createdAt: string;
}
