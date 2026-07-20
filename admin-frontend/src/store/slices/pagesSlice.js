import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// ---- Async thunks (server round-trips live in Redux; per-block editing
// state, drag ordering, etc. is kept as local component state in the editor
// screen since it doesn't need to be shared or persisted globally). ----

export const fetchPages = createAsyncThunk('pages/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/content/pages');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load pages');
  }
});

export const fetchPageById = createAsyncThunk('pages/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/content/pages/${id}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load page');
  }
});

export const createPage = createAsyncThunk('pages/create', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/content/pages', payload);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create page');
  }
});

export const updatePage = createAsyncThunk('pages/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/content/pages/${id}`, payload);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update page');
  }
});

export const deletePage = createAsyncThunk('pages/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/content/pages/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete page');
  }
});

const pagesSlice = createSlice({
  name: 'pages',
  initialState: {
    list: [],
    current: null,
    isLoading: false,
    error: null
  },
  reducers: {
    clearCurrentPage: (state) => {
      state.current = null;
    },
    clearPagesError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // list
      .addCase(fetchPages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchPages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // fetch one
      .addCase(fetchPageById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      // create
      .addCase(createPage.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.current = action.payload;
      })
      // update
      .addCase(updatePage.fulfilled, (state, action) => {
        state.current = action.payload;
        const idx = state.list.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      // delete
      .addCase(deletePage.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p._id !== action.payload);
      })
      // shared error handler for create/update/delete
      .addMatcher(
        (action) => action.type.startsWith('pages/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.error = action.payload;
        }
      );
  }
});

export const { clearCurrentPage, clearPagesError } = pagesSlice.actions;
export default pagesSlice.reducer;
