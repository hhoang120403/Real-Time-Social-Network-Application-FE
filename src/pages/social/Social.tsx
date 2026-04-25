import { useEffect, useState, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import '@pages/social/Social.scss';
import Header from '@components/header/Header';
import Sidebar from '@components/sidebar/Sidebar';
import { useDispatch, useSelector } from 'react-redux';
import { Utils } from '@services/utils/utils.service';
import type { AppDispatch, RootState } from '@redux/store';
import { setOnlineUsers } from '@redux/reducers/chat/chat.reducer';
import { ChatUtils } from '@services/utils/chat-utils.service';
import { socketService } from '@services/socket/socket.service';

import { StreamVideoProvider } from '@components/video-call/StreamVideoProvider';

const Social = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const { profile } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const setupSocket = () => {
      if (profile) {
        socketService?.socket?.emit('setup', { userId: profile.username });
        ChatUtils.usersOnline((data: string[]) => {
          dispatch(setOnlineUsers(data));
        });
      }
    };

    setupSocket();

    socketService?.socket?.on('connect', setupSocket);

    return () => {
      socketService?.socket?.off('connect', setupSocket);
    };
  }, [dispatch, profile]);

  // Show pending toast from login/register
  useEffect(() => {
    const pending = sessionStorage.getItem('pendingToast');
    if (pending) {
      try {
        const { message, type } = JSON.parse(pending);
        Utils.dispatchNotification(message, type, dispatch);
      } catch (_) {}
      sessionStorage.removeItem('pendingToast');
    }
  }, [dispatch]);

  useEffect(() => {
    const scrollToTop = () => {
      if (mainRef.current) {
        mainRef.current.scrollTop = 0;
      }
      window.scrollTo(0, 0);
    };

    // Reset immediately
    scrollToTop();

    // Reset again after a brief delay to account for lazy-loaded content or suspense
    const timer = setTimeout(scrollToTop, 10);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      const isLargeScreen = window.innerWidth >= 1024;
      setSidebarOpen(isLargeScreen);
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <StreamVideoProvider>
      <div className="social-layout bg-white h-screen overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex h-[calc(100vh-70px)] mt-[70px]">
          {/* Sidebar Push Spacer: Dedicated to managing layout flow on desktop, hidden on mobile */}
          <div
            className={`dashboard-sidebar shrink-0 transition-all duration-500 hidden lg:block ${
              sidebarOpen ? 'w-[260px]' : 'w-0'
            }`}
          />

          {/* Single Sidebar instance handling its own fixed positioning and overlay logic */}
          <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

          <main
            ref={mainRef}
            className="flex-1 min-w-0 overflow-y-auto custom-scrollbar bg-[#f8f9fa] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] border-t border-l border-gray-100"
          >
            <div className="p-0 lg:p-6 h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </StreamVideoProvider>
  );
};

export default Social;
