import { axiosInstance } from '../../axios';

class AuthService {
  async signUp(data: any) {
    const response = await axiosInstance.post('/signup', data);
    return response;
  }

  async signIn(data: any) {
    const response = await axiosInstance.post('/signin', data);
    return response;
  }

  async forgotPassword(email: string) {
    const response = await axiosInstance.post('/forgot-password', { email });
    return response;
  }

  async resetPassword(token: string, data: any) {
    const response = await axiosInstance.post(`/reset-password/${token}`, data);
    return response;
  }
}

export const authService = new AuthService();
