import { fontAwesomeIcons, sideBarItems, type SidebarItem } from '@services/utils/static.data';
import { useEffect, useState } from 'react';
import '@components/sidebar/Sidebar.scss';
import { createSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@redux/store';

const Sidebar = () => {
  const { profile } = useSelector((state: RootState) => state.user);
  const [sidebar, setSideBar] = useState<SidebarItem[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  const checkUrl = (name: string) => {
    return location.pathname.includes(name.toLowerCase());
  };

  const navigateToPage = (name: string, url: string) => {
    if (name === 'Profile') {
      url = `${url}/${profile?.username}?${createSearchParams({ id: profile?._id ?? '', uId: profile?.uId ?? '' })}`;
    }

    navigate(url);
  };

  useEffect(() => {
    setSideBar(sideBarItems);
  }, []);

  return (
    <div className="app-side-menu">
      <div className="side-menu">
        <ul className="list-unstyled">
          {sidebar.map((data) => (
            <li key={data.index} onClick={() => navigateToPage(data.name, data.url)}>
              <div data-testid="sidebar-list" className={`sidebar-link ${checkUrl(data.name) ? 'active' : ''}`}>
                <div className="menu-icon">{fontAwesomeIcons[data.iconName]}</div>
                <div className="menu-link">
                  <span>{`${data.name}`}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
