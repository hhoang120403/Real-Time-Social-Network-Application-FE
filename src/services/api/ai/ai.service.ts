import { axiosInstance } from '@services/axios';

class AIService {
  public async generateCaption(body: any) {
    const response = await axiosInstance.post('/ai/generate-caption', body);
    return response;
  }

  public async checkContent(body: { text: string }) {
    const response = await axiosInstance.post('/ai/check-content', body);
    return response;
  }

  public async getModerationAdvice(body: { result: any; text: string; options: any }) {
    const response = await axiosInstance.post('/ai/moderation-advice', body);
    return response;
  }

  public async getBestTime(body: { post_length: number; media_count: number; day_of_week: number; options: any }) {
    const response = await axiosInstance.post('/ai/best-time', body);
    return response;
  }
}

export const aiService: AIService = new AIService();
