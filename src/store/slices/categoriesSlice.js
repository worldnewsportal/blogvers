// src/store/slices/categoriesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db, COLLECTIONS } from '../../services/firebase';

export const fetchCategories = createAsyncThunk('categories/fetch', async (_, { rejectWithValue }) => {
  try {
    const q = query(collection(db, COLLECTIONS.CATEGORIES), orderBy('name', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    list: [],
    isLoading: false,
    error: null,
    selected: null,
  },
  reducers: {
    setSelected: (state, action) => {
      state.selected = action.payload;
    },
    // Default categories (shown before Firebase loads)
    setDefaultCategories: (state) => {
      state.list = [
        { id: '1', name: 'تقنية', icon: '💻', color: '#6C63FF', postsCount: 0 },
        { id: '2', name: 'علوم', icon: '🔬', color: '#FF6B6B', postsCount: 0 },
        { id: '3', name: 'ثقافة', icon: '📚', color: '#4ECDC4', postsCount: 0 },
        { id: '4', name: 'أعمال', icon: '💼', color: '#FFE66D', postsCount: 0 },
        { id: '5', name: 'صحة', icon: '🏥', color: '#95E1D3', postsCount: 0 },
        { id: '6', name: 'رياضة', icon: '⚽', color: '#F38181', postsCount: 0 },
        { id: '7', name: 'سفر', icon: '✈️', color: '#FCE38A', postsCount: 0 },
        { id: '8', name: 'فن', icon: '🎨', color: '#EAFFD0', postsCount: 0 },
        { id: '9', name: 'طعام', icon: '🍕', color: '#FF9A3C', postsCount: 0 },
        { id: '10', name: 'ذاتي', icon: '🌱', color: '#B8F0E6', postsCount: 0 },
      ];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.list = action.payload.length > 0 ? action.payload : state.list;
        state.isLoading = false;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelected, setDefaultCategories } = categoriesSlice.actions;
export default categoriesSlice.reducer;
