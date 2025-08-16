import { create } from 'zustand'
import { supabase } from './supabase'
import { toast } from 'sonner'
import { uploadImages, deleteImage } from './storage'

export type MeetType = 'cars_and_coffee' | 'track_day' | 'show_and_shine' | 'cruise' | 'meetup'
export type AttendanceStatus = 'going' | 'maybe' | 'not_going'

export interface Meet {
  id: string
  title: string
  description: string
  date: string
  time: string
  location_address: string
  location_city: string
  location_state: string
  location_lat: number | null
  location_lng: number | null
  max_attendees: number
  type: MeetType
  image_url: string | null
  organizer_id: string
  created_at: string
  updated_at: string
}

export interface MeetAttendee {
  id: string
  meet_id: string
  user_id: string
  status: AttendanceStatus
  created_at: string
  updated_at: string
}

export interface MeetComment {
  id: string
  meet_id: string
  user_id: string
  comment: string
  created_at: string
  updated_at: string
}

interface MeetsState {
  meets: Meet[]
  userMeets: Meet[]
  attendees: Record<string, MeetAttendee[]>
  comments: Record<string, MeetComment[]>
  isLoading: boolean
  error: string | null
  fetchMeets: () => Promise<void>
  fetchUserMeets: (userId: string) => Promise<void>
  fetchAttendeesForMeet: (meetId: string) => Promise<void>
  createMeet: (meet: Omit<Meet, 'id' | 'created_at' | 'updated_at'>, image?: File) => Promise<void>
  updateMeet: (id: string, meet: Partial<Meet>, newImage?: File) => Promise<void>
  deleteMeet: (id: string) => Promise<void>
  toggleAttendance: (meetId: string) => Promise<void>
  updateAttendance: (meetId: string, status: AttendanceStatus) => Promise<void>
  addComment: (meetId: string, comment: string) => Promise<void>
  updateComment: (commentId: string, comment: string) => Promise<void>
  deleteComment: (commentId: string) => Promise<void>
}

