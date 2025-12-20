import { createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../_services/authService'

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: any, { rejectWithValue }) => {
    try {
      return await authService.login(credentials)
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials: any, { rejectWithValue }) => {
    try {
      return await authService.register(credentials)
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      const session = await authService.getSession()
      return session
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)
