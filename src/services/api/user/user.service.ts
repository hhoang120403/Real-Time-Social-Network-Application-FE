import { axiosInstance } from '@services/axios';

class UserService {
  async getUserSuggestions() {
    const response = await axiosInstance.get('/user/profile/user/suggestions');
    return response;
  }

  async logoutUser() {
    const response = await axiosInstance.get('/signout');
    return response;
  }

  async checkCurrentUser() {
    const response = await axiosInstance.get('/currentuser');
    return response;
  }

  async getAllUsers(page: number) {
    const response = await axiosInstance.get(`/user/all/${page}`);
    return response;
  }

  async searchUsers(query: string) {
    const response = await axiosInstance.get(`/user/profile/search/${query}`);
    return response;
  }

  async getUserProfileByUserId(userId: string) {
    const response = await axiosInstance.get(`/user/profile/${userId}`);
    return response;
  }

  async getUserProfileByUsername(username: string, userId: string, uId: string) {
    const response = await axiosInstance.get(`/user/profile/posts/${username}/${userId}/${uId}`);
    return response;
  }

  async changePassword(body: any) {
    const response = await axiosInstance.put('/user/profile/change-password', body);
    return response;
  }

  async updateNotificationSettings(settings: any) {
    const response = await axiosInstance.put('/user/profile/settings', settings);
    return response;
  }

  async updateBasicInfo(info: any) {
    const response = await axiosInstance.put('/user/profile/basic-info', info);
    return response;
  }

  async updateSocialLinks(info: any) {
    const response = await axiosInstance.put('/user/profile/social-links', info);
    return response;
  }
}

export const userService = new UserService();
