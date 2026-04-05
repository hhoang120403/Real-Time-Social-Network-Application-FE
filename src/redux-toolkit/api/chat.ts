import { createAsyncThunk, type Dispatch } from '@reduxjs/toolkit';
import { chatService } from '@services/api/chat/chat.service';
import { Utils } from '@services/utils/utils.service';

const getConversationList = createAsyncThunk(
  'chat/getUserChatList',
  async (_, { dispatch }: { dispatch: Dispatch }) => {
    try {
      const response = await chatService.getConversationList();
      return response.data;
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  }
);

export { getConversationList };
