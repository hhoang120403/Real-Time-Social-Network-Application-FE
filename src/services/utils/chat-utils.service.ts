import { chatService } from '@services/api/chat/chat.service';
import { socketService } from '@services/socket/socket.service';
import { cloneDeep, find, findIndex, remove } from 'lodash';
import { createSearchParams } from 'react-router-dom';

export class ChatUtils {
  static privateChatMessages: any[] = [];
  static chatUsers: any[] = [];
  static chatListHandler: ((data: any) => void) | null = null;

  static usersOnline(setOnlineUsers: (data: any[]) => void) {
    socketService?.socket?.off('user online');
    socketService?.socket?.on('user online', (data: any[]) => {
      setOnlineUsers(data);
    });
    socketService?.socket?.emit('get online users');
  }

  static usersOnChatPage() {
    socketService?.socket?.off('add chat users');
    socketService?.socket?.on('add chat users', (data: any[]) => {
      ChatUtils.chatUsers = [...data];
    });
  }

  static joinRoomEvent(user: any, profile: any) {
    const users = {
      receiverId: user.receiverId,
      receiverName: user.receiverUsername,
      senderId: profile?._id,
      senderName: profile?.username
    };
    socketService?.socket?.emit('join room', users);
  }

  static emitChatPageEvent(event: string, data: any) {
    socketService?.socket?.emit(event, data);
  }

  static chatUrlParams(user: any, profile: any) {
    const params = { username: '', id: '' };
    if (user.receiverUsername === profile?.username) {
      params.username = user.senderUsername.toLowerCase();
      params.id = user.senderId;
    } else {
      params.username = user.receiverUsername.toLowerCase();
      params.id = user.receiverId;
    }
    return params;
  }

  static messageData({
    receiver,
    message,
    searchParamsId,
    conversationId,
    chatMessages,
    isRead,
    gifUrl,
    selectedImage
  }: any) {
    const chatConversationId = find(
      chatMessages,
      (chat) => chat.receiverId === searchParamsId || chat.senderId === searchParamsId
    );

    const messageData = {
      conversationId: chatConversationId ? chatConversationId.conversationId : conversationId,
      receiverId: receiver?._id,
      receiverUsername: receiver?.username,
      receiverAvatarColor: receiver?.avatarColor,
      receiverProfilePicture: receiver?.profilePicture,
      body: message.trim(),
      isRead,
      gifUrl,
      selectedImage
    };
    return messageData;
  }

  static updatedSelectedChatUser({
    chatMessageList,
    profile,
    username,
    setSelectedChatUser,
    params,
    pathname,
    navigate,
    dispatch
  }: any) {
    if (chatMessageList.length) {
      dispatch(setSelectedChatUser({ isLoading: false, user: chatMessageList[0] }));
      navigate(`${pathname}?${createSearchParams(params)}`);
    } else {
      dispatch(setSelectedChatUser({ isLoading: false, user: null }));
      const sender = find(
        ChatUtils.chatUsers,
        (user) => user.userOne === profile?.username && user.userTwo.toLowerCase() === username
      );
      if (sender) {
        chatService.removeChatUsers(sender);
      }
    }
  }

  static socketIOChatList(profile: any, chatMessageList: any, setChatMessageList: any) {
    if (ChatUtils.chatListHandler) {
      socketService?.socket?.off('chat list', ChatUtils.chatListHandler);
    }
    ChatUtils.chatListHandler = (data: any) => {
      if (data.senderUsername === profile?.username || data.receiverUsername === profile?.username) {
        setChatMessageList((currentList: any[]) => {
          const list = cloneDeep(currentList?.length ? currentList : chatMessageList);
          remove(list, (chat: any) => {
            const isSameConversation = `${chat.conversationId}` === `${data.conversationId}`;
            const isSameParticipants =
              (chat.senderId === data.senderId && chat.receiverId === data.receiverId) ||
              (chat.senderId === data.receiverId && chat.receiverId === data.senderId);

            return isSameConversation || isSameParticipants;
          });
          return [data, ...list];
        });
      }
    };
    socketService?.socket?.on('chat list', ChatUtils.chatListHandler);
  }

  static socketIOMessageReceived(username: any, setConversationId: any, setChatMessages: any) {
    socketService?.socket?.off('message received');
    socketService?.socket?.on('message received', (data: any) => {
      if (data.senderUsername.toLowerCase() === username?.toLowerCase() || data.receiverUsername.toLowerCase() === username?.toLowerCase()) {
        setConversationId(data.conversationId);
        const existingMessage = find(ChatUtils.privateChatMessages, ['_id', data._id]);
        if (!existingMessage) {
          ChatUtils.privateChatMessages.push(data);
          const messages = [...ChatUtils.privateChatMessages];
          setChatMessages(messages);
        }
      }
    });

    socketService?.socket?.off('message read');
    socketService?.socket?.on('message read', (data: any) => {
      if (data.senderUsername.toLowerCase() === username?.toLowerCase() || data.receiverUsername.toLowerCase() === username?.toLowerCase()) {
        const findMessageIndex = findIndex(ChatUtils.privateChatMessages, ['_id', data._id]);
        if (findMessageIndex > -1) {
          ChatUtils.privateChatMessages.splice(findMessageIndex, 1, data);
          const messages = [...ChatUtils.privateChatMessages];
          setChatMessages(messages);
        }
      }
    });
  }

  static socketIOMessageReaction(username: any, setConversationId: any, setChatMessages: any) {
    socketService?.socket?.off('message reaction');
    socketService?.socket?.on('message reaction', (data: any) => {
      if (data.senderUsername.toLowerCase() === username?.toLowerCase() || data.receiverUsername.toLowerCase() === username?.toLowerCase()) {
        setConversationId(data.conversationId);
        const messageIndex = findIndex(ChatUtils.privateChatMessages, (message: any) => message?._id === data._id);
        if (messageIndex > -1) {
          ChatUtils.privateChatMessages.splice(messageIndex, 1, data);
          const messages = [...ChatUtils.privateChatMessages];
          setChatMessages(messages);
        }
      }
    });
  }

  static socketIOMessageUpdate(username: any, setChatMessages: any) {
    socketService?.socket?.off('message update');
    socketService?.socket?.on('message update', (data: any) => {
      if (data.senderUsername.toLowerCase() === username?.toLowerCase() || data.receiverUsername.toLowerCase() === username?.toLowerCase()) {
        const messageIndex = findIndex(ChatUtils.privateChatMessages, (message: any) => message?._id === data._id);
        if (messageIndex > -1) {
          ChatUtils.privateChatMessages.splice(messageIndex, 1, data);
          const messages = [...ChatUtils.privateChatMessages];
          setChatMessages(messages);
        }
      }
    });
  }
}
