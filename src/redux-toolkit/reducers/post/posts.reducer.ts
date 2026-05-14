import { getPosts } from '@redux/api/posts';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PostItem } from '@app-types/post';

const initialState = {
  posts: [] as PostItem[],
  totalPostsCount: 0,
  isLoading: false
};

const postsSlice = createSlice({
  name: 'allPosts',
  initialState,
  reducers: {
    addToPosts: (state, action) => {
      state.posts = [...(action.payload || [])];
    },
    updatePost: (state, action: PayloadAction<PostItem>) => {
      const posts = [...state.posts];
      const index = posts.findIndex((p) => String(p._id) === String(action.payload._id));
      if (index > -1) {
        posts.splice(index, 1, action.payload);
        state.posts = posts;
      }
    },
    incrementSharesCount: (state, action: PayloadAction<string>) => {
      const posts = [...state.posts];
      const index = posts.findIndex((p) => String(p._id) === String(action.payload));
      if (index > -1) {
        const post = { ...posts[index] };
        post.sharesCount = (Number(post.sharesCount) || 0) + 1;
        posts.splice(index, 1, post);
        state.posts = posts;
      }
    },
    incrementSavesCount: (state, action: PayloadAction<string>) => {
      const posts = [...state.posts];
      const index = posts.findIndex((p) => String(p._id) === String(action.payload));
      if (index > -1) {
        const post = { ...posts[index] };
        post.savesCount = (Number(post.savesCount) || 0) + 1;
        posts.splice(index, 1, post);
        state.posts = posts;
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getPosts.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getPosts.fulfilled, (state, action) => {
      state.isLoading = false;
      const { posts = [], totalPosts = 0 } = action.payload || {};
      state.posts = [...posts];
      state.totalPostsCount = totalPosts;
    });
    builder.addCase(getPosts.rejected, (state) => {
      state.isLoading = false;
    });
  }
});

export const { addToPosts, updatePost, incrementSharesCount, incrementSavesCount } = postsSlice.actions;
export default postsSlice.reducer;
