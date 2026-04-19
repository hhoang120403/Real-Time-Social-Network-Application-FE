import { Utils } from '@services/utils/utils.service';
import type { IUser } from '@root/types/user';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SearchIcon from '@mui/icons-material/Search';
import { Avatar, AvatarFallback, AvatarImage } from '@components/components/ui/avatar';
import { 
  FaFacebookMessenger, 
  FaBellSlash, 
  FaUserCircle, 
  FaPhoneAlt, 
  FaVideo, 
  FaUserSlash, 
  FaArchive, 
  FaTrashAlt, 
  FaExclamationTriangle,
  FaRegEnvelope,
  FaRegEnvelopeOpen
} from 'react-icons/fa';
import { Divider } from '@mui/material';
import { timeAgo } from '@services/utils/timeago.utils';
import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';

import { ChatUtils } from '@services/utils/chat-utils.service';
import { chatService } from '@services/api/chat/chat.service';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@redux/store';
import { Menu, MenuItem, ListItemText, Fade } from '@mui/material';

interface MessageSidebarProps {
  profile: IUser;
  messageCount: number;
  messageNotifications?: any[];
  openChatPage: (notification: any) => void;
  setIsMessageActive: (active: boolean) => void;
}

const MessageSidebar = ({
  profile,
  messageNotifications = [],
  openChatPage,
  setIsMessageActive
}: MessageSidebarProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleDeleteChat = () => {
    // Local delete logic
    handleMenuClose();
  };

  const handleMarkAsRead = async () => {
    if (!menuData) return;
    try {
      const isSender = menuData.senderUsername?.toLowerCase() === profile?.username?.toLowerCase();
      const receiverId = isSender ? menuData.receiverId : menuData.senderId;
      await chatService.markMessagesAsRead(profile?._id as string, receiverId);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
    handleMenuClose();
  };

  const handleMarkAsUnread = () => {
    handleMenuClose();
  };

  const filteredNotifications = useMemo(() => {
    let list = messageNotifications;

    // Apply Filter (All / Unread)
    if (filter === 'unread') {
      list = list.filter((notification) => {
        const isSender = notification.senderUsername?.toLowerCase() === profile?.username?.toLowerCase();
        return !notification.isRead && !isSender;
      });
    }

    // Apply Local Search
    if (searchTerm.trim()) {
      list = list.filter((notification) => {
        const isSender = notification.senderUsername?.toLowerCase() === profile?.username?.toLowerCase();
        const displayUsername = isSender ? notification.receiverUsername : notification.senderUsername;
        return displayUsername?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    return list;
  }, [filter, messageNotifications, profile, searchTerm]);

  const navigateToChat = () => {
    navigate('/app/social/chat/messages');
    setIsMessageActive(false);
  };

  return (
    <div
      className="message-dropdown absolute top-[40px] right-[-10px] w-[360px] bg-[#242526] rounded-2xl shadow-[0_12px_28px_rgba(0,0,0,0.5),0_2px_4px_rgba(0,0,0,0.3)] border border-[#3e4042] overflow-hidden z-200 animate-in fade-in zoom-in-95 duration-200"
      data-testid="message-sidebar"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col h-full max-h-[85vh]">
        {/* Header section - Chats Title & Action Icons */}
        <div className="flex items-center justify-between px-4 pt-4 pb-1">
          <h2 className="text-[24px] font-black text-white tracking-tight">Chats</h2>
          <div className="flex gap-1">
            {/* Options Tooltip */}
            <div className="group relative">
              <div className="p-2 cursor-pointer rounded-full hover:bg-[#3a3b3c] transition-colors text-gray-300">
                <MoreHorizIcon sx={{ fontSize: 20 }} />
              </div>
              <div className="absolute top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#e4e6eb] text-[#050505] text-[13px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                Options
              </div>
            </div>

            {/* Expand Tooltip - Slighly offset left to avoid edge */}
            <div className="group relative">
              <div
                className="p-2 cursor-pointer rounded-full hover:bg-[#3a3b3c] transition-colors text-gray-300"
                onClick={navigateToChat}
              >
                <OpenInFullIcon sx={{ fontSize: 18 }} />
              </div>
              <div className="absolute top-12 right-0 px-3 py-1.5 bg-[#e4e6eb] text-[#050505] text-[13px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg translate-x-1/4">
                See all in Messenger
              </div>
            </div>

            {/* New Message Tooltip - Aligned to right to prevent overflow */}
            <div className="group relative">
              <div className="p-2 cursor-pointer rounded-full hover:bg-[#3a3b3c] transition-colors text-gray-300">
                <EditNoteIcon sx={{ fontSize: 24 }} />
              </div>
              <div className="absolute top-12 right-0 px-3 py-1.5 bg-[#e4e6eb] text-[#050505] text-[13px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                New message
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar section */}
        <div className="px-4 py-2">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon sx={{ fontSize: 18, color: '#b0b3b8' }} />
            </div>
            <input
              type="text"
              placeholder="Search Messenger"
              className="block w-full pl-10 pr-3 py-2 bg-[#3a3b3c] border-none rounded-full text-[15px] text-white placeholder:text-[#b0b3b8] focus:ring-0 focus:bg-[#4e4f50] transition-colors outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Tabs/Pills */}
        <div className="flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar scroll-smooth">
          <button 
            className={`px-3 py-1.5 rounded-full font-bold text-[13px] whitespace-nowrap active:scale-95 transition-all ${filter === 'all' ? 'bg-[#18191a] text-[#2e89ff]' : 'bg-[#3a3b3c] text-white'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`px-3 py-1.5 rounded-full font-bold text-[13px] whitespace-nowrap hover:bg-[#4e4f50] active:scale-95 transition-all ${filter === 'unread' ? 'bg-[#18191a] text-[#2e89ff]' : 'bg-[#3a3b3c] text-white'}`}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
          <button className="px-3 py-1.5 rounded-full bg-[#3a3b3c] text-white font-bold text-[13px] whitespace-nowrap hover:bg-[#4e4f50] active:scale-95 transition-all">
            Groups
          </button>
          <button className="px-3 py-1.5 rounded-full bg-[#3a3b3c] text-white font-bold text-[13px] whitespace-nowrap hover:bg-[#4e4f50] active:scale-95 transition-all">
            Communities
          </button>
        </div>

        {/* List of Messages */}
        <div className="flex-1 overflow-y-auto px-2 py-1 max-h-[480px] custom-scrollbar">
          {filteredNotifications && filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => {
              // PRESERVING ORIGINAL LOGIC FOR DATA MAPPING
              const isSender = notification.senderUsername?.toLowerCase() === profile?.username?.toLowerCase();
              const displayUsername = isSender ? notification.receiverUsername : notification.senderUsername;
              const displayAvatar = isSender ? notification.receiverProfilePicture : notification.senderProfilePicture;
              const displayAvatarColor = isSender ? notification.receiverAvatarColor : notification.senderAvatarColor;
              const lastMessage = notification.body || notification.message || '';
              const createdAt = notification.createdAt;
              const isUnread = !notification.isRead && !isSender;

              return (
                <div
                  key={Utils.generateString(10)}
                  onClick={() => openChatPage(notification)}
                  className="group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-[#3a3b3c] transition-all active:scale-[0.98] relative"
                >
                  {/* User Avatar with Status Indicator */}
                  <div className="relative shrink-0">
                    <Avatar className="h-14 w-14 shadow-sm">
                      <AvatarImage src={displayAvatar} alt={displayUsername} className="object-cover" />
                      <AvatarFallback
                        style={{ backgroundColor: displayAvatarColor }}
                        className="text-white font-bold uppercase text-lg"
                      >
                        {displayUsername?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Simulated Active Status */}
                    <div className="absolute bottom-0 right-0 h-4 w-4 bg-[#31a24c] border-[3px] border-[#242526] rounded-full"></div>
                  </div>

                  {/* Message Content Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4
                        className={`text-[15px] truncate pr-4 ${isUnread ? 'font-bold text-white' : 'font-medium text-[#e4e6eb]'}`}
                      >
                        {displayUsername}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <p
                        className={`text-[13px] truncate flex-1 ${isUnread ? 'font-black text-white' : 'text-[#b0b3b8]'}`}
                      >
                        {isSender ? `You: ${lastMessage}` : lastMessage}
                      </p>
                      <span className="text-[12px] text-[#b0b3b8] whitespace-nowrap shrink-0">
                        · {timeAgo.transform(createdAt)}
                      </span>
                    </div>
                  </div>
                   {/* Unread & Action Indicators */}
                   <div className="flex flex-col items-center gap-1.5 shrink-0 ml-1">
                     {isUnread && <div className="h-3 w-3 bg-[#2e89ff] rounded-full shadow-sm"></div>}
                   </div>
                 </div>
               );
             })
           ) : (
             <div className="flex flex-col items-center justify-center py-20 text-gray-500">
               <EditNoteIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
               <p className="text-sm">No {filter === 'unread' ? 'unread' : ''} chats found</p>
             </div>
           )}
          </div>

        {/* Floating Footer Button */}
        <div className="border-t border-[#3e4042] p-2 text-center bg-[#242526] sticky bottom-0">
          <button 
            className="w-full py-2.5 text-[#2e89ff] font-bold text-sm hover:bg-[#3a3b3c] rounded-lg transition-colors active:scale-95"
            onClick={navigateToChat}
          >
            See all in Messenger
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageSidebar;
