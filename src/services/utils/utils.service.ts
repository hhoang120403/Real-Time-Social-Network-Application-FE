import { addUser, clearUser } from '@redux/reducers/user/user.reducer';
import type { AppDispatch } from '@redux/store';
import type { ISettingsDropdownItem } from '@root/types/settings';
import { avatarColors } from '@services/utils/static.data';
import { floor, random } from 'lodash';

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

  static dispatchUser(result, pageReload, dispatch, setUser) {
    pageReload(true);
    console.log('result', result.data.user);
    dispatch(addUser({ token: result.data.token, profile: result.data.user }));
    setUser(result.data.user);
  }

  static clearStore({ dispatch, deleteStorageUsername, deleteSessionPageReload, setLoggedIn }: ClearStoreParams) {
    dispatch(clearUser());
    deleteStorageUsername();
    deleteSessionPageReload();
    setLoggedIn(false);
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
    return `https://res.cloudinary.com/dyamr9ym3/image/upload/v${version}/${id}`;
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
}
