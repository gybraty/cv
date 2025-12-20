import { supabase } from '../_utils/supabaseClient'

export const authService = {
  async login({ email, password }: any) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  async register({ email, password }: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },
  
  async getSession() {
      const { data: { session } } = await supabase.auth.getSession()
      return session
  }
}
