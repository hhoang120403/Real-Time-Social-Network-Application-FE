import { createSlice } from '@reduxjs/toolkit';
import { emptyPostData } from '@services/utils/static.data';
import type { ReactionsMap } from '@app-types/post';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface PostState {
  _id: string;
  post: string;
  bgColor: string;
  privacy: string;
  feelings: string;
  gifUrl: string;
  profilePicture: string;
  image: string;
  video: string;
  userId: string;
  username: string;
  email: string;
  avatarColor: string;
  commentsCount: number | string;
  reactions: ReactionsMap;
  imgVersion: string;
  imgId: string;
  videoVersion: string;
  videoId: string;
  createdAt: string;
}

const initialState: PostState = emptyPostData;

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    updatePostItem: (state, action: PayloadAction<Partial<PostState>>) => {
      Object.assign(state, action.payload);
    },
    clearPost: () => {
      return emptyPostData;
    }
  }
});

export const { updatePostItem, clearPost } = postSlice.actions;
export default postSlice.reducer;
