// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  loginWithEmail,
  registerWithEmail,
  logout,
  resetPassword,
  getUserProfile,
  updateUserProfile,
} from '../../services/authService';

export const loginAsync = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    return await loginWithEmail(email, password);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const registerAsync = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    return await registerWithEmail(data.email, data.password, data.displayName, data.username);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const logoutAsync = createAsyncThunk('auth/logout', async () => {
  await logout();
});

export const updateProfileAsync = createAsyncThunk('auth/updateProfile', async ({ userId, updates }, { rejectWithValue }) => {
  try {
    return await updateUserProfile(userId, updates);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    profile: null,
    isLoading: false,
    isInitialized: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isInitialized = true;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(registerAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.profile = null;
      })
      .addCase(updateProfileAsync.fulfilled, (state, action) => {
        state.profile = action.payload;
      });
  },
});

export const { setUser, setProfile, clearError, setInitialized } = authSlice.actions;
export default authSlice.reducer;