export const useMeets = create<MeetsState>((set, get) => ({
  meets: [],
  userMeets: [],
  attendees: {},
  comments: {},
  isLoading: false,
  error: null,

  fetchMeets: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('meets')
        .select('*')
        .order('date', { ascending: true })

      if (error) throw error

      set({ meets: data || [] })
    } catch (error) {
      console.error('Error fetching meets:', error)
      set({ error: 'Failed to fetch meets' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchUserMeets: async (userId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('meets')
        .select('*')
        .eq('organizer_id', userId)
        .order('date', { ascending: true })

      if (error) throw error

      set({ userMeets: data || [] })
    } catch (error) {
      console.error('Error fetching user meets:', error)
      set({ error: 'Failed to fetch user meets' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchAttendeesForMeet: async (meetId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('meet_attendees')
        .select('*')
        .eq('meet_id', meetId)

      if (error) throw error

      set(state => ({
        attendees: {
          ...state.attendees,
          [meetId]: data || []
        }
      }))
    } catch (error) {
      console.error('Error fetching attendees:', error)
      set({ error: 'Failed to fetch attendees' })
    } finally {
      set({ isLoading: false })
    }
  },

  createMeet: async (meet: Omit<Meet, 'id' | 'created_at' | 'updated_at'>, image?: File) => {
    set({ isLoading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      let imagePath = null
      if (image) {
        const [uploadedPath] = await uploadImages([image], 'post-images')
        imagePath = uploadedPath
      }

      const { data, error } = await supabase
        .from('meets')
        .insert([{
          ...meet,
          organizer_id: user.id,
          image_url: imagePath
        }])
        .select()
        .single()

      if (error) throw error

      set(state => ({
        meets: [data, ...state.meets],
        userMeets: [data, ...state.userMeets]
      }))

      toast.success('Meet created successfully')
    } catch (error) {
      console.error('Error creating meet:', error)
      set({ error: 'Failed to create meet' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  updateMeet: async (id, meet, newImage) => {
    set({ isLoading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      let updatedMeet = { ...meet }

      // If a new image is provided, upload it and update image_url
      if (newImage) {
        const [imagePath] = await uploadImages([newImage], 'post-images')
        
        // Get the current meet to handle existing image
        const { data: currentMeet } = await supabase
          .from('meets')
          .select('image_url')
          .eq('id', id)
          .single()

        if (currentMeet?.image_url) {
          // Delete old image if it exists
          await deleteImage(currentMeet.image_url, 'post-images')
        }

        updatedMeet.image_url = imagePath
      }

      const { data, error } = await supabase
        .from('meets')
        .update(updatedMeet)
        .eq('id', id)
        .eq('organizer_id', user.id) // Ensure user owns the meet
        .select()
        .single()

      if (error) throw error

      set(state => ({
        meets: state.meets.map(m => m.id === id ? data : m),
        userMeets: state.userMeets.map(m => m.id === id ? data : m)
      }))

      toast.success('Meet updated successfully')
    } catch (error) {
      console.error('Error updating meet:', error)
      set({ error: 'Failed to update meet' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  deleteMeet: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get the meet to delete its image
      const { data: meet } = await supabase
        .from('meets')
        .select('image_url')
        .eq('id', id)
        .single()

      if (meet?.image_url) {
        // Delete the image if it exists
        await deleteImage(meet.image_url, 'post-images')
      }

      const { error } = await supabase
        .from('meets')
        .delete()
        .eq('id', id)
        .eq('organizer_id', user.id) // Ensure user owns the meet

      if (error) throw error

      set(state => ({
        meets: state.meets.filter(m => m.id !== id),
        userMeets: state.userMeets.filter(m => m.id !== id)
      }))

      toast.success('Meet deleted successfully')
    } catch (error) {
      console.error('Error deleting meet:', error)
      set({ error: 'Failed to delete meet' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  toggleAttendance: async (meetId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const currentAttendees = get().attendees[meetId] || []
      const isAttending = currentAttendees.some(a => a.user_id === user.id)

      if (isAttending) {
        await supabase
          .from('meet_attendees')
          .delete()
          .eq('user_id', user.id)
          .eq('meet_id', meetId)

        set(state => ({
          attendees: {
            ...state.attendees,
            [meetId]: state.attendees[meetId].filter(a => a.user_id !== user.id)
          }
        }))
      } else {
        const { data: newAttendee, error } = await supabase
          .from('meet_attendees')
          .insert({ user_id: user.id, meet_id: meetId, status: 'going' })
          .select()
          .single()

        if (error) throw error

        set(state => ({
          attendees: {
            ...state.attendees,
            [meetId]: [...(state.attendees[meetId] || []), newAttendee]
          }
        }))
      }
    } catch (error) {
      console.error('Error toggling attendance:', error)
      toast.error('Failed to update attendance')
    }
  },

  updateAttendance: async (meetId, status) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: existingAttendee } = await supabase
        .from('meet_attendees')
        .select('*')
        .eq('meet_id', meetId)
        .eq('user_id', user.id)
        .single()

      if (existingAttendee) {
        const { error } = await supabase
          .from('meet_attendees')
          .update({ status })
          .eq('id', existingAttendee.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('meet_attendees')
          .insert([{
            meet_id: meetId,
            user_id: user.id,
            status
          }])

        if (error) throw error
      }

      // Refresh attendees for this meet
      const { data: attendees, error: attendeesError } = await supabase
        .from('meet_attendees')
        .select('*')
        .eq('meet_id', meetId)

      if (attendeesError) throw attendeesError

      set(state => ({
        attendees: {
          ...state.attendees,
          [meetId]: attendees || []
        }
      }))

      toast.success('Attendance updated successfully')
    } catch (error) {
      console.error('Error updating attendance:', error)
      toast.error('Failed to update attendance')
      throw error
    }
  },

  addComment: async (meetId, comment) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('meet_comments')
        .insert([{
          meet_id: meetId,
          user_id: user.id,
          comment
        }])
        .select()
        .single()

      if (error) throw error

      set(state => ({
        comments: {
          ...state.comments,
          [meetId]: [...(state.comments[meetId] || []), data]
        }
      }))

      toast.success('Comment added successfully')
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
      throw error
    }
  },

  updateComment: async (commentId, comment) => {
    try {
      const { data, error } = await supabase
        .from('meet_comments')
        .update({ comment })
        .eq('id', commentId)
        .select()
        .single()

      if (error) throw error

      set(state => ({
        comments: Object.fromEntries(
          Object.entries(state.comments).map(([meetId, comments]) => [
            meetId,
            comments.map(c => c.id === commentId ? data : c)
          ])
        )
      }))

      toast.success('Comment updated successfully')
    } catch (error) {
      console.error('Error updating comment:', error)
      toast.error('Failed to update comment')
      throw error
    }
  },

  deleteComment: async (commentId) => {
    try {
      const { error } = await supabase
        .from('meet_comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      set(state => ({
        comments: Object.fromEntries(
          Object.entries(state.comments).map(([meetId, comments]) => [
            meetId,
            comments.filter(c => c.id !== commentId)
          ])
        )
      }))

      toast.success('Comment deleted successfully')
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
      throw error
    }
  }
})) 