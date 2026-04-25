import { axiosInstance } from '@services/axios';

class CollectionService {
  async getCollections() {
    const response = await axiosInstance.get('/collections');
    return response;
  }

  async getCollectionPosts(collectionId: string) {
    const response = await axiosInstance.get(`/collections/${collectionId}`);
    return response;
  }

  async createCollection(body: { name: string; postId?: string }) {
    const response = await axiosInstance.post('/collections', body);
    return response;
  }

  async updatePostCollections(body: { postId: string; collectionIds: string[] }) {
    const response = await axiosInstance.put('/collections/posts', body);
    return response;
  }

  async deleteCollection(collectionId: string) {
    const response = await axiosInstance.delete(`/collections/${collectionId}`);
    return response;
  }
}

export const collectionService = new CollectionService();
