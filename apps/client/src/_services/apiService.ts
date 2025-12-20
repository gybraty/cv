import { supabase } from '../_utils/supabaseClient'

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
}
