import { createSlice } from '@reduxjs/toolkit'
import { loginUser, registerUser, logoutUser, checkSession } from '../_actions/authActions'

const initialState: any = {
  user: null,
  session: null,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.session = action.payload.session
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.session = action.payload.session
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.session = null
      })
      // Check Session
      .addCase(checkSession.fulfilled, (state, action) => {
        state.session = action.payload
        state.user = action.payload?.user || null
      })
  },
})

export default authSlice.reducer
