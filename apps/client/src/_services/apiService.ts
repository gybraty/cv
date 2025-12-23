import { supabase } from '../_utils/supabaseClient'
import type { UpdateUserDto } from '@/types/user'

export const apiService = {
  async getPrivateMessage() {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    if (!token) {
      throw new Error('No active session')
    }

    const response = await fetch('/api/private', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch private message')
    }

    return response.json()
  },

  async getProfile() {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    if (!token) throw new Error('No active session')

    const response = await fetch('/api/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) throw new Error('Failed to fetch profile')
    
    return response.json()
  },

  async updateProfile(data: UpdateUserDto) {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    if (!token) throw new Error('No active session')

    const response = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) throw new Error('Failed to update profile')
    
    return response.json()
  },
}
