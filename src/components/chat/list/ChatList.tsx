import Avatar from '@components/avatar/Avatar';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@redux/store';
import { Utils } from '@services/utils/utils.service';
import SearchList from './search-list/SearchList';
import { useCallback, useEffect, useState } from 'react';
import useDebounce from '@hooks/useDebounce';
import { useLocation, useNavigate, useSearchParams, createSearchParams } from 'react-router-dom';
import { userService } from '@services/api/user/user.service';
import type { IUser } from '@app-types/user';
import { cloneDeep, find, findIndex } from 'lodash';
import { ChatUtils } from '@services/utils/chat-utils.service';
import { setSelectedChatUser } from '@redux/reducers/chat/chat.reducer';
import { getConversationList } from '@redux/api/chat';
import { chatService } from '@services/api/chat/chat.service';
import { timeAgo } from '@services/utils/timeago.utils';
import ChatListBody from './ChatListBody';
import { Box, Fade, IconButton, InputBase, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import { FaEllipsisH, FaTrashAlt } from 'react-icons/fa';

const ChatList = () => {
  const { profile } = useSelector((state: RootState) => state.user);
  const { chatList, onlineUsers } = useSelector((state: RootState) => state.chat);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState<IUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [componentType, setComponentType] = useState('chatList');
  let [chatMessageList, setChatMessageList] = useState<any[]>([]);
  const [rendered, setRendered] = useState(false);
  const debouncedValue = useDebounce(search, 1000);
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuData, setMenuData] = useState<any>(null);
  const openMenu = Boolean(menuAnchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, data: any) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setMenuData(data);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuData(null);
  };

  const handleDeleteChat = async () => {
    if (!menuData) return;
    try {
      const userTwoName =
        menuData.receiverUsername !== profile?.username ? menuData.receiverUsername : menuData.senderUsername;
      const receiverId = menuData.receiverUsername !== profile?.username ? menuData.receiverId : menuData.senderId;
      await chatService.deleteConversationForMe(receiverId);

      const userIndex = findIndex(chatMessageList, (chat) => {
        return (
          chat._id === menuData._id ||
          chat.conversationId === menuData.conversationId ||
          chat.receiverId === receiverId ||
          chat.senderId === receiverId
        );
      });
      if (userIndex > -1) {
        const newList = cloneDeep(chatMessageList);
        newList.splice(userIndex, 1);
        setChatMessageList(newList);
        dispatch(getConversationList());

        const currentUsername = searchParams.get('username');
        if (currentUsername === userTwoName?.toLowerCase()) {
          dispatch(setSelectedChatUser({ isLoading: false, user: null }));
          ChatUtils.privateChatMessages = [];
          navigate(location.pathname);
        }
      }
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
    handleMenuClose();
  };

  const searchUsers = useCallback(
    async (query: string) => {
      setIsSearching(true);
      try {
        setSearch(query);
        if (query) {
          const response = await userService.searchUsers(query);
          setSearchResult(response.data.search || response.data.users || []);
          setIsSearching(false);
        }
      } catch (error: any) {
        setIsSearching(false);
        Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
      }
    },
    [dispatch]
  );

  const addSelectedUserToList = useCallback(
    (user: IUser) => {
      const newUser = {
        receiverId: user?._id,
        receiverUsername: user?.username,
        receiverAvatarColor: user?.avatarColor,
        receiverProfilePicture: user?.profilePicture,
        senderUsername: profile?.username,
        senderId: profile?._id,
        senderAvatarColor: profile?.avatarColor,
        senderProfilePicture: profile?.profilePicture,
        body: ''
      };
      ChatUtils.joinRoomEvent(user, profile);
      ChatUtils.privateChatMessages = [];
      const findUser = find(
        chatMessageList,
        (chat) =>
          chat.receiverId === searchParams.get('id') ||
          chat.senderId === searchParams.get('id') ||
          chat.receiverId === user?._id ||
          chat.senderId === user?._id
      );
      if (!findUser) {
        const newChatList = [newUser, ...chatMessageList];
        setChatMessageList(newChatList);
        if (!chatList.length) {
          dispatch(setSelectedChatUser({ isLoading: false, user: newUser }));
          const userTwoName =
            newUser?.receiverUsername !== profile?.username ? newUser?.receiverUsername : newUser?.senderUsername;
          chatService.addChatUsers({ userOne: profile?.username, userTwo: userTwoName });
        }
      }
    },
    [chatList, chatMessageList, dispatch, searchParams, profile]
  );

  const updateQueryParams = (user: any) => {
    setSelectedUser(user);
    const params = ChatUtils.chatUrlParams(user, profile);
    ChatUtils.joinRoomEvent(user, profile);
    ChatUtils.privateChatMessages = [];
    return params;
  };

  // this is for when a user already exist in the chat list
  const addUsernameToUrlQuery = async (user: any) => {
    try {
      const sender = find(
        ChatUtils.chatUsers,
        (userData) =>
          userData.userOne === profile?.username && userData.userTwo.toLowerCase() === searchParams.get('username')
      );
      const params = updateQueryParams(user);
      const userTwoName = user?.receiverUsername !== profile?.username ? user?.receiverUsername : user?.senderUsername;
      const receiverId = user?.receiverUsername !== profile?.username ? user?.receiverId : user?.senderId;
      navigate(`${location.pathname}?${createSearchParams(params)}`);
      if (sender) {
        chatService.removeChatUsers(sender);
      }
      chatService.addChatUsers({ userOne: profile?.username, userTwo: userTwoName });
      if (user?.receiverUsername === profile?.username && !user.isRead) {
        await chatService.markMessagesAsRead(profile?._id as string, receiverId);
      }
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  useEffect(() => {
    if (debouncedValue) {
      searchUsers(debouncedValue);
    }
  }, [debouncedValue, searchUsers]);

  useEffect(() => {
    if (selectedUser && componentType === 'searchList') {
      addSelectedUserToList(selectedUser);
    }
  }, [addSelectedUserToList, componentType, selectedUser]);

  useEffect(() => {
    setChatMessageList(chatList);
  }, [chatList]);

  useEffect(() => {
    if (rendered) {
      ChatUtils.socketIOChatList(profile, chatMessageList, setChatMessageList);
    }
    if (!rendered) setRendered(true);
  }, [chatMessageList, profile, rendered]);

  return (
    <Box className="flex h-full flex-col bg-white animate-in slide-in-from-left duration-500" data-testid="chatList">
      <Box className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-slate-100 bg-white/85 px-6 py-5 backdrop-blur-sm">
        <Box className="flex items-center gap-4">
          <Box className="cursor-pointer rounded-full p-0.5 ring-2 ring-blue-100 transition-transform hover:scale-105">
            <Avatar
              name={profile?.username || ''}
              bgColor={profile?.avatarColor || ''}
              textColor="#ffffff"
              size={44}
              avatarSrc={profile?.profilePicture || ''}
            />
          </Box>
          <Box className="flex flex-col">
            <Typography className="max-w-[150px] truncate text-[18px] font-extrabold leading-tight text-slate-950">
              {profile?.username}
            </Typography>
            <span className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.45)] animate-pulse" />
              Online
            </span>
          </Box>
        </Box>
      </Box>

      <Box className="shrink-0 bg-white px-4 py-3">
        <Box className="group/search relative flex items-center rounded-2xl border border-transparent bg-slate-100 px-3 transition-all focus-within:border-blue-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
          <FaSearch className="mr-2 text-[14px] text-slate-400 transition-colors group-focus-within/search:text-blue-600" />
          <InputBase
            id="message"
            name="message"
            type="text"
            className="min-w-0 flex-1 py-1.5 text-[14px] font-medium text-slate-700"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => {
              setIsSearching(true);
              setSearch(e.target.value);
            }}
          />
          {search && (
            <IconButton
              size="small"
              className="h-7 w-7 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              onClick={() => {
                setSearch('');
                setIsSearching(false);
                setSearchResult([]);
              }}
            >
              <FaTimes className="text-[12px]" />
            </IconButton>
          )}
        </Box>
      </Box>

      <Box className="flex-1 space-y-1 overflow-y-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {!search && (
          <Box className="flex flex-col">
            {chatMessageList.map((data) => {
              const username = searchParams.get('username');
              const isActive =
                username === data.receiverUsername?.toLowerCase() || username === data.senderUsername?.toLowerCase();

              return (
                <div
                  key={data._id || Utils.generateString(10)}
                  data-testid="conversation-item"
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl cursor-pointer transition-all duration-300 group ${
                    isActive ? 'translate-x-1 border border-blue-100 bg-blue-50 shadow-sm' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => addUsernameToUrlQuery(data)}
                >
                  <div className="relative shrink-0">
                    <Avatar
                      name={data.receiverUsername !== profile?.username ? data.receiverUsername : data.senderUsername}
                      bgColor={
                        data.receiverUsername !== profile?.username ? data.receiverAvatarColor : data.senderAvatarColor
                      }
                      textColor="#ffffff"
                      size={48}
                      avatarSrc={
                        data.receiverUsername !== profile?.username
                          ? data.receiverProfilePicture
                          : data.senderProfilePicture
                      }
                    />
                    {/* Dynamic Online Indicator */}
                    {Utils.checkIfUserIsOnline(
                      data.receiverUsername !== profile?.username ? data.receiverUsername : data.senderUsername,
                      onlineUsers,
                      data.receiverUsername !== profile?.username ? data.receiverId : data.senderId
                    ) && (
                      <div className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white">
                        <div className="h-2.5 w-2.5 rounded-full border border-white bg-emerald-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h4
                        className={`text-[15px] font-bold truncate leading-none transition-colors ${
                          isActive ? 'text-blue-700' : 'text-slate-950 group-hover:text-blue-700'
                        }`}
                      >
                        {data.receiverUsername !== profile?.username ? data.receiverUsername : data.senderUsername}
                      </h4>
                      <div className="flex items-center gap-2">
                        <IconButton
                          size="small"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-200"
                          onClick={(e) => handleMenuClick(e, data)}
                        >
                          <FaEllipsisH className="text-[12px] text-slate-500" />
                        </IconButton>
                      </div>
                    </div>

                    <div className="flex items-center min-w-0 pr-6 gap-1">
                      {data?.body ? (
                        <div className="flex-1 min-w-0 flex items-center gap-1.5">
                          {data?.deleteForMe &&
                          (data.deleteForEveryone || data.senderUsername === profile?.username) ? (
                            <span className="text-[13px] text-gray-400 italic">Message deleted</span>
                          ) : (
                            <ChatListBody data={data} profile={profile} />
                          )}
                          {data?.createdAt && (
                            <span className="shrink-0 text-[11px] text-slate-400 font-medium before:content-['·'] before:mr-1.5">
                              {timeAgo.transform(data?.createdAt)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[13px] font-medium italic text-blue-500/70 animate-pulse">
                          New connection...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </Box>
        )}

        {/* Conversations Actions Menu (Simplified Messenger Style) */}
        <Menu
          anchorEl={menuAnchorEl}
          open={openMenu}
          onClose={handleMenuClose}
          TransitionComponent={Fade}
          elevation={0}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          PaperProps={{
            className:
              'mt-1 min-w-[220px] rounded-[12px] border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] p-1.5 overflow-hidden'
          }}
        >
          {' '}
          <MenuItem
            onClick={handleDeleteChat}
            className="flex items-center gap-3.5 px-3 py-2.5 rounded-[8px] hover:bg-red-50 transition-colors group"
          >
            <div className="w-8 h-8 flex items-center justify-center bg-red-50 rounded-full group-hover:bg-white transition-colors">
              <FaTrashAlt className="text-[14px] text-red-500" />
            </div>
            <ListItemText
              primary="Delete chat"
              primaryTypographyProps={{ className: 'text-[14px] font-semibold text-red-600' }}
            />
          </MenuItem>
        </Menu>

        {/* Search list container */}
        <SearchList
          searchTerm={search}
          result={searchResult}
          isSearching={isSearching}
          setSelectedUser={setSelectedUser}
          setSearch={setSearch}
          setIsSearching={setIsSearching}
          setSearchResult={setSearchResult}
          setComponentType={setComponentType}
        />
      </Box>
    </Box>
  );
};

export default ChatList;
