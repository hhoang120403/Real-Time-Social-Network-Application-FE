import { getUserSuggestions } from '@redux/api/suggestion';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [] as any[],
  isLoading: false
};

const suggestionsSlice = createSlice({
  name: 'suggestions',
  initialState,
  reducers: {
    addToSuggestions: (state, action) => {
      const { isLoading, users } = action.payload;
      state.isLoading = isLoading;
      state.users = [...users];
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getUserSuggestions.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getUserSuggestions.fulfilled, (state, action) => {
      state.isLoading = false;
      const { users } = action.payload;
      state.users = [...users];
    });
    builder.addCase(getUserSuggestions.rejected, (state) => {
      state.isLoading = false;
    });
  }
});

export const { addToSuggestions } = suggestionsSlice.actions;
export default suggestionsSlice.reducer;
