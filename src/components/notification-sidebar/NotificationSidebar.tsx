import { useState, useRef, useEffect } from 'react';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Avatar, AvatarFallback, AvatarImage } from '@components/components/ui/avatar';
import { FaTrashAlt } from 'react-icons/fa';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckIcon from '@mui/icons-material/Check';
import SettingsIcon from '@mui/icons-material/Settings';
import MonitorIcon from '@mui/icons-material/Monitor';
import { useNavigate, createSearchParams } from 'react-router-dom';
import { notificationService } from '@services/api/notifications/notification.service';
import { Utils } from '@services/utils/utils.service';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@redux/store';

interface NotificationSidebarProps {
  notifications: any[];
  profile: any;
  onMarkAsRead: (item: any) => void;
  onDeleteNotification: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClose?: () => void;
}

const NotificationSidebar = ({
  notifications,
  profile,
  onMarkAsRead,
  onDeleteNotification,
  onMarkAllAsRead,
  onClose
}: NotificationSidebarProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === 'unread') return !notif.read;
    return true;
  });

  const displayCount = isExpanded ? filteredNotifications.length : 6;
  const paginatedNotifications = filteredNotifications.slice(0, displayCount);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reactions':
        return <ThumbUpIcon className="text-white text-[14px]" />;
      case 'comment':
        return <ChatBubbleIcon className="text-white text-[14px]" />;
      case 'follows':
        return <PersonAddIcon className="text-white text-[14px]" />;
      default:
        return <NotificationsIcon className="text-white text-[14px]" />;
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

  const markAllAsRead = async () => {
    try {
      setShowMenu(false);
      await notificationService.markAllNotificationsAsRead();
      onMarkAllAsRead();
    } catch (error: any) {
      Utils.dispatchNotification(error?.response?.data?.message, 'error', dispatch);
    }
  };

  const navigateToSettings = () => {
    setShowMenu(false);
    if (onClose) onClose();
    const params = {
      id: profile?._id,
      uId: profile?.uId,
      tab: 'notifications'
    };
    navigate({
      pathname: `/app/social/profile/${profile?.username}`,
      search: `?${createSearchParams(params)}`
    });
  };

  const navigateToNotificationsPage = () => {
    setShowMenu(false);
    if (onClose) onClose();
    navigate('/app/social/notifications');
  };

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
    <div
      className="notification-dropdown absolute top-[45px] right-[-10px] w-[360px] bg-[#242526] rounded-2xl shadow-[0_12px_28px_rgba(0,0,0,0.5),0_2px_4px_rgba(0,0,0,0.3)] border border-[#3e4042] z-1000 animate-in fade-in zoom-in-95 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col h-full max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 relative">
          <h2 className="text-[24px] font-bold text-white">Notifications</h2>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-[#3a3b3c] transition-colors outline-none border-none cursor-pointer"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreHorizIcon className="text-[#b0b3b8] text-[20px]" />
            </button>

            {showMenu && (
              <div className="absolute top-full right-0 w-72 bg-[#242526] text-[#e4e6eb] border border-[#3e4042] shadow-2xl p-2 rounded-2xl mt-2 z-1100 animate-in fade-in zoom-in-95 duration-200">
                <div
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#3a3b3c] cursor-pointer transition-colors"
                  onClick={markAllAsRead}
                >
                  <CheckIcon className="text-[20px]" />
                  <span className="font-semibold text-[15px]">Mark all as read</span>
                </div>
                <div
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#3a3b3c] cursor-pointer transition-colors"
                  onClick={navigateToSettings}
                >
                  <SettingsIcon className="text-[20px]" />
                  <span className="font-semibold text-[15px]">Notification settings</span>
                </div>
                <div
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#3a3b3c] cursor-pointer transition-colors"
                  onClick={navigateToNotificationsPage}
                >
                  <MonitorIcon className="text-[20px]" />
                  <span className="font-semibold text-[15px]">Open Notifications</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 px-4 py-2 border-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-full font-bold text-[13px] transition-all active:scale-95 ${activeTab === 'all' ? 'bg-[#38589820] text-[#2e89ff]' : 'bg-[#3a3b3c] text-white hover:bg-[#4e4f50]'}`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-3 py-1.5 rounded-full font-bold text-[13px] transition-all active:scale-95 ${activeTab === 'unread' ? 'bg-[#38589820] text-[#2e89ff]' : 'bg-[#3a3b3c] text-white hover:bg-[#4e4f50]'}`}
          >
            Unread
          </button>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between px-4 py-3 border-none">
          <span className="text-[17px] font-bold text-white">Earlier</span>
          <button
            onClick={navigateToNotificationsPage}
            className="text-[#2e89ff] text-[13px] font-medium hover:bg-[#3a3b3c] px-3 py-1.5 rounded-md transition-colors"
          >
            See all
          </button>
        </div>

        {/* Notification List */}
        <div
          className={`flex-1 ${isExpanded ? 'overflow-y-auto' : 'overflow-hidden'} custom-scrollbar pb-2 border-none`}
        >
          {paginatedNotifications.length > 0 ? (
            paginatedNotifications.map((notification, index) => (
              <div
                key={notification._id || index}
                className="group relative flex items-start gap-3 mx-2 px-2 py-3 rounded-xl hover:bg-[#3a3b3c] transition-all cursor-pointer border-none"
                onClick={() => onMarkAsRead(notification)}
              >
                {/* Avatar with Overlay Icon */}
                <div className="relative shrink-0">
                  <Avatar className="h-[60px] w-[60px] shadow-sm">
                    <AvatarImage
                      src={notification.profilePicture}
                      alt={notification.username}
                      className="object-cover"
                    />
                    <AvatarFallback
                      style={{ backgroundColor: notification.avatarColor }}
                      className="text-white font-bold uppercase text-lg"
                    >
                      {notification.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Category icon overlay */}
                  <div
                    className={`absolute -bottom-1 -right-1 h-7 w-7 rounded-full border-4 border-[#ffffff] flex items-center justify-center ${getIconBgColor(notification.notificationType)}`}
                  >
                    {getNotificationIcon(notification.notificationType)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-4">
                  <p
                    className={`text-[13px] leading-[1.3] line-clamp-3 mb-1 ${!notification.read ? 'text-white' : 'text-[#b0b3b8]'}`}
                  >
                    <span className={`font-bold ${!notification.read ? 'text-white' : 'text-[#e4e6eb]'}`}>
                      {notification.username}
                    </span>{' '}
                    {notification.topText}
                  </p>
                  <span
                    className={`text-[12px] font-medium ${!notification.read ? 'text-[#2e89ff]' : 'text-[#b0b3b8]'}`}
                  >
                    {notification.subText}
                  </span>
                </div>

                {/* Status Indicator & Trash */}
                <div className="flex flex-col items-center justify-center gap-4 shrink-0 self-center">
                  {!notification.read && <div className="h-3 w-3 bg-[#2e89ff] rounded-full shadow-sm"></div>}
                  <button
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-[#4e4f50] rounded-full text-[#b0b3b8] hover:text-white transition-all outline-none border-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNotification(notification._id);
                    }}
                  >
                    <FaTrashAlt size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 opacity-50">
              <NotificationsIcon sx={{ fontSize: 48, color: '#b0b3b8', mb: 1 }} />
              <p className="text-white text-sm">No notifications found</p>
            </div>
          )}
        </div>

        {/* Footer Button */}
        {!isExpanded && filteredNotifications.length > 6 && (
          <div className="p-2 border-t border-[#3e4042] sticky bottom-0 bg-[#242526]">
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full py-2 bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb] font-bold text-[14px] rounded-lg transition-colors active:scale-95 outline-none border-none"
            >
              See previous notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSidebar;
