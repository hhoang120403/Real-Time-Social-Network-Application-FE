import type { ReactionType } from './reaction';

export type PrivacyType = 'Public' | 'Private' | 'Friends' | '';

export type ReactionsMap = Record<ReactionType, number>;

export interface PostItem {
  _id: string;
  userId: string;
  post: string;
  email: string;
  username: string;
  profilePicture: string;
  avatarColor: string;
  bgColor: string;
  feelings: string;
  privacy: PrivacyType;
  reactions: ReactionsMap;
  commentsCount: number;
  sharesCount?: number;
  savesCount?: number;
  imgId?: string;
  imgVersion?: string;
  videoId?: string;
  videoVersion?: string;
  gifUrl?: string;
  createdAt: string; // nếu muốn strict hơn có thể dùng Date
  sharedPost?: Partial<PostItem>;
}

export interface PostData {
  post: string;
  bgColor: string;
  privacy: string;
  feelings: string;
  gifUrl: string;
  profilePicture: string;
  image?: string;
  imgId?: string;
  imgVersion?: string;
  video?: string;
  videoId?: string;
  videoVersion?: string;
}

export interface Privacy {
  topText: string;
  subText: string;
  icon: React.ReactNode;
}

export interface Feeling {
  index: number;
  name: string;
  image: string;
}
