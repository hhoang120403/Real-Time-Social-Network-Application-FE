import MenuIcon from '@mui/icons-material/Menu';
import InstagramIcon from '@mui/icons-material/Instagram';
import SearchIcon from '@mui/icons-material/Search';
import NotificationIcon from '@mui/icons-material/Notifications';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ChatIcon from '@mui/icons-material/Chat';
import { useEffect, useState, useRef } from 'react';
import { Utils } from '@services/utils/utils.service';
import useDetectOutsideClick from '@hooks/useDetectOutsideClick';
import MessageSidebar from '@components/message-sidebar/MessageSidebar';
import NotificationSidebar from '@components/notification-sidebar/NotificationSidebar';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch, RootState } from '@redux/store';
import { ProfileUtils } from '@services/utils/profile-utils.service';
import { createSearchParams, useLocation, useNavigate, Link } from 'react-router-dom';
import useLocalStorage from '@hooks/useLocalStorage';
import useSessionStorage from '@hooks/useSessionStorage';
import { userService } from '@services/api/user/user.service';
import HeaderSkeleton from './HeaderSkeleton';
import { notificationService } from '@services/api/notifications/notification.service';
import { NotificationUtils } from '@services/utils/notification-utils.service';
import type { NotificationDialogState } from '@pages/social/notifications/Notifications';
import NotificationPreview from '@components/dialog/NotificationPreview';
import { sumBy, debounce } from 'lodash';
import { ChatUtils } from '@services/utils/chat-utils.service';
import { chatService } from '@services/api/chat/chat.service';
import { getConversationList } from '@redux/api/chat';
import { startAuthTransition } from '@services/axios';
import { Avatar, AvatarFallback, AvatarImage } from '@components/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from '@components/components/ui/dropdown-menu';

