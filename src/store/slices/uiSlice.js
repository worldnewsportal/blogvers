// src/store/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: 'dark', // dark | light | system
    language: 'ar',
    fontSize: 'medium', // small | medium | large | xl
    isRTL: true,
    showAds: true,
    isOnboarded: false,
    activeTab: 'home',
    searchQuery: '',
    filters: {
      category: null,
      tag: null,
      sortBy: 'latest', // latest | trending | oldest
    },
  },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      state.isRTL = ['ar', 'he', 'fa', 'ur'].includes(action.payload);
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
    },
    setShowAds: (state, action) => {
      state.showAds = action.payload;
    },
    setIsOnboarded: (state) => {
      state.isOnboarded = true;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = { category: null, tag: null, sortBy: 'latest' };
    },
  },
});

export const {
  setTheme, setLanguage, setFontSize, setShowAds,
  setIsOnboarded, setActiveTab, setSearchQuery,
  setFilters, resetFilters,
} = uiSlice.actions;
export default uiSlice.reducer;
