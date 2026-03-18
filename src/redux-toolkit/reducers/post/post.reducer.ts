import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { emptyPostData } from '@services/utils/static.data';

type PostState = typeof emptyPostData;

const initialState: PostState = emptyPostData;

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    updatePostItem: (state, action: PayloadAction<Partial<PostState>>) => {
      for (const [key, value] of Object.entries(action.payload)) {
        state[key] = value;
      }
    },
    clearPost: () => {
      return emptyPostData;
    }
  }
});

export const { updatePostItem, clearPost } = postSlice.actions;
export default postSlice.reducer;