interface IHeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: IHeaderProps) => {
  const { profile } = useSelector((state: RootState) => state.user);
  const { chatList } = useSelector((state: RootState) => state.chat);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [notificationDialog, setNotificationDialog] = useState<NotificationDialogState>({
    post: '',
    imgUrl: '',
    comment: '',
    reaction: undefined,
    senderName: '',
    secondButtonText: '',
    secondBtnHandler: () => {}
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [isSearchActive, setIsSearchActive] = useDetectOutsideClick(searchRef, false);

  const messageCount = sumBy(chatList, (notification: any) => {
    return !notification.isRead && notification.receiverUsername?.toLowerCase() === profile?.username?.toLowerCase()
      ? 1
      : 0;
  });
  const messageNotifications = chatList;

  const messageRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  const [isMessageActive, setIsMessageActive] = useDetectOutsideClick(messageRef, false);
  const [isNotificationActive, setIsNotificationActive] = useDetectOutsideClick(notificationRef, false);

  // const storedUsername = useLocalStorage('username', 'get');
  const [deleteStorageUsername] = useLocalStorage('username', 'delete');
  const [setLoggedIn] = useLocalStorage('keepLoggedIn', 'set');
  const [deleteSessionPageReload] = useSessionStorage('pageReload', 'delete');

  const getUserNotifications = async () => {
    try {
      const response = await notificationService.getUserNotifications();
      const mappedNotifications = NotificationUtils.mapNotificationDropdownItems(
        response.data.notifications,
        setNotificationCount
      );
      setNotifications(mappedNotifications);
    } catch (error: any) {
      if (!Utils.shouldSkipErrorNotification(error)) {
        Utils.dispatchNotification(error?.response?.data?.message, 'error', dispatch);
      }
    }
  };

  const onMarkAsRead = async (notification: any) => {
    try {
      await NotificationUtils.markAsRead(
        notification?._id as string,
        notification,
        setNotificationDialog,
        setNotifications
      );
      if (!notification.read) {
        setNotificationCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error: any) {
      Utils.dispatchNotification(error?.response?.data?.message, 'error', dispatch);
    }
  };

  const onDeleteNotification = async (notificationId: string) => {
    try {
      const response = await notificationService.deleteNotification(notificationId);
      Utils.dispatchNotification(response?.data?.message, 'success', dispatch);
    } catch (error: any) {
      Utils.dispatchNotification(error?.response?.data?.message, 'error', dispatch);
    }
  };

  const openChatPage = async (notification: any) => {
    try {
      const params = ChatUtils.chatUrlParams(notification, profile);
      ChatUtils.joinRoomEvent(notification, profile);
      ChatUtils.privateChatMessages = [];
      const receiverId =
        notification?.receiverUsername?.toLowerCase() !== profile?.username?.toLowerCase()
          ? notification?.receiverId
          : notification?.senderId;
      if (notification?.receiverUsername?.toLowerCase() === profile?.username?.toLowerCase() && !notification.isRead) {
        await chatService.markMessagesAsRead(profile?._id as string, receiverId as string);
      }
      const userTwoName =
        notification?.receiverUsername?.toLowerCase() !== profile?.username?.toLowerCase()
          ? notification?.receiverUsername
          : notification?.senderUsername;
      await chatService.addChatUsers({ userOne: profile?.username, userTwo: userTwoName });
      navigate(
        `/app/social/chat/messages?${createSearchParams({
          ...params,
          scrollToBottom: `${Date.now()}`
        })}`
      );
      setIsMessageActive(false);
      dispatch(getConversationList());
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const onLogout = async () => {
    startAuthTransition();
    try {
      await userService.logoutUser();
      sessionStorage.setItem(
        'pendingToast',
        JSON.stringify({ message: 'You have been signed out. See you soon! 👋', type: 'success' })
      );
      Utils.clearStore({ dispatch, deleteStorageUsername, deleteSessionPageReload, setLoggedIn });
      navigate('/');
    } catch (error: any) {
      Utils.clearStore({ dispatch, deleteStorageUsername, deleteSessionPageReload, setLoggedIn });
      navigate('/');
    }
  };

  const searchUsers = debounce(async (query: string) => {
    if (!query) {
      setUsers([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const response = await userService.searchUsers(query);
      setUsers(response.data.users);
      setIsSearching(false);
    } catch (error: any) {
      setIsSearching(false);
      if (!Utils.shouldSkipErrorNotification(error)) {
        Utils.dispatchNotification(error?.response?.data?.message, 'error', dispatch);
      }
    }
  }, 500);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim()) {
      setIsSearchActive(true);
    } else {
      setIsSearchActive(false);
    }
    searchUsers(value);
  };

  useEffect(() => {
    if (!profile) return;
    getUserNotifications();
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    const cleanup = NotificationUtils.socketIONotification(profile!, setNotifications, 'header', setNotificationCount);
    const cleanupChatList = NotificationUtils.socketIOMessageNotification(
      profile!,
      dispatch,
      location,
      getConversationList
    );
    return () => {
      cleanup();
      cleanupChatList();
    };
  }, [profile, dispatch, location]);

  return (
    <>
      {!profile ? (
        <HeaderSkeleton />
      ) : (
        <header className="fixed top-0 z-100 box-border flex h-[70px] w-full items-center justify-between bg-white px-6 py-2 border-b border-gray-100 shadow-sm transition-all duration-300">
          {notificationDialog?.senderName && (
            <NotificationPreview
              title="Your post"
              post={notificationDialog?.post}
              imgUrl={notificationDialog?.imgUrl}
              comment={notificationDialog?.comment}
              reaction={notificationDialog?.reaction}
              senderName={notificationDialog?.senderName}
              secondButtonText="Close"
              secondBtnHandler={() => {
                setNotificationDialog({
                  post: '',
                  imgUrl: '',
                  comment: '',
                  reaction: undefined,
                  senderName: ''
                });
              }}
            />
          )}

          <div
            className={`w-fit shrink-0 items-center justify-center gap-4 ${isSearchMode ? 'hidden sm:flex' : 'flex'}`}
          >
            <div
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full hover:bg-gray-100 transition-colors mr-2"
              onClick={toggleSidebar}
            >
              <MenuIcon sx={{ color: '#262626' }} />
            </div>
            <Link
              to="/app/social/streams"
              className="flex cursor-pointer items-center justify-center text-black no-underline select-none transition-all hover:opacity-80"
            >
              <InstagramIcon sx={{ fontSize: '36px', color: '#E4405F' }} className="drop-shadow-sm shrink-0" />
              <div className="flex flex-col shrink-0 w-full">
                <span className="font-lora text-2xl font-black tracking-tighter leading-none italic bg-linear-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                  Chatty
                </span>
              </div>
            </Link>
          </div>

          {/* Middle Side (Search Bar) */}
          <div
            className={`flex-1 gap-2.5 ${isSearchMode ? 'flex' : 'hidden sm:flex'} ml-0 w-full justify-center px-0 sm:ml-10 sm:max-w-[700px] sm:px-6`}
            ref={searchRef}
          >
            {isSearchMode && (
              <div
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-gray-100 sm:hidden"
                onClick={() => setIsSearchMode(false)}
              >
                <ArrowBackIcon sx={{ color: '#262626' }} />
              </div>
            )}
            <div className="relative flex w-full max-w-[600px] sm:w-[90%]">
              <div className="relative flex w-full items-center bg-gray-50 border border-gray-100 rounded-2xl hover:bg-gray-100 focus-within:bg-white focus-within:border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all px-5 h-[46px] group shadow-sm">
                <div className="mr-3 flex items-center justify-center">
                  <SearchIcon
                    sx={{ fontSize: '22px', color: '#8e8e8e' }}
                    className="group-focus-within:text-blue-600 transition-colors"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Search creators, friends..."
                  className="w-full bg-transparent text-[15px] text-gray-800 placeholder:text-gray-400 focus:outline-none font-medium"
                  value={searchTerm}
                  onChange={onSearchChange}
                  onFocus={() => searchTerm && setIsSearchActive(true)}
                />
                {isSearching && (
                  <div className="ml-2 flex items-center justify-center">
                    <svg
                      className="animate-spin h-4 w-4 text-blue-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {isSearchActive && (searchTerm || users.length > 0) && (
                <div className="absolute top-[54px] left-0 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-[400px] overflow-y-auto no-scrollbar py-2">
                    {users.length > 0 ? (
                      <div className="flex flex-col">
                        <div className="px-4 py-2 text-[11px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-50 mb-1">
                          Users
                        </div>
                        {users.map((user) => (
                          <div
                            key={user._id}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/50 cursor-pointer transition-colors group"
                            onClick={() => {
                              ProfileUtils.navigateToProfile(user, navigate);
                              setIsSearchActive(false);
                              setSearchTerm('');
                            }}
                          >
                            <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm border border-gray-100">
                              <AvatarImage src={user.profilePicture} className="object-cover" />
                              <AvatarFallback
                                style={{ backgroundColor: user.avatarColor }}
                                className="text-white font-bold uppercase text-sm"
                              >
                                {user.username.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-bold text-[14px] text-gray-900 group-hover:text-blue-600 transition-colors">
                                {user.username}
                              </span>
                              <span className="text-[11px] text-gray-400 font-medium">View profile</span>
                            </div>
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-blue-600 text-white rounded-full p-1 shadow-sm">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="3"
                                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      !isSearching && (
                        <div className="flex flex-col items-center justify-center py-10 px-6">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <SearchIcon sx={{ fontSize: 32, color: '#d1d5db' }} />
                          </div>
                          <p className="font-bold text-gray-900 mb-1">No results for "{searchTerm}"</p>
                          <p className="text-[13px] text-gray-400 text-center">
                            Check the spelling or try searching for someone else.
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div
            className={`relative shrink-0 items-center justify-end gap-3 sm:gap-5 ${isSearchMode ? 'hidden sm:flex' : 'flex'}`}
          >
            <div
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-gray-100 sm:hidden"
              onClick={() => setIsSearchMode(true)}
            >
              <SearchIcon sx={{ color: '#262626', fontSize: '26px' }} />
            </div>

            {!profile ? (
              <Link to="/login" className="no-underline">
                <button className="flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-1.5 text-[14px] font-bold text-gray-900 transition-all hover:bg-gray-50 active:scale-95 shadow-sm">
                  <AccountCircleOutlinedIcon sx={{ fontSize: 24, color: '#262626' }} />
                  <span className="uppercase tracking-wide">Sign in</span>
                </button>
              </Link>
            ) : (
              <>
                <div
                  className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  ref={messageRef}
                  onClick={() => setIsMessageActive(!isMessageActive)}
                >
                  <ChatIcon
                    sx={{ fontSize: '24px', color: '#262626' }}
                    className="hover:scale-110 active:scale-95 transition-transform"
                  />
                  {messageCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-black text-white border-2 border-white shadow-sm">
                      {messageCount > 99 ? '99+' : messageCount}
                    </span>
                  )}
                  {isMessageActive && (
                    <MessageSidebar
                      profile={profile!}
                      messageNotifications={messageNotifications}
                      messageCount={messageCount}
                      openChatPage={openChatPage}
                      setIsMessageActive={setIsMessageActive}
                    />
                  )}
                </div>

                <div
                  className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  ref={notificationRef}
                  onClick={() => {
                    setIsNotificationActive(!isNotificationActive);
                    setIsMessageActive(false);
                  }}
                >
                  <NotificationIcon
                    sx={{ fontSize: '28px', color: '#262626' }}
                    className="hover:scale-110 active:scale-95 transition-transform"
                  />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white border-2 border-white shadow-sm">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                  )}
                  {isNotificationActive && (
                    <NotificationSidebar
                      notifications={notifications}
                      profile={profile!}
                      onMarkAsRead={onMarkAsRead}
                      onDeleteNotification={onDeleteNotification}
                      onMarkAllAsRead={() => setNotificationCount(0)}
                    />
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="outline-none border-none">
                    <div className="cursor-pointer select-none active:scale-95 transition-transform">
                      <Avatar className="h-8 w-8 ring-2 ring-gray-100 shadow-sm">
                        <AvatarImage src={profile?.profilePicture} alt={profile?.username} className="object-cover" />
                        <AvatarFallback className="bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white font-bold uppercase text-[12px]">
                          {profile?.username?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-64 bg-white text-gray-900 border border-gray-100 shadow-2xl p-0 overflow-hidden rounded-2xl mt-3"
                    align="end"
                  >
                    <DropdownMenuGroup className="p-4 flex items-center gap-3 bg-gray-50 border-b border-gray-100">
                      <Avatar className="h-10 w-10 shadow-sm">
                        <AvatarImage src={profile?.profilePicture} className="object-cover" />
                        <AvatarFallback className="bg-gray-200 text-gray-500 font-bold uppercase">
                          {profile?.username?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-[15px]">{profile?.username}</span>
                        <span className="text-[12px] text-gray-400">View your profile</span>
                      </div>
                    </DropdownMenuGroup>

                    <DropdownMenuGroup className="p-2 space-y-1">
                      <DropdownMenuLabel className="px-3 py-2 text-[11px] uppercase text-gray-400 font-black tracking-widest">
                        My Account
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 focus:bg-gray-50 cursor-pointer outline-none transition-colors"
                        onClick={() => ProfileUtils.navigateToProfile(profile!, navigate)}
                      >
                        <span className="w-5 flex justify-center text-gray-600">👤</span>
                        <span className="font-semibold text-[14px]">Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 focus:bg-gray-50 cursor-pointer outline-none transition-colors data-[state=open]:bg-gray-50">
                          <span className="w-5 flex justify-center text-gray-600">⚙️</span>
                          <span className="font-semibold text-[14px]">Settings</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent className="bg-white border border-gray-100 shadow-xl rounded-2xl p-1 min-w-[200px] ml-1">
                            <DropdownMenuItem
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 focus:bg-gray-50 cursor-pointer outline-none transition-colors"
                              onClick={() =>
                                navigate(
                                  `/app/social/profile/${profile?.username}?${createSearchParams({
                                    id: profile?._id as string,
                                    uId: profile?.uId as string,
                                    tab: 'change password'
                                  })}`
                                )
                              }
                            >
                              <span className="w-5 flex justify-center text-gray-500">🔑</span>
                              <span className="font-medium text-[14px]">Change password</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 focus:bg-gray-50 cursor-pointer outline-none transition-colors"
                              onClick={() =>
                                navigate(
                                  `/app/social/profile/${profile?.username}?${createSearchParams({
                                    id: profile?._id as string,
                                    uId: profile?.uId as string,
                                    tab: 'notifications'
                                  })}`
                                )
                              }
                            >
                              <span className="w-5 flex justify-center text-gray-500">🔔</span>
                              <span className="font-medium text-[14px]">Notifications</span>
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator className="bg-gray-100 mx-2" />

                    <DropdownMenuGroup className="p-2">
                      <DropdownMenuItem
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-red-50 focus:bg-red-50 cursor-pointer outline-none text-red-500 transition-colors"
                        onClick={onLogout}
                      >
                        <span className="w-5 flex justify-center">🚪</span>
                        <span className="font-bold text-[14px]">Sign out</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </header>
      )}
    </>
  );
};

export default Header;
