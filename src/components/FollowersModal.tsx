'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { IconUser, IconUsers } from '@tabler/icons-react'
import Image from 'next/image'

interface User {
  id: string
  username: string
  avatar_url: string | null
  created_at: string
}

interface FollowersModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'followers' | 'following'
  userId: string
}

export default function FollowersModal({ isOpen, onClose, type, userId }: FollowersModalProps) {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && userId) {
      fetchUsers()
    }
  }, [isOpen, userId, type])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      let query

      if (type === 'followers') {
        // Get users who follow the current user
        const { data: followsData, error: followsError } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('followed_id', userId)

        if (followsError) {
          console.error(`Error fetching ${type}:`, followsError)
          setUsers([])
          return
        }

        if (followsData && followsData.length > 0) {
          const followerIds = followsData.map(follow => follow.follower_id)
          console.log(`Found ${followerIds.length} ${type} IDs:`, followerIds)
          
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id, username, avatar_url, created_at')
            .in('id', followerIds)

          if (usersError) {
            console.error(`Error fetching users:`, usersError)
            setUsers([])
            return
          }

          console.log(`Fetched ${usersData?.length || 0} user profiles`)
          setUsers(usersData || [])
        } else {
          console.log(`No ${type} found`)
          setUsers([])
        }
      } else if (type === 'following') {
        // Get users that the current user follows
        const { data: followsData, error: followsError } = await supabase
          .from('follows')
          .select('followed_id')
          .eq('follower_id', userId)

        if (followsError) {
          console.error(`Error fetching ${type}:`, followsError)
          setUsers([])
          return
        }

        if (followsData && followsData.length > 0) {
          const followedIds = followsData.map(follow => follow.followed_id)
          console.log(`Found ${followedIds.length} ${type} IDs:`, followedIds)
          
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id, username, avatar_url, created_at')
            .in('id', followedIds)

          if (usersError) {
            console.error(`Error fetching users:`, usersError)
            setUsers([])
            return
          }

          console.log(`Fetched ${usersData?.length || 0} user profiles`)
          setUsers(usersData || [])
        } else {
          console.log(`No ${type} found`)
          setUsers([])
        }
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) {
      return null
    }
    
    if (avatarUrl.startsWith('http')) {
      return avatarUrl
    }
    
    // For Supabase storage URLs
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarUrl}`
  }

  const handleUserClick = (userId: string) => {
    if (!userId) {
      console.error('Invalid user ID provided')
      return
    }
    
    console.log('Navigating to user profile:', userId)
    onClose() // Close the modal
    router.push(`/users/${userId}`) // Navigate to user profile
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col bg-card-background border-card-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground racing-font">
            <IconUsers size={20} />
            {type === 'followers' ? 'Followers' : 'Following'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-3">
              {users.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent-primary/10 hover:text-accent-primary transition-all duration-200 cursor-pointer"
                  onClick={() => handleUserClick(user.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {user.avatar_url ? (
                      <Image
                        src={getAvatarUrl(user.avatar_url) || '/placeholder.jpg'}
                        alt={user.username}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <IconUser size={20} className="text-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{user.username}</p>
                    <p className="text-sm text-muted">
                      Member since {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted">
              <IconUsers size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2 text-foreground">
                No {type} yet
              </p>
              <p className="text-sm">
                {type === 'followers' 
                  ? "When people follow you, they'll appear here."
                  : "People you follow will appear here."
                }
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 