import { createSlice } from '@reduxjs/toolkit';
import type { IReaction } from '@app-types/reactions';

const initialState = {
  reactions: [] as IReaction[]
};

const reactionsSlice = createSlice({
  name: 'reactions',
  initialState,
  reducers: {
    addReactions: (state, action) => {
      state.reactions = action.payload;
    }
  }
});

export const { addReactions } = reactionsSlice.actions;
export default reactionsSlice.reducer;
