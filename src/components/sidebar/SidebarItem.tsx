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
        `flex cursor-pointer items-center gap-5 rounded-xl px-[10px] py-[9.5px] transition-all duration-200 group ${
          isActive ? "bg-gray-100/80" : "hover:bg-gray-50"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className={`flex h-6 w-6 shrink-0 items-center justify-center transition-colors ${
            isActive ? "text-black" : "text-gray-700"
          }`}>
            {icon}
          </div>
          <div className={`flex-1 truncate ${fontSize} transition-all ${
            isActive ? "font-bold text-black" : `${fontWeight} text-gray-800`
          }`}>
            {label}
          </div>
          {endIcon && <div className={`transition-colors ${isActive ? "text-black" : "text-gray-400"}`}>{endIcon}</div>}
        </>
      )}
    </NavLink>
  );
};

export default SidebarItem;
