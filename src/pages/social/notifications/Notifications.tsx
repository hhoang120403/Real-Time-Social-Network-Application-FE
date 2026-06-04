import type { ReactionType } from '@app-types/reaction';
import Avatar from '@components/avatar/Avatar';
import NotificationPreview from '@components/dialog/NotificationPreview';
import useEffectOnce from '@hooks/useEffectOnce';
import '@pages/social/notifications/Notifications.scss';
import type { AppDispatch, RootState } from '@redux/store';
import { notificationService } from '@services/api/notifications/notification.service';
import { NotificationUtils } from '@services/utils/notification-utils.service';
import { timeAgo } from '@services/utils/timeago.utils';
import { Utils } from '@services/utils/utils.service';
import { useEffect, useState, useRef } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CheckIcon from '@mui/icons-material/Check';
import SettingsIcon from '@mui/icons-material/Settings';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useNavigate, createSearchParams } from 'react-router-dom';

export interface NotificationDialogState {
  post: string;
  imgUrl: string;
  comment: string;
  reaction?: ReactionType;
  senderName: string;
  secondButtonText?: string;
  secondBtnHandler?: () => void;
  commentImage?: string;
  commentGif?: string;
}

const Notification = () => {
  const { profile } = useSelector((state: RootState) => state.user);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [notificationDialog, setNotificationDialog] = useState<NotificationDialogState>({
    post: '',
    imgUrl: '',
    comment: '',
    reaction: undefined,
    senderName: '',
    secondButtonText: '',
    secondBtnHandler: () => {},
    commentImage: '',
    commentGif: ''
  });
  const dispatch = useDispatch<AppDispatch>();

  const getUserNotifications = async () => {
    try {
      const response = await notificationService.getUserNotifications();
      setNotifications(response.data.notifications);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      Utils.dispatchNotification(error?.response?.data?.message, 'error', dispatch);
    }
  };

  const markAsRead = async (notification: any) => {
    try {
      await NotificationUtils.markAsRead(
        notification?._id as string,
        notification,
        setNotificationDialog,
        setNotifications
      );
    } catch (error: any) {
      Utils.dispatchNotification(error?.response?.data?.message, 'error', dispatch);
    }
  };

  const deleteNotification = async (event: React.MouseEvent, notificationId: string) => {
    event.stopPropagation();
    try {
      const response = await notificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      Utils.dispatchNotification(response?.data?.message, 'success', dispatch);
    } catch (error: any) {
      Utils.dispatchNotification(error?.response?.data?.message, 'error', dispatch);
    }
  };

  const markAllAsRead = async () => {
    try {
      setShowMenu(false);
      await notificationService.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      Utils.dispatchNotification('All notifications marked as read', 'success', dispatch);
    } catch (error: any) {
      Utils.dispatchNotification(error?.response?.data?.message, 'error', dispatch);
    }
  };

  const navigateToSettings = () => {
    setShowMenu(false);
    const params = {
      id: profile?._id,
      uId: profile?.uId,
      tab: 'notifications'
    };
    navigate({
      pathname: `/app/social/profile/${profile?.username}`,
      search: `?${createSearchParams(params as any)}`
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reactions':
        return <ThumbUpIcon className="text-white text-[12px]" />;
      case 'comment':
        return <ChatBubbleIcon className="text-white text-[12px]" />;
      case 'follows':
        return <PersonAddIcon className="text-white text-[12px]" />;
      default:
        return <NotificationsIcon className="text-white text-[12px]" />;
    }
  };

  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'reactions':
        return 'bg-gradient-to-br from-[#1877F2] to-[#0052cc] shadow-[0_2px_4px_rgba(24,119,242,0.4)]';
      case 'comment':
        return 'bg-gradient-to-br from-[#42b72a] to-[#2b8a1a] shadow-[0_2px_4px_rgba(66,183,42,0.4)]';
      case 'follows':
        return 'bg-gradient-to-br from-[#1877F2] to-[#405DE6] shadow-[0_2px_4px_rgba(24,119,242,0.4)]';
      default:
        return 'bg-gradient-to-br from-[#fa3e3e] to-[#b91c1c] shadow-[0_2px_4px_rgba(250,62,62,0.4)]';
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === 'unread') return !notif.read;
    return true;
  });

  const displayCount = isExpanded ? filteredNotifications.length : 6;
  const paginatedNotifications = filteredNotifications.slice(0, displayCount);

  useEffectOnce(() => {
    getUserNotifications();
  });

  useEffect(() => {
    const cleanup = NotificationUtils.socketIONotification(profile!, setNotifications, 'notificationPage');
    return () => cleanup();
  }, [profile, setNotifications]);

  useEffect(() => {
    const handleClickOutsideMenu = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutsideMenu);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideMenu);
    };
  }, [showMenu]);

  return (
    <>
      {notificationDialog?.senderName && (
        <NotificationPreview
          title="Your post"
          post={notificationDialog?.post}
          imgUrl={notificationDialog?.imgUrl}
          comment={notificationDialog?.comment}
          reaction={notificationDialog?.reaction}
          senderName={notificationDialog?.senderName}
          commentImage={notificationDialog?.commentImage}
          commentGif={notificationDialog?.commentGif}
          secondButtonText="Close"
          secondBtnHandler={() => {
            setNotificationDialog({
              post: '',
              imgUrl: '',
              comment: '',
              reaction: undefined,
              senderName: '',
              commentImage: '',
              commentGif: ''
            });
          }}
        />
      )}
      <div className="notifications-page-wrapper">
        <div className="notifications-container">
          {/* Page Header */}
          <div className="notifications-title-box">
            <h1 className="title">Notifications</h1>
            <div className="relative" ref={menuRef}>
              <button type="button" className="menu-trigger-btn" onClick={() => setShowMenu(!showMenu)}>
                <MoreHorizIcon />
              </button>

              {showMenu && (
                <div className="custom-dropdown-menu">
                  <div className="menu-item" onClick={markAllAsRead}>
                    <CheckIcon />
                    <span>Mark all as read</span>
                  </div>
                  <div className="menu-item" onClick={navigateToSettings}>
                    <SettingsIcon />
                    <span>Notification settings</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="filter-pills">
            <button onClick={() => setActiveTab('all')} className={`pill ${activeTab === 'all' ? 'active' : ''}`}>
              All
            </button>
            <button onClick={() => setActiveTab('unread')} className={`pill ${activeTab === 'unread' ? 'active' : ''}`}>
              Unread
            </button>
          </div>

          {/* Earlier Header */}
          {paginatedNotifications.length > 0 && !loading && <div className="section-header">Earlier</div>}

          {paginatedNotifications.length > 0 && (
            <div className="notifications-box">
              {paginatedNotifications.map((notification) => (
                <div
                  className={`notification-box ${!notification?.read ? 'unread' : ''}`}
                  key={notification?._id}
                  onClick={() => markAsRead(notification)}
                >
                  <div className="notification-media">
                    <Avatar
                      name={notification?.userFrom?.username}
                      bgColor={notification?.userFrom?.avatarColor}
                      textColor="#ffffff"
                      size={60} // Reverted to premium larger size
                      avatarSrc={notification?.userFrom?.profilePicture}
                    />
                    {/* Category icon overlay */}
                    <div className={`icon-overlay ${getIconBgColor(notification.notificationType)}`}>
                      {getNotificationIcon(notification.notificationType)}
                    </div>
                  </div>

                  <div className="notification-body">
                    <p className="notification-text">
                      <span className="username">{notification?.userFrom?.username}</span> {notification?.message}
                    </p>
                    <div className="notification-meta">
                      <span className={`time ${!notification?.read ? 'new' : ''}`}>
                        {timeAgo.transform(notification?.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="notification-actions">
                    {!notification?.read && <div className="unread-dot"></div>}
                    <div
                      className="trash-container"
                      onClick={(event) => deleteNotification(event, notification?._id as string)}
                    >
                      <FaTrashAlt size={16} />
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination Button */}
              {!isExpanded && filteredNotifications.length > 6 && (
                <div className="pagination-container">
                  <button onClick={() => setIsExpanded(true)} className="pagination-btn">
                    See previous notifications
                  </button>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="notifications-box">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton-box animate-pulse"></div>
              ))}
            </div>
          )}

          {!loading && paginatedNotifications.length === 0 && (
            <div className="empty-page-box">
              <div className="empty-icon">
                <NotificationsIcon sx={{ fontSize: 80 }} />
              </div>
              <h3>No notifications here</h3>
              <p>
                {activeTab === 'unread'
                  ? "You've caught up with everything!"
                  : "When you get notifications, they'll show up here."}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default Notification;
