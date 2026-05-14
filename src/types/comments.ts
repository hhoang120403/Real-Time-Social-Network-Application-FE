export interface CreateCommentPayload {
  userTo: string;
  postId: string;
  comment: string;
  image?: string;
  gifUrl?: string;
  commentsCount: number;
  profilePicture: string;
}

export interface CreateCommentReactionPayload {
  postId: string;
  commentId: string;
  type: string;
  previousReaction?: string;
  profilePicture: string;
}

export interface CreateCommentReplyPayload {
  postId: string;
  commentId: string;
  comment: string;
  image?: string;
  gifUrl?: string;
  profilePicture: string;
}

export interface CreateCommentReplyReactionPayload {
  postId: string;
  commentId: string;
  replyId: string;
  type: string;
  previousReaction?: string;
  profilePicture: string;
}

export interface EditCommentPayload {
  comment: string;
}

export interface EditCommentReplyPayload {
  postId?: string;
  commentId?: string;
  replyId?: string;
  comment: string;
}
