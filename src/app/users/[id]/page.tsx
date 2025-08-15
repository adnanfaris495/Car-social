'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabase'
import { IconUser, IconCalendarEvent, IconUsers, IconShoppingBag, IconCarGarage, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { formatDate, getImageUrl } from '@/lib/utils'
import FollowButton from '@/components/FollowButton'

interface UserProfile {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
  created_at: string
  follower_count: number
  following_count: number
}

interface UserListing {
  id: string
  title: string
  description: string
  price: number
  image_urls: string[]
  created_at: string
}

interface UserCar {
  id: string
  user_id: string
  make: string
  model: string
  year: number
  image_url: string | null
  mods: string[]
  created_at: string
}

export default function UserProfilePage() {
  const params = useParams()
  const session = useSession();
  const user = session?.user;
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [listings, setListings] = useState<UserListing[]>([])
  const [cars, setCars] = useState<UserCar[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [currentCarIndex, setCurrentCarIndex] = useState(0)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!params.id) return

      setIsLoading(true)
      try {
        console.log('Fetching profile for user ID:', params.id)
        
        // Fetch user profile from users table
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select(`
            id,
            username,
            avatar_url,
            bio,
            created_at,
            follower_count,
            following_count
          `)
          .eq('id', params.id)
          .single()

        console.log('Profile query result:', { data: profileData, error: profileError })
        console.log('Follower count:', profileData?.follower_count)
        console.log('Following count:', profileData?.following_count)
        console.log('Full profile data:', profileData)
        console.log('Profile data type:', typeof profileData)
        console.log('Profile data keys:', profileData ? Object.keys(profileData) : 'null')

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          console.error('Error details:', {
            code: profileError.code,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint
          })
          
          if (profileError.code === 'PGRST116') {
            // No rows returned - user doesn't exist
            console.log('User not found in database')
            toast.error('User not found')
            setProfile(null)
            return
          }
          
          // Handle 400 errors specifically
          if (profileError.code === '400' || profileError.message?.includes('400')) {
            console.error('400 error - likely RLS policy issue or invalid query')
            toast.error('Unable to load user profile. Please try again.')
            setProfile(null)
            return
          }
          
          // For other errors, still try to show the profile if we have data
          if (profileData && typeof profileData === 'object') {
            console.log('Using profile data despite error')
            const profileDataTyped = profileData as UserProfile
            const transformedProfile: UserProfile = {
              ...profileDataTyped,
              follower_count: profileDataTyped.follower_count || 0,
              following_count: profileDataTyped.following_count || 0
            }
            setProfile(transformedProfile)
          } else {
            throw profileError
          }
        } else {
          console.log('Profile data fetched successfully:', profileData)

          // Transform the data to match our interface
          const transformedProfile: UserProfile = {
            ...profileData,
            follower_count: profileData.follower_count || 0,
            following_count: profileData.following_count || 0
          }

          setProfile(transformedProfile)
        }

        // Fetch user's marketplace listings
        const { data: listingsData, error: listingsError } = await supabase
          .from('marketplace_listings')
          .select('id, title, description, price, image_urls, created_at')
          .eq('user_id', params.id)
          .order('created_at', { ascending: false })
          .limit(6)

        if (listingsError) {
          console.error('Error fetching listings:', listingsError)
          // Don't throw here, just set empty array
          setListings([])
        } else {
          setListings(listingsData || [])
        }

        // Fetch user's garage cars
        const { data: carsData, error: carsError } = await supabase
          .from('cars')
          .select('id, user_id, make, model, year, image_url, mods, created_at')
          .eq('user_id', params.id)
          .order('created_at', { ascending: false })

        if (carsError) {
          console.error('Error fetching cars:', carsError)
          // Don't throw here, just set empty array
          setCars([])
        } else {
          setCars(carsData || [])
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast.error('Failed to load profile')
        setProfile(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [params.id, supabase, refreshTrigger])

  // Listen for follow count changes
  useEffect(() => {
    if (!params.id) return

    const channel = supabase
      .channel('user_profile_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${params.id}`
        },
        () => {
          console.log('User profile updated, refreshing data...')
          setRefreshTrigger(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [params.id])

  const handleFollowChange = () => {
    // Trigger a refresh when follow status changes
    setRefreshTrigger(prev => prev + 1)
  }

  const nextCar = () => {
    setCurrentCarIndex((prev) => (prev + 1) % cars.length)
  }

  const prevCar = () => {
    setCurrentCarIndex((prev) => (prev - 1 + cars.length) % cars.length)
  }

  const currentCar = cars[currentCarIndex]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="ml-64"> {/* Account for left sidebar */}
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-32 bg-card-background rounded-lg mb-6"></div>
              <div className="h-8 bg-card-background rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-card-background rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="ml-64"> {/* Account for left sidebar */}
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">User not found</h1>
              <p className="text-muted-foreground mb-4">The user you're looking for doesn't exist.</p>
              <p className="text-muted text-sm mb-6">User ID: {params.id}</p>
              <a 
                href="/"
                className="button-primary inline-block"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="ml-64"> {/* Account for left sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="content-card mb-8">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-card-background flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <Image
                    src={getImageUrl('car', profile.avatar_url)}
                    alt={profile.username}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <IconUser size={48} className="text-muted-foreground" />
                )}
              </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-1">
                    {profile.username}
                  </h1>
                </div>
                
                <FollowButton 
                  userId={profile.id} 
                  currentUserId={user?.id || null}
                  variant="outline"
                  size="md"
                  onFollowChange={handleFollowChange}
                />
              </div>

              {profile.bio && (
                <p className="text-muted-foreground mb-4">{profile.bio}</p>
              )}

              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <IconCalendarEvent size={16} />
                  <span>Joined {formatDate(profile.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-4 p-4 bg-card-background rounded-lg border border-card-border">
                <div className="flex items-center gap-2">
                  <IconUsers size={20} className="text-accent-primary" />
                  <div>
                    <div className="text-foreground font-semibold text-lg">
                      {typeof profile.follower_count === 'number' ? profile.follower_count : 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <IconUsers size={20} className="text-accent-primary" />
                  <div>
                    <div className="text-foreground font-semibold text-lg">
                      {typeof profile.following_count === 'number' ? profile.following_count : 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Following</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User's Garage Cars - Single Car Display */}
        {cars.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <IconCarGarage size={24} className="text-accent-primary" />
              <h2 className="text-2xl font-bold text-foreground">Garage</h2>
            </div>
            
            <div className="content-card overflow-hidden">
              <div className="relative">
                {/* Car Image */}
                <div className="relative h-[70vh] min-h-[500px] max-h-[800px]">
                  <Image
                    src={getImageUrl('car', currentCar.image_url || '')}
                    alt={`${currentCar.year} ${currentCar.make} ${currentCar.model}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 100vw"
                  />
                </div>

                {/* Navigation Arrows */}
                {cars.length > 1 && (
                  <>
                    <button
                      onClick={prevCar}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
                    >
                      <IconChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextCar}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
                    >
                      <IconChevronRight size={24} />
                    </button>
                  </>
                )}

                {/* Car Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-2">
                        {currentCar.year} {currentCar.make} {currentCar.model}
                      </h3>
                      {currentCar.mods.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {currentCar.mods.slice(0, 3).map((mod, index) => (
                            <span
                              key={index}
                              className="text-sm bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full"
                            >
                              {mod}
                            </span>
                          ))}
                          {currentCar.mods.length > 3 && (
                            <span className="text-sm bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full">
                              +{currentCar.mods.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Car Counter */}
            {cars.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-4">
                <span className="text-muted font-medium">
                  {currentCarIndex + 1} of {cars.length}
                </span>
                <div className="flex gap-2">
                  {cars.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentCarIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentCarIndex
                          ? 'bg-accent-primary'
                          : 'bg-muted hover:bg-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty Garage State */}
        {cars.length === 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <IconCarGarage size={24} className="text-accent-primary" />
              <h2 className="text-2xl font-bold text-foreground">Garage</h2>
            </div>
            <div className="content-card text-center py-16">
              <IconCarGarage size={64} className="text-muted mx-auto mb-4" />
              <p className="text-muted-foreground">No cars in garage yet</p>
            </div>
          </div>
        )}

        {/* User's Listings */}
        {listings.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <IconShoppingBag size={24} className="text-accent-primary" />
              <h2 className="text-2xl font-bold text-foreground">Marketplace Listings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div key={listing.id} className="content-card overflow-hidden hover-lift">
                  {listing.image_urls && listing.image_urls.length > 0 && (
                    <div className="aspect-video bg-card-background relative">
                      <Image
                        src={getImageUrl('listing', listing.image_urls[0])}
                        alt={listing.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-foreground mb-1">{listing.title}</h3>
                    <p className="text-xl font-bold text-accent-primary mb-2">${listing.price.toLocaleString()}</p>
                    <p className="text-muted-foreground text-sm line-clamp-2">{listing.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty Listings State */}
        {listings.length === 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <IconShoppingBag size={24} className="text-accent-primary" />
              <h2 className="text-2xl font-bold text-foreground">Marketplace Listings</h2>
            </div>
            <div className="content-card text-center py-16">
              <IconShoppingBag size={64} className="text-muted mx-auto mb-4" />
              <p className="text-muted-foreground">No marketplace listings yet</p>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  )
} 