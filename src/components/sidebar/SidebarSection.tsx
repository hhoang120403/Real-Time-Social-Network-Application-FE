import type { ReactNode } from "react";

interface SidebarSectionProps {
  children: ReactNode;
  className?: string;
}

const SidebarSection = ({ children, className = "" }: SidebarSectionProps) => {
  return (
    <div className={`flex flex-col border-b border-gray-100 px-0 py-2.5 ${className}`}>
      {children}
    </div>
  );
};

export default SidebarSection;
