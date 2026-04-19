import type { IUserNotifications } from '@app-types/user';
import Button from '@components/button/Button';
import '@components/notification-settings/NotificationSettings.scss';
import Toggle from '@components/toggle/Toggle';
import { updateUserProfile } from '@redux/reducers/user/user.reducer';
import type { AppDispatch, RootState } from '@redux/store';
import { userService } from '@services/api/user/user.service';
import { notificationItems } from '@services/utils/static.data';
import { Utils } from '@services/utils/utils.service';
import { cloneDeep } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { FaRegBell, FaRegEnvelope, FaUserPlus, FaRegThumbsUp, FaRegCommentDots } from 'react-icons/fa';

const NotificationSettings = () => {
  let { profile } = useSelector((state: RootState) => state.user);
  const [notificationTypes, setNotificationTypes] = useState<any[]>([]);
  let [notificationSettings, setNotificationSettings] = useState<IUserNotifications>(
    profile?.notifications || {
      messages: false,
      reactions: false,
      comments: false,
      follows: false
    }
  );
  const dispatch = useDispatch<AppDispatch>();

  const getIcon = (type: string) => {
    switch (type) {
      case 'messages':
        return <FaRegEnvelope />;
      case 'follows':
        return <FaUserPlus />;
      case 'reactions':
        return <FaRegThumbsUp />;
      case 'comments':
        return <FaRegCommentDots />;
      default:
        return <FaRegBell />;
    }
  };

  const mapNotificationTypesToggle = useCallback(
    (notifications: any[]) => {
      for (const notification of notifications) {
        const toggled = notificationSettings[notification.type as keyof IUserNotifications];
        notification.toggle = toggled;
      }
      setNotificationTypes(notifications);
    },
    [notificationSettings]
  );

  const updateNotificationTypesToggle = (itemIndex: number) => {
    const updatedData = notificationTypes.map((item, index) => {
      if (index === itemIndex) {
        return {
          ...item,
          toggle: !item.toggle
        };
      }
      return item;
    });
    setNotificationTypes(updatedData);
  };

  const sendNotificationSettings = async () => {
    try {
      const response = await userService.updateNotificationSettings(notificationSettings);
      profile = cloneDeep(profile);
      profile!.notifications = response.data.settings;
      dispatch(updateUserProfile(profile));
      Utils.dispatchNotification(response.data.message, 'success', dispatch);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  useEffect(() => {
    mapNotificationTypesToggle(notificationItems);
  }, [mapNotificationTypesToggle]);

  return (
    <>
      <div className="notification-settings" data-testid="notification-settings">
        <div className="notification-settings-header">
          <div className="header-icon">
            <FaRegBell />
          </div>
          <h3>Notification Preferences</h3>
        </div>
        {notificationTypes.map((data, index) => (
          <div
            className="notification-settings-container"
            key={data.type}
            data-testid="notification-settings-item"
          >
            <div className="notification-settings-container-sub-card">
              <div className="item-icon">{getIcon(data.type)}</div>
              <div className="notification-settings-container-sub-card-body">
                <h6 className="title">{`${data.title}`}</h6>
                <p className="subtext">{data.description}</p>
              </div>
              <div className="toggle" data-testid="toggle-container">
                <Toggle
                  toggle={data.toggle}
                  onClick={() => {
                    updateNotificationTypesToggle(index);
                    notificationSettings = cloneDeep(notificationSettings);
                    notificationSettings[data.type as keyof IUserNotifications] =
                      !notificationSettings[data.type as keyof IUserNotifications];
                    setNotificationSettings(notificationSettings);
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        <div className="btn-group">
          <Button label="Save Changes" className="update" disabled={false} handleClick={sendNotificationSettings} />
        </div>
      </div>
      <div style={{ height: '1px' }}></div>
    </>
  );
};
export default NotificationSettings;
