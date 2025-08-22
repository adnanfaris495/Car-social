'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'

export function useFollow(userId: string, currentUserId: string | null, onFollowChange?: () => void) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Check if current user is following this user
  useEffect(() => {
    if (!currentUserId || !userId) return

    const checkFollowStatus = async () => {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('followed_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking follow status:', error)
      } else {
        setIsFollowing(!!data)
      }
    }

    checkFollowStatus()
  }, [currentUserId, userId, supabase])

  // Get follower count
  useEffect(() => {
    if (!userId) return

    const getFollowerCount = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('follower_count')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error getting follower count:', error)
      } else {
        setFollowerCount(data?.follower_count || 0)
      }
    }

    getFollowerCount()
  }, [userId, supabase])

  const toggleFollow = async () => {
    if (!currentUserId || !userId) {
      toast.error('You must be logged in to follow users')
      return
    }

    setIsLoading(true)

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('followed_id', userId)

        if (error) throw error

        setIsFollowing(false)
        setFollowerCount(prev => Math.max(0, prev - 1))
        toast.success('Unfollowed successfully')
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUserId,
            followed_id: userId
          })

        if (error) throw error

        setIsFollowing(true)
        setFollowerCount(prev => prev + 1)
        toast.success('Followed successfully')
      }

      // Notify parent component about the change
      if (onFollowChange) {
        onFollowChange()
      }

      // Also refresh the follower count from the database to ensure accuracy
      setTimeout(async () => {
        const { data, error } = await supabase
          .from('users')
          .select('follower_count')
          .eq('id', userId)
          .single()

        if (!error && data) {
          setFollowerCount(data.follower_count || 0)
        }
      }, 100)
    } catch (error) {
      console.error('Error toggling follow:', error)
      toast.error('Failed to update follow status')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isFollowing,
    isLoading,
    followerCount,
    toggleFollow
  }
} 