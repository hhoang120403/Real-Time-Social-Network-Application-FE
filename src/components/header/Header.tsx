import logo from '@assets/images/logo.svg';
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

const Header = () => {
  const { profile } = useSelector((state: RootState) => state.user);
  const [environment, setEnvironment] = useState('');
  const [settings, setSettings] = useState<ISettingsDropdownItem[]>([]);
  const messageRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLUListElement>(null);
  const settingsRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isMessageActive, setIsMessageActive] = useDetectOutsideClick(messageRef, false);
  const [isNotificationActive, setIsNotificationActive] = useDetectOutsideClick(notificationRef, false);
  const [isSettingsActive, setIsSettingsActive] = useDetectOutsideClick(settingsRef, false);
  const [deleteStorageUsername] = useLocalStorage('username', 'delete');
  const [setLoggedIn] = useLocalStorage('keepLoggedIn', 'set');
  const [deleteSessionPageReload] = useSessionStorage('pageReload', 'delete');

  const backgroundColor = environment === 'DEV' ? '#50b5ff' : environment === 'STG' ? '#e9710f' : '';

  const openChatPage = () => {};

  const onMarkAsRead = () => {};

  const onDeleteNotification = () => {};

  const onLogout = async () => {
    try {
      Utils.clearStore({ dispatch, deleteStorageUsername, deleteSessionPageReload, setLoggedIn });
      await userService.logoutUser();
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };

  useEffectOnce(() => {
    const items = Utils.mapSettingsDropdownItems();
    setSettings(items);
  });

  useEffect(() => {
    const env = Utils.appEnvironment();
    setEnvironment(env);
  }, []);

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
                onClick={() => {
                  setIsNotificationActive(!isNotificationActive);
                  setIsMessageActive(false);
                  setIsSettingsActive(false);
                }}
              >
                <span className="header-list-name">
                  <FaRegBell className="header-list-icon" />
                  <span className="bg-danger-dots dots" data-testid="notification-dots">
                    5
                  </span>
                </span>
                {isNotificationActive && (
                  <ul className="dropdown-ul" ref={notificationRef}>
                    <li className="dropdown-li">
                      <Dropdown
                        title="Notifications"
                        height={300}
                        style={{ right: '250px', top: '20px' }}
                        data={[]}
                        notificationCount={0}
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
                onClick={() => {
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
                onClick={() => {
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
