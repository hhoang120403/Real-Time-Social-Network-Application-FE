import type { ReactionType } from '@app-types/reaction';
import Avatar from '@components/avatar/Avatar';
import NotificationPreview from '@components/dialog/NotificationPreview';
import useEffectOnce from '@hooks/useEffectOnce';
import '@pages/social/notifications/Notifications.scss';
import type { AppDispatch, RootState } from '@redux/store';
import { notificationService } from '@services/api/notifications/notification.service';
import { NotificationUtils } from '@services/utils/notification-utils.service';
import { timeAgo } from '@services/utils/timeago.utils';
import { Utils } from '@services/utils/utils.service';
import { useEffect, useState } from 'react';
import { FaCircle, FaRegCircle, FaRegTrashAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

export interface NotificationDialogState {
  post: string;
  imgUrl: string;
  comment: string;
  reaction?: ReactionType;
  senderName: string;
  secondButtonText?: string;
  secondBtnHandler?: () => void;
}

const Notification = () => {
  const { profile } = useSelector((state: RootState) => state.user);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationDialog, setNotificationDialog] = useState<NotificationDialogState>({
    post: '',
    imgUrl: '',
    comment: '',
    reaction: undefined,
    senderName: '',
    secondButtonText: '',
    secondBtnHandler: () => {}
  });
  const dispatch = useDispatch<AppDispatch>();

  const getUserNotifications = async () => {
    try {
      const response = await notificationService.getUserNotifications();
      setNotifications(response.data.notifications);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      Utils.dispatchNotification(error?.response?.data?.message, 'error', dispatch);
    }
  };

  const markAsRead = async (notification: any) => {
    try {
      await NotificationUtils.markAsRead(notification?._id as string, notification, setNotificationDialog);
    } catch (error: any) {
      Utils.dispatchNotification(error?.response?.data?.message, 'error', dispatch);
    }
  };

  const deleteNotification = async (event: React.MouseEvent, notificationId: string) => {
    event.stopPropagation();
    try {
      const response = await notificationService.deleteNotification(notificationId);
      Utils.dispatchNotification(response?.data?.message, 'success', dispatch);
    } catch (error: any) {
      Utils.dispatchNotification(error?.response?.data?.message, 'error', dispatch);
    }
  };

  useEffectOnce(() => {
    getUserNotifications();
  });

  useEffect(() => {
    NotificationUtils.socketIONotification(profile!, notifications, setNotifications, 'notificationPage');
  }, [profile, notifications, setNotifications]);

  return (
    <>
      {notificationDialog?.senderName && (
        <NotificationPreview
          title="Your post"
          post={notificationDialog?.post}
          imgUrl={notificationDialog?.imgUrl}
          comment={notificationDialog?.comment}
          reaction={notificationDialog?.reaction}
          senderName={notificationDialog?.senderName}
          secondButtonText="Close"
          secondBtnHandler={() => {
            setNotificationDialog({
              post: '',
              imgUrl: '',
              comment: '',
              reaction: undefined,
              senderName: ''
            });
          }}
        />
      )}
      <div className="notifications-container">
        <div className="notifications">Notifications</div>
        {notifications.length > 0 && (
          <div className="notifications-box">
            {notifications.map((notification, index) => (
              <div
                className="notification-box"
                data-testid="notification-box"
                key={index}
                onClick={() => markAsRead(notification)}
              >
                <div className="notification-box-sub-card">
                  <div className="notification-box-sub-card-media">
                    <div className="notification-box-sub-card-media-image-icon">
                      <Avatar
                        name={notification?.userFrom?.username}
                        bgColor={notification?.userFrom?.avatarColor}
                        textColor="#ffffff"
                        size={40}
                        avatarSrc={notification?.userFrom?.profilePicture}
                      />
                    </div>
                    <div className="notification-box-sub-card-media-body">
                      <h6 className="title">
                        {notification?.message}
                        <small
                          data-testid="subtitle"
                          className="subtitle"
                          onClick={(event) => deleteNotification(event, notification?._id as string)}
                        >
                          <FaRegTrashAlt className="trash" />
                        </small>
                      </h6>
                      <div className="subtitle-body">
                        <small className="subtitle">
                          {!notification?.read ? <FaCircle className="icon" /> : <FaRegCircle className="icon" />}
                        </small>
                        <p className="subtext">{timeAgo.transform(notification?.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && !notifications.length && <div className="notifications-box"></div>}

        {!loading && !notifications.length && (
          <h3 className="empty-page" data-testid="empty-page">
            You have no notification
          </h3>
        )}
      </div>
    </>
  );
};
export default Notification;
