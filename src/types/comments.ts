export interface CreateCommentPayload {
  userTo: string;
  postId: string;
  comment: string;
  commentsCount: number;
  profilePicture: string;
}
