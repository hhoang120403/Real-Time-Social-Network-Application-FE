type ReactionType = 'like' | 'love' | 'wow' | 'sad' | 'happy' | 'angry';
type PreviousReaction = ReactionType | '';

interface PostReactionsCount {
  like: number;
  love: number;
  happy: number;
  angry: number;
  sad: number;
  wow: number;
}

export interface IReaction {
  _id?: string;
  postId: string;
  type: ReactionType;
  username: string;
  avatarColor: string;
  profilePicture: string;
  createdAt: string;
  __v?: number;
}

export interface FormattedReaction {
  type: ReactionType;
  value: number;
}

export interface CreateReactionPayload {
  userTo: string;
  postId: string;
  type: ReactionType;
  previousReaction: PreviousReaction;
  postReactions: PostReactionsCount;
  profilePicture: string;
}
