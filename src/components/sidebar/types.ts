import type { ReactNode } from "react";

export interface SidebarItemData {
  icon?: ReactNode;
  label: string;
  endIcon?: ReactNode;
  to?: string;
  fontWeight?: string;
}

export interface SubscriptionItemData {
  name: string;
  image: string;
  alt?: string;
}

export interface SidebarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}
