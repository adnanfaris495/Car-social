import { create } from 'zustand'
import { supabase } from './supabase'
import { toast } from 'sonner'

export interface Follow {
  id: string
  follower_id: string
  followed_id: string
  created_at: string
}

interface FollowsState {
  follows: Follow[]
  isLoading: boolean
  error: string | null
  fetchUserFollows: (userId: string) => Promise<void>
  followUser: (followedId: string) => Promise<void>
  unfollowUser: (followedId: string) => Promise<void>
  isFollowing: (followedId: string) => boolean
}

export const useFollows = create<FollowsState>((set, get) => ({
  follows: [],
  isLoading: false,
  error: null,

  fetchUserFollows: async (userId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', userId)

      if (error) throw error
      set({ follows: data || [], isLoading: false })
    } catch (error) {
      console.error('Error fetching follows:', error)
      set({ error: 'Failed to fetch follows', isLoading: false })
    }
  },

  followUser: async (followedId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { data, error } = await supabase
        .from('follows')
        .insert([{ follower_id: userData.user.id, followed_id: followedId }])
        .select()
        .single()

      if (error) throw error
      
      set((state) => ({
        follows: [...state.follows, data],
        isLoading: false
      }))
      
      toast.success('User followed successfully')
    } catch (error) {
      console.error('Error following user:', error)
      set({ error: 'Failed to follow user', isLoading: false })
      toast.error('Failed to follow user')
      throw error
    }
  },

  unfollowUser: async (followedId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', userData.user.id)
        .eq('followed_id', followedId)

      if (error) throw error
      
      set((state) => ({
        follows: state.follows.filter(follow => follow.followed_id !== followedId),
        isLoading: false
      }))
      
      toast.success('User unfollowed successfully')
    } catch (error) {
      console.error('Error unfollowing user:', error)
      set({ error: 'Failed to unfollow user', isLoading: false })
      toast.error('Failed to unfollow user')
      throw error
    }
  },

  isFollowing: (followedId: string) => {
    const { follows } = get()
    return follows.some(follow => follow.followed_id === followedId)
  }
})) 