import { useEffect, useState } from 'react';
import SidebarItem from './SidebarItem';
import SidebarSection from './SidebarSection';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import { mainItems } from './sidebar.data.tsx';
import type { SidebarProps } from './types';

import { useSelector } from 'react-redux';
import type { RootState } from '@redux/store';
import { ProfileUtils } from '@services/utils/profile-utils.service';

const Sidebar = ({ sidebarOpen, toggleSidebar }: SidebarProps) => {
  const { profile: currentUser } = useSelector((state: RootState) => state.user);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    let timeoutId: number;
    const handleResize = () => {
      setIsResizing(true);
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setIsResizing(false);
      }, 200);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleItemClick = () => {
    // Scroll both main and window just in case, plus any overflow containers
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Also target the profile container if it has its own scrollbar
    const overflowContainers = document.querySelectorAll('.overflow-y-auto');
    overflowContainers.forEach((container) => {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    });

    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}
      <div
        className={`fixed top-0 left-0 z-50 flex h-screen w-[260px] flex-col overflow-y-auto bg-white border-r border-gray-100 p-3 text-gray-800 shadow-xl lg:shadow-none ease-in-out lg:top-[70px] lg:z-40 ${
          isResizing ? 'transition-none' : 'transition-transform duration-300'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Mobile Header (Hidden on LG) */}
        <div className="mb-4 flex h- fit shrink-0 items-center justify-start gap-3 px-2 lg:hidden">
          <div
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            onClick={toggleSidebar}
          >
            <MenuIcon sx={{ color: 'black', fontSize: '24px' }} />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <HomeIcon sx={{ color: 'white', fontSize: '20px' }} />
            </div>
            <span className="font-bold text-xl tracking-tight text-blue-600">Chatty</span>
          </div>
        </div>

        {/* Single Main Section */}
        <SidebarSection className="border-none mt-2">
          {mainItems.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              to={item.label === 'Profile' && currentUser ? ProfileUtils.getProfileUrl(currentUser) : item.to}
              onClick={handleItemClick}
            />
          ))}
        </SidebarSection>

        {/* Footer info/copyright */}
        <div className="mt-auto px-6 py-8 border-t border-gray-50">
          <div className="text-[12px] text-gray-400 font-medium tracking-tight">&copy; 2026 ChattyApp Inc.</div>
          <div className="flex gap-3 mt-3 text-[11px] text-gray-400">
            <span className="hover:text-blue-500 cursor-pointer">Privacy</span>
            <span className="hover:text-blue-500 cursor-pointer">Terms</span>
            <span className="hover:text-blue-500 cursor-pointer">Help</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
