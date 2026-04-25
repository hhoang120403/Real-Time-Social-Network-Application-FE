import type { LoginResponse } from '@app-types/api';
import type { Reaction, ReactionType } from '@app-types/reaction';
import type { FormattedReaction } from '@app-types/reactions';
import type { NotificationType } from '@app-types/toast';
import type { IUser } from '@app-types/user';
import { clearChatState } from '@redux/reducers/chat/chat.reducer';
import { addNotification, clearNotification } from '@redux/reducers/notifications/notification.reducer';
import { addUser, clearUser } from '@redux/reducers/user/user.reducer';
import type { AppDispatch } from '@redux/store';
import type { ISettingsDropdownItem } from '@root/types/settings';
import { isAuthTransitionInProgress } from '@services/axios';
import { avatarColors } from '@services/utils/static.data';
import { findIndex, floor, random, some } from 'lodash';
import millify from 'millify';
import { socketService } from '@services/socket/socket.service';

interface ClearStoreParams {
  dispatch: AppDispatch;
  deleteStorageUsername: () => void;
  deleteSessionPageReload: () => void;
  setLoggedIn: (value: boolean) => void;
}

export class Utils {
  static avatarColor() {
    return avatarColors[floor(random(0.9) * avatarColors.length)];
  }

  static generateAvatarImage(text: string, backgroundColor: string, textColor: string = 'white') {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return '';

    canvas.width = 200;
    canvas.height = 200;

    // Fill background
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    context.font = 'bold 80px sans-serif';
    context.fillStyle = textColor;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text.charAt(0).toUpperCase(), canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL('image/png');
  }

  static dispatchUser(
    result: LoginResponse,
    pageReload: (value: boolean) => void,
    dispatch: AppDispatch,
    setUser: (value: IUser) => void
  ) {
    pageReload(true);
    dispatch(addUser({ token: result.token, profile: result.user }));
    setUser(result.user);
  }

  static clearStore({ dispatch, deleteStorageUsername, deleteSessionPageReload, setLoggedIn }: ClearStoreParams) {
    dispatch(clearUser());
    dispatch(clearChatState());
    dispatch(clearNotification());
    deleteStorageUsername();
    deleteSessionPageReload();
    setLoggedIn(false);
    socketService?.socket?.disconnect();
  }

  static dispatchNotification(message: string, type: NotificationType, dispatch: AppDispatch) {
    if (type === 'error' && isAuthTransitionInProgress()) {
      return;
    }
    dispatch(addNotification({ message, type }));
  }

  static dispatchClearNotification(dispatch: AppDispatch) {
    dispatch(clearNotification());
  }

  static appEnvironment() {
    const env = import.meta.env.VITE_ENVIRONMENT;
    if (env === 'development') {
      return 'DEV';
    }
    if (env === 'staging') {
      return 'STG';
    }
    if (env === 'production') {
      return 'PROD';
    }
    return '';
  }

  static mapSettingsDropdownItems(): ISettingsDropdownItem[] {
    return [
      {
        topText: 'My Profile',
        subText: 'View personal profile.'
      }
    ];
  }
  static appImageUrl(version: string, id: string) {
    if (typeof version === 'string' && typeof id === 'string') {
      version = version.replace(/['"]+/g, '');
      id = id.replace(/['"]+/g, '');
    }
    return `https://res.cloudinary.com/${import.meta.env.VITE_CLOUD_NAME}/image/upload/v${version}/${id}`;
  }

  static appVideoUrl(version: string, id: string) {
    if (typeof version === 'string' && typeof id === 'string') {
      version = version.replace(/['"]+/g, '');
      id = id.replace(/['"]+/g, '');
    }
    return `https://res.cloudinary.com/${import.meta.env.VITE_CLOUD_NAME}/video/upload/v${version}/${id}`;
  }

  static generateString(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = ' ';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  static checkIfUserIsBlocked(blocked: string[], userId: string) {
    return some(blocked, (id) => id === userId);
  }

  static checkIfUserIsFollowed(userFollowers: any[], userId: string) {
    return some(userFollowers, (user) => user._id === userId);
  }

  static checkIfUserIsOnline(username?: string, onlineUsers: any[] = [], userId?: string) {
    const normalizedUsername = username?.toLowerCase();
    const normalizedUserId = userId?.toLowerCase();

    return some(onlineUsers, (user) => {
      if (typeof user === 'string') {
        const normalizedUser = user.toLowerCase();
        return normalizedUser === normalizedUsername || normalizedUser === normalizedUserId;
      }

      const onlineUsername = user?.username || user?.userName || user?.name;
      const onlineUserId = user?._id || user?.userId || user?.id;

      return onlineUsername?.toLowerCase() === normalizedUsername || onlineUserId?.toLowerCase() === normalizedUserId;
    });
  }

  static firstLetterUpperCase(word: string) {
    if (!word) return '';
    return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
  }

  static formattedReactions(reactions: Reaction) {
    const postReactions: FormattedReaction[] = [];
    if (!reactions) return postReactions;
    for (const [key, value] of Object.entries(reactions)) {
      if (value > 0) {
        const reationObject = {
          type: key.toLowerCase() as ReactionType,
          value
        };
        postReactions.push(reationObject);
      }
    }
    return postReactions;
  }

  static shortenLargeNumber(num: number) {
    if (num === undefined) return 0;
    return millify(num);
  }

  static getImage(imageId: string, imageVersion: string) {
    return imageId && imageVersion ? this.appImageUrl(imageVersion, imageId) : '';
  }

  static getVideo(videoId: string, videoVersion: string) {
    return videoId && videoVersion ? this.appVideoUrl(videoVersion, videoId) : '';
  }

  static removeUserFromList(list: any[], userId: string) {
    const index = findIndex(list, (id) => id === userId);
    if (index > -1) {
      list.splice(index, 1);
    }
    return list;
  }

  static checkUrl(url: string, word: string) {
    return url.includes(word);
  }

  static renameFile(element: File) {
    const fileName = element.name.split('.').slice(0, -1).join('.');
    const blob = element.slice(0, element.size, 'image/png');
    const newFile = new File([blob], `${fileName}.png`, { type: 'image/png' });
    return newFile;
  }

  static shouldSkipErrorNotification(error: any) {
    return error?.response?.status === 401 && isAuthTransitionInProgress();
  }
}
