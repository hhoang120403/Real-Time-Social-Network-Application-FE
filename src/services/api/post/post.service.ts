import type {
  CreateCommentPayload,
  CreateCommentReactionPayload,
  CreateCommentReplyPayload,
  CreateCommentReplyReactionPayload,
  EditCommentPayload,
  EditCommentReplyPayload
} from '@app-types/comments';
import type { PostData } from '@app-types/post';
import type { Reaction, ReactionType } from '@app-types/reaction';
import type { CreateReactionPayload } from '@app-types/reactions';
import { axiosInstance } from '@services/axios';

class PostService {
  async getAllPosts(page: number) {
    const response = await axiosInstance.get(`/post/all/${page}`);
    return response;
  }

  async createPost(body: PostData) {
    const response = await axiosInstance.post('/post', body);
    return response;
  }

  async createPostWithImage(body: PostData) {
    const response = await axiosInstance.post('/post/image/post', body);
    return response;
  }

  async createPostWithVideo(body: PostData) {
    const response = await axiosInstance.post('/post/video/post', body);
    return response;
  }

  async updatePostWithImage(postId: string, body: PostData) {
    const response = await axiosInstance.put(`/post/image/${postId}`, body);
    return response;
  }

  async updatePostWithVideo(postId: string, body: PostData) {
    const response = await axiosInstance.put(`/post/video/${postId}`, body);
    return response;
  }

  async updatePost(postId: string, body: PostData) {
    const response = await axiosInstance.put(`/post/${postId}`, body);
    return response;
  }

  async getReactionsByUsername(username: string) {
    const response = await axiosInstance.get(`/post/reactions/username/${username}`);
    return response;
  }

  async getPostReactions(postId: string) {
    const response = await axiosInstance.get(`/post/reactions/${postId}`);
    return response;
  }

  async getSinglePostReactionByUsername(postId: string, username: string) {
    const response = await axiosInstance.get(`/post/single/reaction/username/${username}/${postId}`);
    return response;
  }

  async getPostCommentsNames(postId: string) {
    const response = await axiosInstance.get(`/post/comments/names/${postId}`);
    return response;
  }

  async getPostComments(postId: string) {
    const response = await axiosInstance.get(`/post/comments/${postId}`);
    return response;
  }

  async getPostsWithImages(page: number) {
    const response = await axiosInstance.get(`/post/images/${page}`);
    return response;
  }

  async getPostsWithVideos(page: number) {
    const response = await axiosInstance.get(`/post/videos/${page}`);
    return response;
  }

  async addReaction(body: CreateReactionPayload) {
    const response = await axiosInstance.post('/post/reaction', body);
    return response;
  }

  async removeReaction(postId: string, previousReaction: ReactionType, postReactions: Reaction) {
    const response = await axiosInstance.delete(
      `/post/reaction/${postId}/${previousReaction}/${JSON.stringify(postReactions)}`
    );
    return response;
  }

  async addComment(body: CreateCommentPayload) {
    const response = await axiosInstance.post('/post/comment', body);
    return response;
  }

  async addCommentReaction(body: CreateCommentReactionPayload) {
    const response = await axiosInstance.put('/post/comment/reaction', body);
    return response;
  }

  async addCommentReply(body: CreateCommentReplyPayload) {
    const response = await axiosInstance.post('/post/comment/reply', body);
    return response;
  }

  async addCommentReplyReaction(body: CreateCommentReplyReactionPayload) {
    const response = await axiosInstance.put('/post/comment/reply/reaction', body);
    return response;
  }

  async editComment(postId: string, commentId: string, body: EditCommentPayload) {
    const response = await axiosInstance.put(`/post/comment/${postId}/${commentId}`, body);
    return response;
  }

  async deleteComment(postId: string, commentId: string) {
    const response = await axiosInstance.delete(`/post/comment/${postId}/${commentId}`);
    return response;
  }

  async editCommentReply(postId: string, commentId: string, replyId: string, body: EditCommentReplyPayload) {
    const response = await axiosInstance.put('/post/comment/reply', {
      ...body,
      postId,
      commentId,
      replyId
    });
    return response;
  }

  async deleteCommentReply(postId: string, commentId: string, replyId: string) {
    const response = await axiosInstance.delete(`/post/comment/${postId}/${commentId}/reply/${replyId}`);
    return response;
  }

  async deletePost(postId: string) {
    const response = await axiosInstance.delete(`/post/${postId}`);
    return response;
  }

  async sharePost(postId: string, body: { post: string; privacy?: string; feelings?: string }) {
    const response = await axiosInstance.post(`/post/share/${postId}`, body);
    return response;
  }

  async getPostShares(postId: string) {
    const response = await axiosInstance.get(`/post/shares/${postId}`);
    return response;
  }

  async getPostSaves(postId: string) {
    const response = await axiosInstance.get(`/post/saves/${postId}`);
    return response;
  }
}

export const postService = new PostService();
