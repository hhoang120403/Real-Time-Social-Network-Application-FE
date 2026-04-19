import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import checkIcon from '@assets/images/check.svg';
import errorIcon from '@assets/images/error.svg';
import infoIcon from '@assets/images/info.svg';
import warningIcon from '@assets/images/warning.svg';
import { cloneDeep, uniqBy } from 'lodash';
import type { NotificationItem, NotificationPayload, NotificationType } from '@app-types/toast';

const initialState: NotificationItem[] = [];
let list: NotificationItem[] = [];
const toastIcons: Record<NotificationType, { icon: string; color: string }> = {
  success: {
    icon: checkIcon,
    color: '#5cb85c'
  },
  error: {
    icon: errorIcon,
    color: '#d9534f'
  },
  info: {
    icon: infoIcon,
    color: '#5bc0de'
  },
  warning: {
    icon: warningIcon,
    color: '#f0ad4e'
  }
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<NotificationPayload>) => {
      const { message, type } = action.payload;
      // Don't add a toast if there is no message to display
      if (!message) return state;
      const toast = toastIcons[type];

      const toastItem = {
        id: state.length,
        description: message,
        type,
        icon: toast?.icon,
        backgroundColor: toast?.color
      };

      list = cloneDeep(list);
      list.unshift(toastItem);
      list = [...uniqBy(list, 'description')];

      return list;
    },
    clearNotification: () => {
      list = [];
      return [];
    }
  }
});

export const { addNotification, clearNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
