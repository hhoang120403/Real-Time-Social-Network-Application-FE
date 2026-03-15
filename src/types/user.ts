export interface IUserNotifications {
  messages: boolean;
  reactions: boolean;
  comments: boolean;
  follows: boolean;
}

export interface IUserSocial {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
}

export interface IUser {
  _id: string;
  authId: string;
  username: string;
  uId: string;
  email: string;
  profilePicture: string;
  avatarColor: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  blocked: string[];
  blockedBy: string[];
  notifications: IUserNotifications;
  social: IUserSocial;
  work: string;
  school: string;
  location: string;
  quote: string;
  bgImageVersion: string;
  bgImageId: string;
  createdAt: string;
}
