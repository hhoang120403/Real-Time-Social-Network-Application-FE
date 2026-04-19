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
      if (!Utils.shouldSkipErrorNotification(error)) {
        Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
      }
      throw error;
    }
  }
);

export { getConversationList };
