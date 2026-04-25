import { createAsyncThunk } from '@reduxjs/toolkit';
import { postService } from '@services/api/post/post.service';
import { Utils } from '@services/utils/utils.service';

const getPosts = createAsyncThunk('post/getPosts', async (_name, { dispatch, rejectWithValue }) => {
  try {
    const response = await postService.getAllPosts(1);
    return response.data;
  } catch (error: any) {
    if (!Utils.shouldSkipErrorNotification(error)) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
    return rejectWithValue(error.response?.data || error.message);
  }
});

export { getPosts };
