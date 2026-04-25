import { createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '@services/api/user/user.service';
import { Utils } from '@services/utils/utils.service';

const getUserSuggestions = createAsyncThunk(
  'user/getSuggestions',
  async (_name, { dispatch, rejectWithValue }) => {
    try {
      const response = await userService.getUserSuggestions();
      return response.data;
    } catch (error: any) {
      if (!Utils.shouldSkipErrorNotification(error)) {
        Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export { getUserSuggestions };
