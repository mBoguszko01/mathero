import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userApi } from "../api/userApi";
import SetAvatarModal from "../components/SetAvatarModal/SetAvatarModal";

export const fetchUserData = createAsyncThunk(
  "user/fetchUserData",
  async (token, thunkAPI) => {
    try {
      const data = await userApi.getProfile(token);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Błąd serwera");
    }
  },
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
    updateStreak(state) {
      state.data = { ...state.data, streak_days: state.data.streak_days + 1 };
    },
    updateInfoAfterSession(state, action) {
      const best_daily_tasks_solved =
        state.data.best_daily_tasks_solved < state.data.today_tasks_solved + 5
          ? state.data.today_tasks_solved + 5
          : state.data.best_daily_tasks_solved;
      state.data = {
        ...state.data,
        exp: state.data.exp + action.payload.exp,
        money: state.data.money + action.payload.coins,
        today_tasks_solved: state.data.today_tasks_solved + 5,
        best_daily_tasks_solved,
      };
      // ROZBIEZNOSC W NAZWACH POL! COINS I MONEY!!!
      // TODAY_TASKS_SOLVED USTAWIONE NA SZTYWNO +5
    },
    updateInfoAfterPruchase(state,action){
      state.data = {
        ...state.data,
        exp: action.payload.exp,
        money: action.payload.money,
        level: action.payload.level
      };
    },
    updateAvatar(state, action){
      state.data = {
        ...state.data,
        avatar: action.payload.avatar
      };
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
        console.log(action.payload);
        state.isLoggedIn = true;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Błąd";
        state.isLoggedIn = false;
      });
  },
});

export const { logout, updateStreak, updateInfoAfterSession, updateInfoAfterPruchase, updateAvatar } =
  userSlice.actions;
export default userSlice.reducer;
