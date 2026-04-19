import HomeIcon from "@mui/icons-material/Home";
import ChatIcon from "@mui/icons-material/Chat";
import PeopleIcon from "@mui/icons-material/People";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import GroupsIcon from "@mui/icons-material/Groups";
import ImageIcon from "@mui/icons-material/Image";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import type { SidebarItemData } from "./types";

export const mainItems: SidebarItemData[] = [
  { icon: <HomeIcon />, label: "Feeds", to: "/app/social/streams" },
  { icon: <ChatIcon />, label: "Chat", to: "/app/social/chat/messages" },
  { icon: <PeopleIcon />, label: "People", to: "/app/social/people" },
  { icon: <HowToRegIcon />, label: "Following", to: "/app/social/following" },
  { icon: <GroupsIcon />, label: "Followers", to: "/app/social/followers" },
  { icon: <ImageIcon />, label: "Photos", to: "/app/social/photos" },
  { icon: <NotificationsIcon />, label: "Notifications", to: "/app/social/notifications" },
  { icon: <PersonIcon />, label: "Profile", to: "/app/social/profile" },
];

export const subscriptions = []; // Clearing if not used, or keep empty
export const youHeaderItem = null; 
export const youItems = [];
