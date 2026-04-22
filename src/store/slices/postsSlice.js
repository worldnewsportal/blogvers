// src/store/slices/postsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getLatestPosts,
  getTrendingPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  toggleBookmark,
  searchPosts,
  getPostsByCategory,
} from '../../services/postsService';

export const fetchLatestPosts = createAsyncThunk('posts/fetchLatest', async ({ lastDoc } = {}, { rejectWithValue }) => {
  try {
    return await getLatestPosts(lastDoc);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchTrendingPosts = createAsyncThunk('posts/fetchTrending', async ({ period } = {}, { rejectWithValue }) => {
  try {
    return await getTrendingPosts(period);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchPost = createAsyncThunk('posts/fetchOne', async (postId, { rejectWithValue }) => {
  try {
    return await getPost(postId);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const createPostAsync = createAsyncThunk('posts/create', async ({ postData, userId }, { rejectWithValue }) => {
  try {
    return await createPost(postData, userId);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deletePostAsync = createAsyncThunk('posts/delete', async ({ postId, userId }, { rejectWithValue }) => {
  try {
    await deletePost(postId, userId);
    return postId;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const toggleLikeAsync = createAsyncThunk('posts/toggleLike', async ({ postId, userId }, { rejectWithValue }) => {
  try {
    const liked = await toggleLike(postId, userId);
    return { postId, liked };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const searchPostsAsync = createAsyncThunk('posts/search', async ({ query, lastDoc }, { rejectWithValue }) => {
  try {
    return await searchPosts(query, lastDoc);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    latest: [],
    trending: [],
    currentPost: null,
    searchResults: [],
    lastDoc: null,
    hasMore: true,
    isLoading: false,
    isLoadingMore: false,
    error: null,
    likedPosts: new Set(),
    bookmarkedPosts: new Set(),
  },
  reducers: {
    setLikedPosts: (state, action) => {
      state.likedPosts = new Set(action.payload);
    },
    setBookmarkedPosts: (state, action) => {
      state.bookmarkedPosts = new Set(action.payload);
    },
    clearSearch: (state) => {
      state.searchResults = [];
      state.lastDoc = null;
      state.hasMore = true;
    },
    updatePostInList: (state, action) => {
      const { postId, updates } = action.payload;
      const updatePost = (posts) =>
        posts.map((p) => (p.id === postId ? { ...p, ...updates } : p));
      state.latest = updatePost(state.latest);
      state.trending = updatePost(state.trending);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLatestPosts.pending, (state, action) => {
        if (!action.meta.arg?.lastDoc) {
          state.isLoading = true;
        } else {
          state.isLoadingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchLatestPosts.fulfilled, (state, action) => {
        const { posts, lastDoc, hasMore } = action.payload;
        if (!action.meta.arg?.lastDoc) {
          state.latest = posts;
        } else {
          state.latest = [...state.latest, ...posts];
        }
        state.lastDoc = lastDoc;
        state.hasMore = hasMore;
        state.isLoading = false;
        state.isLoadingMore = false;
      })
      .addCase(fetchLatestPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.error = action.payload;
      })
      .addCase(fetchTrendingPosts.fulfilled, (state, action) => {
        state.trending = action.payload;
      })
      .addCase(fetchPost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        state.currentPost = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createPostAsync.fulfilled, (state, action) => {
        state.latest = [action.payload, ...state.latest];
      })
      .addCase(deletePostAsync.fulfilled, (state, action) => {
        state.latest = state.latest.filter((p) => p.id !== action.payload);
      })
      .addCase(toggleLikeAsync.fulfilled, (state, action) => {
        const { postId, liked } = action.payload;
        if (liked) {
          state.likedPosts.add(postId);
        } else {
          state.likedPosts.delete(postId);
        }
        const updateLikes = (posts) =>
          posts.map((p) =>
            p.id === postId
              ? { ...p, likes: p.likes + (liked ? 1 : -1) }
              : p
          );
        state.latest = updateLikes(state.latest);
        state.trending = updateLikes(state.trending);
        if (state.currentPost?.id === postId) {
          state.currentPost = {
            ...state.currentPost,
            likes: state.currentPost.likes + (liked ? 1 : -1),
          };
        }
      })
      .addCase(searchPostsAsync.fulfilled, (state, action) => {
        const { posts, lastDoc, hasMore } = action.payload;
        if (!action.meta.arg?.lastDoc) {
          state.searchResults = posts;
        } else {
          state.searchResults = [...state.searchResults, ...posts];
        }
        state.lastDoc = lastDoc;
        state.hasMore = hasMore;
      });
  },
});

export const { setLikedPosts, setBookmarkedPosts, clearSearch, updatePostInList } = postsSlice.actions;
export default postsSlice.reducer;
