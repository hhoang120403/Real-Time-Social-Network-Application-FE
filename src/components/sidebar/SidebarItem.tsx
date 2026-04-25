import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface SidebarItemProps {
  icon?: ReactNode;
  label: string;
  endIcon?: ReactNode;
  fontSize?: string;
  fontWeight?: string;
  to?: string;
  onClick?: () => void;
}

const SidebarItem = ({
  icon,
  label,
  endIcon,
  fontSize = "text-md",
  fontWeight = "font-[450]",
  to = "/",
  onClick,
}: SidebarItemProps) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex cursor-pointer items-center gap-5 rounded-2xl px-4 py-3 transition-all duration-300 group relative ${
          isActive ? "bg-blue-50/50 text-blue-600" : "hover:bg-gray-50 text-gray-700"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full" />
          )}
          <div className="flex h-6 w-6 shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>
          <div className={`flex-1 truncate ${fontSize} transition-all duration-300 ${
            isActive ? "font-bold tracking-tight" : `${fontWeight}`
          }`}>
            {label}
          </div>
          {endIcon && <div className={`transition-colors ${isActive ? "text-blue-600" : "text-gray-400"}`}>{endIcon}</div>}
        </>
      )}
    </NavLink>
  );
};

export default SidebarItem;
