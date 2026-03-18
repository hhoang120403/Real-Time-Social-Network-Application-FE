import type { Reaction } from './reaction';

export type PrivacyType = 'Public' | 'Private' | 'Friends';

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
  reactions: Reaction;
  commentsCount: number;
  imgId: string;
  imgVersion: string;
  videoId: string;
  videoVersion: string;
  gifUrl: string;
  createdAt: string; // nếu muốn strict hơn có thể dùng Date
}

interface PostData {
  post: string;
  bgColor: string;
  privacy: string;
  feelings: string;
  gifUrl: string;
  profilePicture: string;
  image?: string;
}

interface Privacy {
  topText: string;
  subText: string;
  icon: React.ReactNode;
}

interface Feeling {
  index: number;
  name: string;
  image: string;
}

export type { PostData, Privacy, Feeling };
