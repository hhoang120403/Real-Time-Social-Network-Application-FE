import type { reactionsMap } from '@services/utils/static.data';

export interface IReaction {
  senderName: string;
  type: string;
}

export type ReactionType = keyof typeof reactionsMap;
