import type { LoginResponse } from '@app-types/api';
import type { Reaction, ReactionType } from '@app-types/reaction';
import type { FormattedReaction } from '@app-types/reactions';
import type { NotificationType } from '@app-types/toast';
import type { IUser } from '@app-types/user';
import { addNotification, clearNotification } from '@redux/reducers/notifications/notification.reducer';
import { addUser, clearUser } from '@redux/reducers/user/user.reducer';
import type { AppDispatch } from '@redux/store';
import type { ISettingsDropdownItem } from '@root/types/settings';
import { avatarColors } from '@services/utils/static.data';
import { floor, random, some } from 'lodash';
import millify from 'millify';

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
    dispatch(clearNotification());
    deleteStorageUsername();
    deleteSessionPageReload();
    setLoggedIn(false);
  }

  static dispatchNotification(message: string, type: NotificationType, dispatch: AppDispatch) {
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

  static checkIfUserIsFollowed(userFollowers: any[], postCreatorId: string, userId: string) {
    return some(userFollowers, (user) => user._id === postCreatorId || postCreatorId === userId);
  }

  static checkIfUserIsOnline(username: string, onlineUsers: string[]) {
    return some(onlineUsers, (user) => user === username?.toLowerCase());
  }

  static firstLetterUpperCase(word: string) {
    if (!word) return '';
    return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
  }

  static formattedReactions(reactions: Reaction) {
    const postReactions: FormattedReaction[] = [];
    for (const [key, value] of Object.entries(reactions)) {
      if (value > 0) {
        const reationObject = {
          type: key as ReactionType,
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
}
