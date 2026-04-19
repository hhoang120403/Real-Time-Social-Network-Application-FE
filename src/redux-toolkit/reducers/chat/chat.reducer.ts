import type { IUser } from '@app-types/user';
import { getConversationList } from '@redux/api/chat';
import { createSlice } from '@reduxjs/toolkit';
import { orderBy, findIndex } from 'lodash';

const initialState = {
  chatList: [] as any[],
  selectedChatUser: null as IUser | null,
  isLoading: false,
  onlineUsers: [] as string[]
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addToChatList: (state, action) => {
      const { isLoading, chatList } = action.payload;
      state.isLoading = isLoading;
      state.chatList = [...chatList];
    },
    setSelectedChatUser: (state, action) => {
      const { isLoading, user } = action.payload;
      state.selectedChatUser = user;
      state.isLoading = isLoading;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = [...action.payload];
    },
    updateChatList: (state, action) => {
      const data = action.payload;
      const index = findIndex(state.chatList, (chat) => {
        return (
          chat.conversationId === data.conversationId ||
          (chat.receiverUsername === data.receiverUsername && chat.senderUsername === data.senderUsername) ||
          (chat.receiverUsername === data.senderUsername && chat.senderUsername === data.receiverUsername)
        );
      });
      if (index !== -1) {
        state.chatList.splice(index, 1);
        state.chatList = [data, ...state.chatList];
      } else {
        state.chatList = [data, ...state.chatList];
      }
    },
    clearChatState: (state) => {
      state.chatList = [];
      state.selectedChatUser = null;
      state.isLoading = false;
      state.onlineUsers = [];
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getConversationList.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getConversationList.fulfilled, (state, action) => {
      const { list = [] } = action.payload ?? {};
      state.isLoading = false;
      const sortedList = orderBy(list, ['createdAt'], ['desc']);
      state.chatList = [...sortedList];
    });
    builder.addCase(getConversationList.rejected, (state) => {
      state.isLoading = false;
    });
  }
});

export const { addToChatList, setSelectedChatUser, clearChatState, setOnlineUsers, updateChatList } = chatSlice.actions;
export default chatSlice.reducer;
