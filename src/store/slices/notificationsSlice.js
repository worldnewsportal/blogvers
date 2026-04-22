// src/store/slices/notificationsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, query, where, orderBy, limit, getDocs, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db, COLLECTIONS } from '../../services/firebase';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (userId, { rejectWithValue }) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const markAllRead = createAsyncThunk('notifications/markAllRead', async (userId, { getState }) => {
  const { notifications } = getState();
  const unread = notifications.list.filter((n) => !n.isRead);
  const batch = writeBatch(db);
  unread.forEach((n) => {
    batch.update(doc(db, COLLECTIONS.NOTIFICATIONS, n.id), { isRead: true });
  });
  await batch.commit();
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    list: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
  },
  reducers: {
    addNotification: (state, action) => {
      state.list = [action.payload, ...state.list];
      if (!action.payload.isRead) state.unreadCount += 1;
    },
    markRead: (state, action) => {
      const notif = state.list.find((n) => n.id === action.payload);
      if (notif && !notif.isRead) {
        notif.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.list = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
        state.isLoading = false;
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.list = state.list.map((n) => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      });
  },
});

export const { addNotification, markRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
