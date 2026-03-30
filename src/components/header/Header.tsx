import logo from '@assets/images/logo.png';
import { FaCaretDown, FaRegBell, FaRegEnvelope } from 'react-icons/fa';
import '@components/header/Header.scss';
import Avatar from '@components/avatar/Avatar';
import { useEffect, useState } from 'react';
import { Utils } from '@services/utils/utils.service';
import useDetectOutsideClick from '@hooks/useDetectOutsideClick';
import { useRef } from 'react';
import MessageSidebar from '@components/message-sidebar/MessageSidebar';
import { useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@redux/store';
import Dropdown from '@components/dropdown/Dropdown';
import { FaCaretUp } from 'react-icons/fa6';
import useEffectOnce from '@hooks/useEffectOnce';
import type { ISettingsDropdownItem } from '@root/types/settings';
import { ProfileUtils } from '@services/utils/profile-utils.service';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '@hooks/useLocalStorage';
import useSessionStorage from '@hooks/useSessionStorage';
import { useDispatch } from 'react-redux';
import { userService } from '@services/api/user/user.service';
import HeaderSkeleton from './HeaderSkeleton';
import { notificationService } from '@services/api/notifications/notification.service';
import { NotificationUtils } from '@services/utils/notification-utils.service';
import type { NotificationDialogState } from '@pages/social/notifications/Notifications';
import NotificationPreview from '@components/dialog/NotificationPreview';
import { socketService } from '@services/socket/socket.service';

const Header = () => {
  const { profile } = useSelector((state: RootState) => state.user);
  const [environment, setEnvironment] = useState('');
  const [settings, setSettings] = useState<ISettingsDropdownItem[]>([]);
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
  const messageRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLUListElement>(null);
  const settingsRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isMessageActive, setIsMessageActive] = useDetectOutsideClick(messageRef, false);
  const [isNotificationActive, setIsNotificationActive] = useDetectOutsideClick(notificationRef, false);
  const [isSettingsActive, setIsSettingsActive] = useDetectOutsideClick(settingsRef, false);
  const storedUsername = useLocalStorage('username', 'get');
  const [deleteStorageUsername] = useLocalStorage('username', 'delete');
  const [setLoggedIn] = useLocalStorage('keepLoggedIn', 'set');
  const [deleteSessionPageReload] = useSessionStorage('pageReload', 'delete');

  const backgroundColor = environment === 'DEV' ? '#50b5ff' : environment === 'STG' ? '#e9710f' : '';

  const getUserNotifications = async () => {
    try {
      const response = await notificationService.getUserNotifications();
      const mappedNotifications = NotificationUtils.mapNotificationDropdownItems(
        response.data.notifications,
        setNotificationCount
      );
      setNotifications(mappedNotifications);
      socketService?.socket.emit('setup', { userId: storedUsername });
    } catch (error: any) {
      Utils.dispatchNotification(error?.response?.data?.message, 'error', dispatch);
    }
  };

  const onMarkAsRead = async (notification: any) => {
    try {
      await NotificationUtils.markAsRead(notification?._id as string, notification, setNotificationDialog);
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

  const openChatPage = () => {};

  const onLogout = async () => {
    try {
      Utils.clearStore({ dispatch, deleteStorageUsername, deleteSessionPageReload, setLoggedIn });
      await userService.logoutUser();
      navigate('/');
    } catch (error: any) {
      Utils.dispatchNotification(error.response.data.message, 'error', dispatch);
    }
  };

  useEffectOnce(() => {
    const items = Utils.mapSettingsDropdownItems();
    setSettings(items);
    getUserNotifications();
  });

  useEffect(() => {
    const env = Utils.appEnvironment();
    setEnvironment(env);
  }, []);

  useEffect(() => {
    NotificationUtils.socketIONotification(profile!, notifications, setNotifications, 'header', setNotificationCount);
  }, [profile, notifications, setNotifications]);

  return (
    <>
      {!profile ? (
        <HeaderSkeleton />
      ) : (
        <div className="header-nav-wrapper" data-testid="header-wrapper">
          {isMessageActive && (
            <div ref={messageRef}>
              <MessageSidebar
                profile={profile!}
                messageNotifications={[]}
                messageCount={0}
                openChatPage={openChatPage}
              />
            </div>
          )}
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
          <div className="header-navbar">
            <div className="header-image" data-testid="header-image" onClick={() => navigate('/app/social/streams')}>
              <img src={logo} className="img-fluid" alt="" />
              <div className="app-name">
                Chatty
                {environment && (
                  <span className="environment" style={{ backgroundColor: `${backgroundColor}` }}>
                    {environment}
                  </span>
                )}
              </div>
            </div>
            <div className="header-menu-toggle">
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </div>
            <ul className="header-nav">
              <li
                className="header-nav-item active-item"
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  setIsNotificationActive(!isNotificationActive);
                  setIsMessageActive(false);
                  setIsSettingsActive(false);
                }}
              >
                <span className="header-list-name">
                  <FaRegBell className="header-list-icon" />
                  {notificationCount > 0 && <span className="bg-danger-dots dots">{notificationCount}</span>}
                </span>
                {isNotificationActive && (
                  <ul className="dropdown-ul" ref={notificationRef}>
                    <li className="dropdown-li">
                      <Dropdown
                        title="Notifications"
                        height={300}
                        style={{ right: '250px', top: '20px' }}
                        data={notifications}
                        notificationCount={notificationCount}
                        onMarkAsRead={onMarkAsRead}
                        onDeleteNotification={onDeleteNotification}
                        onNavigate={() => {}}
                        onLogout={() => {}}
                      />
                    </li>
                  </ul>
                )}
                &nbsp;
              </li>
              <li
                className="header-nav-item active-item"
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  setIsMessageActive(!isMessageActive);
                  setIsNotificationActive(false);
                  setIsSettingsActive(false);
                }}
              >
                <span className="header-list-name">
                  <FaRegEnvelope className="header-list-icon" />
                  <span className="bg-danger-dots dots" data-testid="messages-dots"></span>
                </span>
                &nbsp;
              </li>
              <li
                className="header-nav-item"
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  setIsMessageActive(false);
                  setIsNotificationActive(false);
                  setIsSettingsActive(!isSettingsActive);
                }}
              >
                <span className="header-list-name profile-image">
                  <Avatar
                    name={profile?.username || ''}
                    size={40}
                    textColor="#ffffff"
                    bgColor={profile?.avatarColor || 'red'}
                    avatarSrc={profile?.profilePicture || ''}
                  />
                </span>
                <span className="header-list-name profile-name">
                  {profile?.username}
                  {!isSettingsActive ? (
                    <FaCaretDown className="header-list-icon caret" />
                  ) : (
                    <FaCaretUp className="header-list-icon caret" />
                  )}
                </span>
                {isSettingsActive && (
                  <ul className="dropdown-ul" ref={settingsRef}>
                    <li className="dropdown-li">
                      <Dropdown
                        title="Settings"
                        height={300}
                        style={{ right: '150px', top: '40px' }}
                        data={settings}
                        notificationCount={0}
                        onMarkAsRead={() => {}}
                        onDeleteNotification={() => {}}
                        onNavigate={() => ProfileUtils.navigateToProfile(profile!, navigate)}
                        onLogout={onLogout}
                      />
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};
export default Header;
