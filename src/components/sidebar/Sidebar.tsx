import { fontAwesomeIcons, sideBarItems, type SidebarItem } from '@services/utils/static.data';
import { useCallback, useEffect, useState } from 'react';
import '@components/sidebar/Sidebar.scss';
import { createSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@redux/store';
import { getPosts } from '@redux/api/posts';
import { Utils } from '@services/utils/utils.service';
import { ChatUtils } from '@services/utils/chat-utils.service';
import { chatService } from '@services/api/chat/chat.service';
import { socketService } from '@services/socket/socket.service';

const Sidebar = () => {
  const { profile } = useSelector((state: RootState) => state.user);
  const { chatList } = useSelector((state: RootState) => state.chat);
  const [sidebar, setSideBar] = useState<SidebarItem[]>([]);
  const [chatPageName, setChatPageName] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const checkUrl = (name: string) => {
    return location.pathname.includes(name.toLowerCase());
  };

  const navigateToPage = (name: string, url: string) => {
    if (name === 'Profile') {
      url = `${url}/${profile?.username}?${createSearchParams({ id: profile?._id ?? '', uId: profile?.uId ?? '' })}`;
    }

    if (name === 'Streams') {
      dispatch(getPosts());
    }

    if (name === 'Chat') {
      setChatPageName('Chat');
    } else {
      leaveChatPage();
      setChatPageName('');
    }

    socketService?.socket.off('message received');

    navigate(url);
  };

  const createChatUrlParams = useCallback(
    (url: string) => {
      if (chatList.length) {
        const chatUser = chatList[0];
        const params = ChatUtils.chatUrlParams(chatUser, profile);
        ChatUtils.joinRoomEvent(chatUser, profile);
        return `${url}?${createSearchParams(params)}`;
      }
      return url;
    },
    [chatList, profile]
  );

  const markMessagesAsRead = useCallback(
    async (chatUser: any) => {
      try {
        const receiverId = chatUser?.receiverUsername !== profile?.username ? chatUser?.receiverId : chatUser?.senderId;
        if (chatUser?.receiverUsername === profile?.username && !chatUser?.isRead) {
          await chatService.markMessagesAsRead(profile?._id as string, receiverId);
        }
        const userTwoName =
          chatUser?.receiverUsername !== profile?.username ? chatUser?.receiverUsername : chatUser?.senderUsername;
        await chatService.addChatUsers({ userOne: profile?.username, userTwo: userTwoName });
      } catch (error: any) {
        Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
      }
    },
    [dispatch, profile]
  );

  const leaveChatPage = async () => {
    try {
      const chatUser = chatList[0];
      const userTwoName =
        chatUser?.receiverUsername !== profile?.username ? chatUser?.receiverUsername : chatUser?.senderUsername;
      ChatUtils.privateChatMessages = [];
      await chatService.removeChatUsers({ userOne: profile?.username, userTwo: userTwoName });
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  useEffect(() => {
    setSideBar(sideBarItems);
  }, []);

  useEffect(() => {
    if (chatPageName === 'Chat') {
      const url = createChatUrlParams('/app/social/chat/messages');
      navigate(url);
      if (chatList.length && !chatList[0].isRead) {
        markMessagesAsRead(chatList[0]);
      }
    }
  }, [chatPageName, createChatUrlParams, navigate, chatList, markMessagesAsRead]);

  return (
    <div className="app-side-menu">
      <div className="side-menu">
        <ul className="list-unstyled">
          {sidebar.map((data) => (
            <li key={data.index} onClick={() => navigateToPage(data.name, data.url)}>
              <div data-testid="sidebar-list" className={`sidebar-link ${checkUrl(data.name) ? 'active' : ''}`}>
                <div className="menu-icon">{fontAwesomeIcons[data.iconName]}</div>
                <div className="menu-link">
                  <span>{`${data.name}`}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
