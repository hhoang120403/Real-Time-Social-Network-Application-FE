import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import GroupsIcon from '@mui/icons-material/Groups';
import ImageIcon from '@mui/icons-material/Image';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import type { SidebarItemData } from './types';

export const mainItems: SidebarItemData[] = [
  { icon: <HomeIcon sx={{ color: '#1877f2' }} />, label: 'Feeds', to: '/app/social/streams' },
  { icon: <ChatIcon sx={{ color: '#45bd62' }} />, label: 'Chat', to: '/app/social/chat/messages' },
  { icon: <BookmarkIcon sx={{ color: '#f7b928' }} />, label: 'Saved', to: '/app/social/saved' },
  { icon: <PeopleIcon sx={{ color: '#10d0fb' }} />, label: 'People', to: '/app/social/people' },
  { icon: <HowToRegIcon sx={{ color: '#00cc6a' }} />, label: 'Following', to: '/app/social/following' },
  { icon: <GroupsIcon sx={{ color: '#2781ff' }} />, label: 'Followers', to: '/app/social/followers' },
  { icon: <ImageIcon sx={{ color: '#eb4034' }} />, label: 'Photos', to: '/app/social/photos' },
  { icon: <NotificationsIcon sx={{ color: '#fa3e3e' }} />, label: 'Notifications', to: '/app/social/notifications' },
  { icon: <PersonIcon sx={{ color: '#7b1fa2' }} />, label: 'Profile', to: '/app/social/profile' }
];

export const subscriptions = []; // Clearing if not used, or keep empty
export const youHeaderItem = null;
export const youItems = [];
