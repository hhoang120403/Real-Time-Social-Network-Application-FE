import { axiosInstance } from '@services/axios';

class ImageService {
  async getUserImages(userId: string) {
    const response = await axiosInstance.get(`/images/${userId}`);
    return response;
  }

  async addImage(url: string, data: any) {
    const response = await axiosInstance.post(url, { image: data });
    return response;
  }

  async removeImage(url: string) {
    const response = await axiosInstance.delete(url);
    return response;
  }
}

export const imageService = new ImageService();
