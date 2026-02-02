import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userApi } from "../api/userApi";

export const fetchUserData = createAsyncThunk(
  "user/fetchUserData",
  async (token, thunkAPI) => {
    try {
      const data = await userApi.getProfile(token);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Błąd serwera");
    }
  }
);


const userSlice = createSlice({
  name: "user",
  initialState: {
    data: null,
    loading: false,
    error: null,
    isLoggedIn: false,
  },
  reducers: {
    logout(state) {
      state.data = null;
      state.isLoggedIn = false;
      localStorage.removeItem("token");
    },
    updateStreak(state){
      state.data = {...state.data, streak_days: state.data.streak_days+1}
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.isLoggedIn = true;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Błąd";
        state.isLoggedIn = false;
      });
  },
});

export const { logout, updateStreak } = userSlice.actions;
export default userSlice.reducer;
