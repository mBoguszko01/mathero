import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userApi } from "../api/userApi";
import SetAvatarModal from "../components/SetAvatarModal/SetAvatarModal";

export const fetchUserData = createAsyncThunk(
  "user/fetchUserData",
  async (token, thunkAPI) => {
    try {
      const data = await userApi.getProfile(token);
      console.log(data);
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
      const exp = action.payload.leveledUp ? (state.data.exp + action.payload.exp) - state.data.level*100 : (state.data.exp + action.payload.exp);
      const level = action.payload.leveledUp ? state.data.level + 1 : state.data.level;
      
      state.data = {
        ...state.data,
        exp,
        money: state.data.money + action.payload.coins,
        today_tasks_solved: state.data.today_tasks_solved + 5,
        best_daily_tasks_solved,
        level,
      };
      // ROZBIEZNOSC W NAZWACH POL! COINS I MONEY!!!
      // TODAY_TASKS_SOLVED USTAWIONE NA SZTYWNO +5
    },
    updateInfoAfterPruchase(state,action){
      state.data = {
        ...state.data,
        exp: action.payload.exp ?? state.data.exp,
        money: action.payload.money,
        level: action.payload.level ?? state.data.level,
        streak_frozen: action.payload.streak_frozen ?? state.data.streak_frozen
      };
    },
    updateAvatar(state, action){
      state.data = {
        ...state.data,
        avatar: action.payload.avatar
      };
    },
    updateHighlightedBadges(state, action) {
      const highlightedBadges = state.data?.highlighted_badges ?? [];

      if (action.payload.type === "SET") {
        const badge = action.payload.badge;

        if (!badge) return;

        state.data = {
          ...state.data,
          highlighted_badges: [
            ...highlightedBadges.filter(
              (highlightedBadge) => highlightedBadge.id !== badge.id,
            ),
            badge,
          ],
        };
        return;
      }

      if (action.payload.type === "UNSET") {
        const badgeId = action.payload.badgeId;

        state.data = {
          ...state.data,
          highlighted_badges: highlightedBadges.filter(
            (badge) => badge.id !== badgeId,
          ),
        };
        return;
      }

      state.data = {
        ...state.data,
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

export const { logout, updateStreak, updateInfoAfterSession, updateInfoAfterPruchase, updateAvatar, updateHighlightedBadges } =
  userSlice.actions;
export default userSlice.reducer;
