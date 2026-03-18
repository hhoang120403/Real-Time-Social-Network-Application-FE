import { createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '@services/api/user/user.service';
import { Utils } from '@services/utils/utils.service';

const getUserSuggestions = createAsyncThunk('user/getSuggestions', async (name, { dispatch }: { dispatch: any }) => {
  try {
    const response = await userService.getUserSuggestions();
    return response.data;
  } catch (error: any) {
    Utils.dispatchNotification(error.response.data.message, 'error', dispatch);
  }
});

export { getUserSuggestions };
