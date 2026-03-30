import { axiosInstance } from '@services/axios';

class FollowerService {
  async getUserFollowing() {
    const response = await axiosInstance.get('/user/following');
    return response;
  }

  async getUserFollowers(userId: string) {
    const response = await axiosInstance.get(`/user/followers/${userId}`);
    return response;
  }

  async followUser(userId: string) {
    const response = await axiosInstance.put(`/user/follow/${userId}`);
    return response;
  }

  async unfollowUser(floweeId: string, followerId: string) {
    const response = await axiosInstance.put(`/user/unfollow/${floweeId}/${followerId}`);
    return response;
  }

  async blockUser(userId: string) {
    const response = await axiosInstance.put(`/user/block/${userId}`);
    return response;
  }

  async unblockUser(followerId: string) {
    const response = await axiosInstance.put(`/user/unblock/${followerId}`);
    return response;
  }
}

export const followerService = new FollowerService();
