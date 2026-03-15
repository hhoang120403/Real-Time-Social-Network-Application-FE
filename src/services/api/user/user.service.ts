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
}

export const userService = new UserService();
