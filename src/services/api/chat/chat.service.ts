import { axiosInstance } from '@services/axios';

class ChatService {
  async getConversationList() {
    const response = await axiosInstance.get('/chat/message/conversation-list');
    return response;
  }

  async getChatMessages(receiverId: string) {
    const response = await axiosInstance.get(`/chat/message/user/${receiverId}`);
    return response;
  }

  async addChatUsers(body: any) {
    const response = await axiosInstance.post('/chat/message/add-chat-users', body);
    return response;
  }

  async removeChatUsers(body: any) {
    const response = await axiosInstance.post('/chat/message/remove-chat-users', body);
    return response;
  }

  async deleteConversationForMe(receiverId: string) {
    const response = await axiosInstance.delete(`/chat/message/conversation/${receiverId}`);
    return response;
  }

  async markMessagesAsRead(senderId: string, receiverId: string) {
    const response = await axiosInstance.put(`/chat/message/mark-as-read`, { senderId, receiverId });
    return response;
  }

  async saveChatMessage(body: any) {
    const response = await axiosInstance.post('/chat/message', body);
    return response;
  }

  async updateMessageReaction(body: any) {
    const response = await axiosInstance.put('/chat/message/reaction', body);
    return response;
  }

  async markMessageAsDelete(messageId: string, senderId: string, receiverId: string, type: string) {
    const response = await axiosInstance.delete(
      `/chat/message/mark-as-deleted/${messageId}/${senderId}/${receiverId}/${type}`
    );
    return response;
  }

  async updateChatMessage(body: any) {
    const response = await axiosInstance.put('/chat/message/update', body);
    return response;
  }
}

export const chatService = new ChatService();
