'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionRefresh } from '@/hooks/useSessionRefresh'
import { IconUser, IconLogout, IconMoon, IconShoppingBag, IconCalendarEvent, IconMessageCircle, IconPlus, IconTrash, IconUsers, IconRefresh } from '@tabler/icons-react'
import FollowersModal from '@/components/FollowersModal'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'
import { getImageUrl as getStorageImageUrl } from '@/lib/storage'
import { formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']

export default function ProfilePage() {
  const router = useRouter()
  const session = useSessionRefresh()
  const user = session?.user

  const [userProfile, setUserProfile] = useState<User | null>(null)

  const [userMeets, setUserMeets] = useState<any[]>([])
  const [userPosts, setUserPosts] = useState<any[]>([])
  const [userCars, setUserCars] = useState<any[]>([])
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [showFollowingModal, setShowFollowingModal] = useState(false)
  const [modalType, setModalType] = useState<'followers' | 'following'>('followers')

  useEffect(() => {
    if (session === undefined) return; // Wait for session to load
    if (!user) {
      // Don't redirect here - let middleware handle it
      return
    }

    fetchUserData()
  }, [user, session])

  // Note: Removed periodic refresh to avoid conflicts with manual refresh

  const fetchUserData = async () => {
    if (!user) return

    try {
      setIsLoading(true)

      // Fetch user profile
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      setUserProfile(profileData)



      // Fetch user's meets
      const { data: meetsData } = await supabase
        .from('meets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setUserMeets(meetsData || [])

      // Fetch user's posts
      const { data: postsData } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setUserPosts(postsData || [])

      // Fetch user's cars
      const { data: carsData } = await supabase
        .from('cars')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setUserCars(carsData || [])

    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Failed to load profile data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
    }
  }

  const handleFollowersClick = async () => {
    // Refresh counts first
    await refreshUserProfile()
    setModalType('followers')
    setShowFollowersModal(true)
  }

  const handleFollowingClick = async () => {
    // Refresh counts first
    await refreshUserProfile()
    setModalType('following')
    setShowFollowingModal(true)
  }

  const refreshUserProfile = async () => {
    console.log('Refresh button clicked!')
    if (!user) {
      console.log('No user found, cannot refresh')
      return
    }

    try {
      console.log('Fetching fresh profile data for user:', user.id)
      // Fetch updated user profile with fresh follower/following counts
      const { data: profileData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error refreshing profile:', error)
        toast.error('Failed to refresh profile')
        return
      }

      console.log('Fresh profile data received:', profileData)
      setUserProfile(profileData)
      console.log('Profile refreshed:', profileData)
      console.log('Follower count:', profileData?.follower_count)
      console.log('Following count:', profileData?.following_count)
      toast.success('Profile refreshed!')
    } catch (error) {
      console.error('Error refreshing profile:', error)
      toast.error('Failed to refresh profile')
    }
  }

  const startEditingUsername = () => {
    setIsEditingUsername(true)
    setNewUsername(userProfile?.username || '')
  }

  const saveUsername = async () => {
    if (!user || !userProfile) return

    try {
      const { error } = await supabase
        .from('users')
        .update({ username: newUsername })
        .eq('id', user.id)

      if (error) throw error

      setUserProfile({ ...userProfile, username: newUsername })
      setIsEditingUsername(false)
      toast.success('Username updated successfully')
    } catch (error) {
      console.error('Error updating username:', error)
      toast.error('Failed to update username')
    }
  }

  const cancelEditingUsername = () => {
    setIsEditingUsername(false)
    setNewUsername('')
  }



  if (session === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="ml-64"> {/* Account for left sidebar */}
          <div className="text-muted font-medium">Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="ml-64"> {/* Account for left sidebar */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Please sign in</h2>
            <p className="text-muted mb-6">You need to be signed in to view your profile.</p>
            <Link href="/login" className="button-primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="ml-64"> {/* Account for left sidebar */}
          <div className="text-muted font-medium">Loading profile...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="ml-64"> {/* Account for left sidebar */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Profile Header */}
            <div className="content-card">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-accent-primary flex items-center justify-center">
                  <IconUser size={48} className="text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {userProfile?.username || 'User'}
                  </h1>
                  <p className="text-muted font-medium">
                    Member since {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSignOut}
                    className="button-secondary"
                  >
                    <IconLogout size={20} />
                    Sign Out
                  </button>
                  <button
                    onClick={() => {
                      const currentTheme = document.documentElement.getAttribute('data-theme');
                      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                      document.documentElement.setAttribute('data-theme', newTheme);
                      localStorage.setItem('theme', newTheme);
                    }}
                    className="button-ghost"
                    aria-label="Toggle theme"
                  >
                    <IconMoon size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Followers/Following Section */}
            <div className="content-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={handleFollowersClick}
                  >
                    <IconUsers size={20} className="text-accent-primary" />
                    <div>
                      <div className="text-foreground font-semibold text-lg">
                        {typeof userProfile?.follower_count === 'number' ? userProfile.follower_count : 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </div>
                  </div>
                  
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={handleFollowingClick}
                  >
                    <IconUsers size={20} className="text-accent-primary" />
                    <div>
                      <div className="text-foreground font-semibold text-lg">
                        {typeof userProfile?.following_count === 'number' ? userProfile.following_count : 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Following</div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={refreshUserProfile}
                  className="p-2 text-muted hover:text-accent-primary transition-colors hover:scale-110 active:scale-95"
                  title="Refresh counts"
                >
                  <IconRefresh size={16} />
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="content-card text-center">
                <div className="text-3xl font-bold text-accent-primary mb-2">
                  {userCars.length}
                </div>
                <div className="text-muted font-medium">Cars in Garage</div>
              </div>
              <div className="content-card text-center">
                <div className="text-3xl font-bold text-accent-primary mb-2">
                  Coming Soon
                </div>
                <div className="text-muted font-medium">Marketplace Listings</div>
              </div>
              <div className="content-card text-center">
                <div className="text-3xl font-bold text-accent-primary mb-2">
                  {userPosts.length}
                </div>
                <div className="text-muted font-medium">Forum Posts</div>
              </div>
            </div>

            {/* User's Cars */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">My Cars</h2>
              </div>
              
              {userCars.length === 0 ? (
                <div className="content-card text-center py-12">
                  <IconUser size={48} className="text-muted mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No cars yet</h3>
                  <p className="text-muted mb-4">Visit the Garage to add your cars.</p>
                  <Link href="/garage" className="button-primary">
                    Go to Garage
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userCars.map((car) => {
                    console.log('Car data:', car); // Debug log
                    return (
                      <div key={car.id} className="content-card hover-lift cursor-pointer">
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                          <Image
                            src={car.image_url ? getStorageImageUrl(car.image_url, 'cars') : 'https://via.placeholder.com/400x300/1f2937/ffffff?text=Car+Image'}
                            alt={`${car.year} ${car.make} ${car.model}`}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              console.log('Image failed to load for car:', car.id, car.image_url); // Debug log
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/400x300/1f2937/ffffff?text=Car+Image';
                            }}
                          />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {car.year} {car.make} {car.model}
                        </h3>
                        <p className="text-muted text-sm font-medium">{car.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* User's Listings - Coming Soon */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">My Listings</h2>
                <div className="text-sm text-muted bg-accent-primary/10 px-3 py-1 rounded-full">
                  Coming Soon
                </div>
              </div>
              
              <div className="content-card text-center py-12">
                <IconShoppingBag size={48} className="text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Marketplace Coming Soon</h3>
                <p className="text-muted mb-4">We're building an amazing marketplace for car enthusiasts to buy, sell, and trade vehicles and parts.</p>
                <div className="inline-flex items-center gap-2 text-sm text-muted">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>In Development</span>
                </div>
              </div>
            </div>

            {/* User's Posts */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">My Posts</h2>
              
              {userPosts.length === 0 ? (
                <div className="content-card text-center py-12">
                  <IconMessageCircle size={48} className="text-muted mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No posts yet</h3>
                  <p className="text-muted mb-4">Join the conversation by creating your first forum post.</p>
                  <Link href="/forums" className="button-primary">
                    Browse Forums
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userPosts.map((post) => (
                    <div key={post.id} className="content-card">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        <Link 
                          href={`/forums/${post.brand}/${post.id}`}
                          className="hover:text-accent-primary transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-muted text-sm font-medium mb-2">
                        in {post.brand} • {new Date(post.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-muted">{post.content.substring(0, 150)}...</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Followers/Following Modals */}
      <FollowersModal
        isOpen={showFollowersModal}
        onClose={() => {
          setShowFollowersModal(false)
          refreshUserProfile() // Refresh counts when modal closes
        }}
        type="followers"
        userId={user?.id || ''}
      />
      <FollowersModal
        isOpen={showFollowingModal}
        onClose={() => {
          setShowFollowingModal(false)
          refreshUserProfile() // Refresh counts when modal closes
        }}
        type="following"
        userId={user?.id || ''}
      />
    </div>
  )
} 