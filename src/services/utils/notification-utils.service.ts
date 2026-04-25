import type { NotificationItem } from '@app-types/notification';
import type { IUser } from '@app-types/user';
import { notificationService } from '@services/api/notifications/notification.service';
import { socketService } from '@services/socket/socket.service';
import { cloneDeep, find, findIndex, remove, sumBy } from 'lodash';
import { Utils } from './utils.service';
import { timeAgo } from './timeago.utils';
import { updateChatList } from '@redux/reducers/chat/chat.reducer';

export class NotificationUtils {
  static socketIONotification(
    profile: IUser,
    setNotifications: (notifications: any) => void,
    type: string,
    setNotificationsCount?: (count: number) => void
  ) {
    const onInsert = (data: NotificationItem[], userToData: { userTo: string }) => {
      if (profile?._id === userToData.userTo) {
        setNotifications((_prev: NotificationItem[]) => {
          const newNotifications = [...data];
          if (type === 'notificationPage') {
            return newNotifications;
          } else {
            const mappedNotifications = NotificationUtils.mapNotificationDropdownItems(
              newNotifications,
              setNotificationsCount
            );
            return mappedNotifications;
          }
        });
      }
    };

    const onUpdate = (notificationId: string) => {
      setNotifications((prev: NotificationItem[]) => {
        const clonedNotifications = cloneDeep(prev);
        const notificationData = find(clonedNotifications, (notification) => notification._id === notificationId);
        if (notificationData) {
          const index = findIndex(clonedNotifications, (notification) => notification._id === notificationId);
          notificationData.read = true;
          clonedNotifications.splice(index, 1, notificationData);
          if (type === 'notificationPage') {
            return clonedNotifications;
          } else {
            const mappedNotifications = NotificationUtils.mapNotificationDropdownItems(
              clonedNotifications,
              setNotificationsCount
            );
            return mappedNotifications;
          }
        }
        return prev;
      });
    };

    const onDelete = (notificationId: string) => {
      setNotifications((prev: NotificationItem[]) => {
        const clonedNotifications = cloneDeep(prev);
        remove(clonedNotifications, { _id: notificationId });
        if (type === 'notificationPage') {
          return clonedNotifications;
        } else {
          const mappedNotifications = NotificationUtils.mapNotificationDropdownItems(
            clonedNotifications,
            setNotificationsCount
          );
          return mappedNotifications;
        }
      });
    };

    const onUpdateAll = (userId: string) => {
      if (profile?._id === userId) {
        setNotifications((prev: NotificationItem[]) => {
          const clonedNotifications = cloneDeep(prev);
          for (const notification of clonedNotifications) {
            notification.read = true;
          }
          if (type === 'notificationPage') {
            return clonedNotifications;
          } else {
            const mappedNotifications = NotificationUtils.mapNotificationDropdownItems(
              clonedNotifications,
              setNotificationsCount
            );
            return mappedNotifications;
          }
        });
      }
    };

    socketService?.socket?.on('insert notification', onInsert);
    socketService?.socket?.on('update notification', onUpdate);
    socketService?.socket?.on('delete notification', onDelete);
    socketService?.socket?.on('update all notifications', onUpdateAll);

    return () => {
      socketService?.socket?.off('insert notification', onInsert);
      socketService?.socket?.off('update notification', onUpdate);
      socketService?.socket?.off('delete notification', onDelete);
      socketService?.socket?.off('update all notifications', onUpdateAll);
    };
  }

  static mapNotificationDropdownItems(notificationData: any[], setNotificationsCount?: (count: number) => void) {
    const items = [];
    for (const notification of notificationData) {
      const item = {
        _id: notification?._id,
        topText: notification?.topText ? notification?.topText : notification?.message,
        subText: timeAgo.transform(notification?.createdAt),
        createdAt: notification?.createdAt,
        username: notification?.userFrom ? notification?.userFrom.username : notification?.username,
        avatarColor: notification?.userFrom ? notification?.userFrom.avatarColor : notification?.avatarColor,
        profilePicture: notification?.userFrom ? notification?.userFrom.profilePicture : notification?.profilePicture,
        read: notification?.read,
        post: notification?.post,
        imgUrl: notification?.imgId
          ? Utils.appImageUrl(notification?.imgVersion, notification?.imgId)
          : notification?.gifUrl
            ? notification?.gifUrl
            : notification?.imgUrl,
        comment: notification?.comment,
        reaction: notification?.reaction,
        senderName: notification?.userFrom ? notification?.userFrom.username : notification?.username,
        notificationType: notification?.notificationType
      };
      items.push(item);
    }

    const count = sumBy(items, (selectedNotification) => {
      return !selectedNotification.read ? 1 : 0;
    });
    setNotificationsCount?.(count);
    return items;
  }

  static async markAsRead(
    notificationId: string,
    notification: any,
    setNotificationDialog: (notification: any) => void,
    setNotifications?: any
  ) {
    if (notification.notificationType !== 'follows') {
      const notificationDialog = {
        createdAt: notification?.createdAt,
        post: notification?.post,
        imgUrl: notification?.imgId
          ? Utils.appImageUrl(notification?.imgVersion, notification?.imgId)
          : notification?.gifUrl
            ? notification?.gifUrl
            : notification?.imgUrl,
        comment: notification?.comment,
        reaction: notification?.reaction,
        senderName: notification?.userFrom ? notification?.userFrom.username : notification?.username
      };
      setNotificationDialog(notificationDialog);
    }

    if (setNotifications) {
      setNotifications((prev: any[]) => {
        const clonedNotifications = cloneDeep(prev);
        const index = findIndex(clonedNotifications, (notif) => notif._id === notificationId);
        if (index !== -1) {
          clonedNotifications[index].read = true;
        }
        return clonedNotifications;
      });
    }

    await notificationService.markNotificationAsRead(notificationId);
  }

  static socketIOMessageNotification(profile: any, dispatch: any, location: any, _getConversationList: any) {
    const onChatList = (data: any) => {
      const isReceiver = data?.receiverUsername?.toLowerCase() === profile?.username?.toLowerCase();
      const isSender = data?.senderUsername?.toLowerCase() === profile?.username?.toLowerCase();
      const currentChatId = new URLSearchParams(location.search).get('id');
      const isCurrentOpenChat =
        Utils.checkUrl(location.pathname, 'chat') && isReceiver && `${currentChatId}` === `${data?.senderId}`;

      if (isReceiver || isSender) {
        const chatListItem = {
          ...data,
          isRead: isReceiver ? isCurrentOpenChat || Boolean(data?.isEdited) : data?.isRead
        };

        dispatch(updateChatList(chatListItem));
        if (isReceiver && profile?.notifications?.messages && !data?.isEdited && !isCurrentOpenChat) {
          Utils.dispatchNotification('You have a new message', 'success', dispatch);
        }
      }
    };

    socketService?.socket?.off('chat list', onChatList);
    socketService?.socket?.on('chat list', onChatList);

    return () => {
      socketService?.socket?.off('chat list', onChatList);
    };
  }
}
