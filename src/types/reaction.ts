import type { reactionsMap } from '@services/utils/static.data';

export interface Reaction {
  like: number;
  love: number;
  happy: number;
  angry: number;
  sad: number;
  wow: number;
}

export interface IReaction {
  senderName: string;
  type: string;
}

export type ReactionType = keyof typeof reactionsMap;
