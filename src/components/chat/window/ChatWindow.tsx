import Avatar from '@components/avatar/Avatar';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@redux/store';
import MessageInput from './message-input/MessageInput';
import { Utils } from '@services/utils/utils.service';
import { useCallback, useEffect, useState } from 'react';
import { ChatUtils } from '@services/utils/chat-utils.service';
import { chatService } from '@services/api/chat/chat.service';
import { some } from 'lodash';
import { userService } from '@services/api/user/user.service';
import { useSearchParams } from 'react-router-dom';
import MessageDisplay from './message-display/MessageDisplay';
import { getConversationList } from '@redux/api/chat';
import { Box, IconButton, Tooltip, Typography, CircularProgress } from '@mui/material';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';

const ChatWindow = () => {
  const { profile } = useSelector((state: RootState) => state.user);
  const { isLoading, onlineUsers } = useSelector((state: RootState) => state.chat);
  const [receiver, setReceiver] = useState<any>();
  const [conversationId, setConversationId] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [searchParams] = useSearchParams();
  const [rendered, setRendered] = useState(false);
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const dispatch = useDispatch<AppDispatch>();
  const videoClient = useStreamVideoClient();

  const getChatMessages = useCallback(
    async (receiverId: string) => {
      try {
        const response = await chatService.getChatMessages(receiverId);
        ChatUtils.privateChatMessages = [...response.data.messages];
        setChatMessages([...ChatUtils.privateChatMessages]);
      } catch (error: any) {
        if (!Utils.shouldSkipErrorNotification(error)) {
          Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
        }
      }
    },
    [dispatch]
  );

  const getNewUserMessages = useCallback(() => {
    if (searchParams.get('id') && searchParams.get('username')) {
      setConversationId('');
      setChatMessages([]);
      getChatMessages(searchParams.get('id')!);
    }
  }, [getChatMessages, searchParams]);

  const getUserProfileByUserId = useCallback(async () => {
    try {
      const response = await userService.getUserProfileByUserId(searchParams.get('id')!);
      setReceiver(response.data.user);
      ChatUtils.joinRoomEvent(response.data.user, profile);
    } catch (error: any) {
      if (!Utils.shouldSkipErrorNotification(error)) {
        Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
      }
    }
  }, [dispatch, profile, searchParams]);

  const sendChatMessage = async (message: string, gifUrl: string, selectedImage: string) => {
    try {
      const checkUserOne = some(
        ChatUtils.chatUsers,
        (user) => user?.userOne === profile?.username && user?.userTwo === receiver?.username
      );
      const checkUserTwo = some(
        ChatUtils.chatUsers,
        (user) => user?.userOne === receiver?.username && user?.userTwo === profile?.username
      );
      const messageData = ChatUtils.messageData({
        receiver,
        conversationId,
        message,
        searchParamsId: searchParams.get('id'),
        chatMessages,
        gifUrl,
        selectedImage,
        isRead: checkUserOne && checkUserTwo
      });
      const response = await chatService.saveChatMessage(messageData);
      if (response.data?.conversationId) {
        setConversationId(response.data.conversationId);
      }
      dispatch(getConversationList());
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const updateMessageReaction = async (body: any) => {
    try {
      await chatService.updateMessageReaction(body);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const deleteChatMessage = async (senderId: string, receiverId: string, messageId: string, type: string) => {
    try {
      await chatService.markMessageAsDelete(messageId, senderId, receiverId, type);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const editChatMessage = async (message: string, gifUrl: string, selectedImage: string) => {
    try {
      if (!editingMessage) return;

      const body = {
        senderId: editingMessage.senderId,
        receiverId: editingMessage.receiverId,
        messageId: editingMessage._id,
        body: message,
        gifUrl,
        selectedImage
      };

      await chatService.updateChatMessage(body);
      if (receiver?._id) {
        await getChatMessages(receiver._id);
      }
      dispatch(getConversationList());
      setEditingMessage(null);
    } catch (error: any) {
      if (!Utils.shouldSkipErrorNotification(error)) {
        Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
      }
    }
  };

  // Video Call Handler
  const startVideoCall = async () => {
    if (!videoClient || !profile || !receiver) {
      Utils.dispatchNotification('Video Calling is currently unavailable', 'error', dispatch);
      return;
    }
    try {
      const callId = `${profile._id}-${receiver._id}-${Date.now()}`;
      const call = videoClient.call('default', callId);

      await call.getOrCreate({
        ring: true,
        data: {
          members: [{ user_id: profile._id as string }, { user_id: receiver._id as string }]
        }
      });

      Utils.dispatchNotification('Calling...', 'success', dispatch);
    } catch (error) {
      console.error('Failed to start call', error);
      Utils.dispatchNotification('Failed to start video call', 'error', dispatch);
    }
  };

  useEffect(() => {
    if (!profile || !searchParams.get('id') || !searchParams.get('username')) return;
    if (rendered) {
      getUserProfileByUserId();
      getNewUserMessages();
    }
    if (!rendered) setRendered(true);
  }, [getUserProfileByUserId, getNewUserMessages, searchParams, rendered]);

  useEffect(() => {
    if (!profile || !searchParams.get('username')) return;
    if (rendered) {
      ChatUtils.socketIOMessageReceived(searchParams.get('username'), setConversationId, setChatMessages);
      ChatUtils.socketIOMessageReaction(searchParams.get('username'), setConversationId, setChatMessages);
      ChatUtils.socketIOMessageUpdate(searchParams.get('username'), setChatMessages);
    }
    if (!rendered) setRendered(true);
    ChatUtils.usersOnChatPage();
  }, [profile, searchParams, rendered]);

  useEffect(() => {
    if (!profile || !receiver) return;
    const markAsRead = async () => {
      await chatService.markMessagesAsRead(profile?._id as string, receiver?._id as string);
      dispatch(getConversationList());
    };
    markAsRead();
  }, [profile, receiver, dispatch]);

  return (
    <Box className="flex flex-col h-full bg-white relative overflow-hidden" data-testid="chatWindowContainer">
      {isLoading ? (
        <Box className="flex-1 flex items-center justify-center bg-[#f0f2f5]/50 overflow-hidden">
          <Box className="flex flex-col items-center">
            <CircularProgress size={48} className="text-primary mb-4" />
            <Typography className="text-gray-400 font-bold animate-pulse tracking-wide">Syncing messages...</Typography>
          </Box>
        </Box>
      ) : (
        <>
          {/* Conversation Header */}
          <Box
            className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-20 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] shrink-0"
            data-testid="chat-title"
          >
            <Box className="flex items-center gap-4 min-w-0">
              {receiver && (
                <Box className="relative shrink-0 cursor-pointer group">
                  <Box className="absolute -inset-1.5 bg-primary/5 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
                  <Avatar
                    name={receiver?.username}
                    bgColor={receiver.avatarColor}
                    textColor="#ffffff"
                    size={48}
                    avatarSrc={receiver?.profilePicture}
                  />
                  {Utils.checkIfUserIsOnline(receiver?.username, onlineUsers, receiver?._id) && (
                    <Box className="absolute bottom-0 right-0 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Box className="w-2.5 h-2.5 bg-[#22c55e] rounded-full ring-2 ring-white" />
                    </Box>
                  )}
                </Box>
              )}
              <Box className="flex flex-col min-w-0">
                <Typography
                  variant="h6"
                  className="text-[16px] font-bold text-slate-900 leading-tight tracking-tight truncate hover:underline cursor-pointer"
                >
                  {receiver?.username}
                </Typography>
                <Box className="flex items-center gap-1.5 mt-0.5">
                  {Utils.checkIfUserIsOnline(receiver?.username, onlineUsers, receiver?._id) ? (
                    <Typography className="text-[13px] text-[#22c55e] font-bold tracking-tight">Online</Typography>
                  ) : (
                    <Typography className="text-[13px] text-slate-400 font-medium italic">Offline</Typography>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Header Actions (Messenger Style) */}
            <Box className="flex items-center gap-2 shrink-0">
              <Tooltip title="Start a video call" arrow>
                <IconButton className="text-primary hover:bg-slate-100 p-2.5 transition-all" onClick={startVideoCall}>
                  <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Messages Area */}
          <Box className="flex-1 overflow-hidden relative bg-[#fdfbfb]/30">
            <MessageDisplay
              chatMessages={chatMessages}
              profile={profile}
              updateMessageReaction={updateMessageReaction}
              deleteChatMessage={deleteChatMessage}
              onEditMessage={(chat) => setEditingMessage(chat)}
            />
          </Box>

          {/* Input Overlay Container */}
          <Box className="px-5 py-5 bg-white/80 backdrop-blur-md border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] sticky bottom-0 z-20">
            <MessageInput
              setChatMessage={sendChatMessage}
              editMessageData={editingMessage}
              onCancelEdit={() => setEditingMessage(null)}
              submitEditMessage={editChatMessage}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default ChatWindow;
