'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  IconArrowRight, 
  IconMessageCircle, 
  IconClock, 
  IconCar, 
  IconUsers, 
  IconMapPin, 
  IconHeart, 
  IconFlame, 
  IconStar,
  IconCalendarEvent,
  IconTrendingUp,
  IconPlus,
  IconSettings,
  IconCalendar
} from '@tabler/icons-react'
import NearbySection from '@/components/NearbySection'
import FollowButton from '@/components/FollowButton'
import { FALLBACK_IMAGES } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { getImageUrl } from '@/lib/utils'
import { useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation'

interface RecentCar {
  id: string
  make: string
  model: string
  year: number
  image_url: string
  created_at: string
  user: {
    id: string
    username: string
  }
}

interface RecentListing {
  id: string
  title: string
  price: number
  location: string
  image_urls: string[]
  user: {
    username: string
  }
}

interface TrendingPost {
  id: string
  title: string
  content: string
  brand: string
  likes_count: number
  replies_count: number
  created_at: string
  authorName: string
  is_hot: boolean
  is_pinned: boolean
}

interface FeaturedUser {
  id: string
  username: string
  avatar_url: string | null
  follower_count: number
  car_count: number
  latest_car?: {
    make: string
    model: string
    year: number
    image_url: string
  }
}

interface FollowingCar {
  id: string
  make: string
  model: string
  year: number
  image_url: string
  user: {
    id: string
    username: string
    avatar_url: string | null
  }
  mods_count: number
}

export default function HomePage() {
  const session = useSession();
  const user = session?.user;
  const router = useRouter();

  // Don't redirect unauthenticated users - home page should be public
  // Only show loading while session is being determined
  if (session === undefined) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const [recentCars, setRecentCars] = useState<RecentCar[]>([])
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([])
  const [featuredUsers, setFeaturedUsers] = useState<FeaturedUser[]>([])
  const [followingCars, setFollowingCars] = useState<FollowingCar[]>([])
  const [nearbyMeets, setNearbyMeets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        console.log('Starting fetchHomeData...')
        console.log('=== STARTING DATA FETCH ===')
        console.log('Fetching home data, user:', user)
        console.log('Session:', session)
        console.log('Session user:', session?.user)
        console.log('User ID from session:', session?.user?.id)

        // Try to get session directly from supabase
        const { data: { session: directSession } } = await supabase.auth.getSession()
        console.log('Direct session from supabase:', directSession)
        console.log('Direct session user:', directSession?.user)

        // Add a small delay to ensure session is fully loaded
        if (session === undefined) {
          console.log('Session still loading, waiting...')
          return
        }

        // Use the direct session if available, otherwise fall back to the hook session
        const currentSession = directSession || session
        const currentUser = currentSession?.user || user
        console.log('Current session for data fetch:', currentSession)
        console.log('Current user for data fetch:', currentUser)

        // Fetch recent cars with user info
        console.log('Fetching recent cars...')
        const { data: carsData, error: carsError } = await supabase
          .from('cars')
          .select(`
            id,
            make,
            model,
            year,
            image_url,
            user_id,
            created_at
          `)
          .order('created_at', { ascending: false })
          .limit(4)

        if (carsError) {
          console.error('Cars error:', carsError)
          throw carsError
        }
        console.log('Cars data:', carsData)

        // Get user information for cars
        console.log('Fetching user data for cars...')
        let carsWithUsers: any[] = []
        if (carsData && carsData.length > 0) {
          const userIds = carsData.map(car => car.user_id)
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id, username')
            .in('id', userIds)

          if (usersError) throw usersError

          const userMap = new Map(usersData?.map(u => [u.id, u]) || [])
          carsWithUsers = carsData.map((car: any) => ({
            ...car,
            user: userMap.get(car.user_id)
          }))
        }
        console.log('Cars with users:', carsWithUsers)
        setRecentCars(carsWithUsers)

        // Fetch trending posts
        console.log('Fetching trending posts...')
        const { data: postsData, error: postsError } = await supabase
          .from('forum_posts')
          .select(`
            id,
            title,
            content,
            brand,
            author_id,
            created_at,
            likes_count,
            replies_count,
            is_pinned,
            is_hot
          `)
          .order('created_at', { ascending: false })
          .limit(3)

        if (postsError) {
          console.error('Posts error:', postsError)
          throw postsError
        }
        console.log('Posts data:', postsData)

        // Get author information for posts
        console.log('Fetching author data for posts...')
        let postsWithAuthors: any[] = []
        if (postsData && postsData.length > 0) {
          const authorIds = postsData.map(post => post.author_id)
          const { data: authorsData, error: authorsError } = await supabase
            .from('users')
            .select('id, username')
            .in('id', authorIds)

          if (authorsError) throw authorsError

          const authorMap = new Map(authorsData?.map(u => [u.id, u]) || [])
          postsWithAuthors = postsData.map((post: any) => ({
            ...post,
            authorName: authorMap.get(post.author_id)?.username || 'Unknown',
            is_pinned: post.is_pinned || false,
            is_hot: post.is_hot || false
          }))
        }
        console.log('Posts with authors:', postsWithAuthors)
        setTrendingPosts(postsWithAuthors)

        // Fetch featured users
        console.log('Fetching featured users...')
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select(`
            id,
            username,
            avatar_url,
            follower_count
          `)
          .order('follower_count', { ascending: false })
          .limit(3)

        if (usersError) {
          console.error('Featured users error:', usersError)
          throw usersError
        }
        console.log('Featured users data:', usersData)

        // Get latest car for each featured user
        let featuredUsersWithCars: any[] = []
        if (usersData && usersData.length > 0) {
          console.log('Fetching cars for featured users...')
          const userIds = usersData.map(user => user.id)
          const { data: carsData, error: carsError } = await supabase
            .from('cars')
            .select(`
              id,
              make,
              model,
              year,
              image_url,
              user_id
            `)
            .in('user_id', userIds)
            .order('created_at', { ascending: false })

          if (carsError) throw carsError

          // Count cars per user and get latest car
          const userCarCounts = new Map()
          const userLatestCars = new Map()

          carsData?.forEach(car => {
            const count = userCarCounts.get(car.user_id) || 0
            userCarCounts.set(car.user_id, count + 1)
            
            if (!userLatestCars.has(car.user_id)) {
              userLatestCars.set(car.user_id, car)
            }
          })

          featuredUsersWithCars = usersData.map(user => ({
            ...user,
            car_count: userCarCounts.get(user.id) || 0,
            latest_car: userLatestCars.get(user.id)
          }))
        }
        console.log('Featured users with cars:', featuredUsersWithCars)
        setFeaturedUsers(featuredUsersWithCars)

        // Fetch nearby meets
        console.log('Fetching nearby meets...')
        let meetsWithOrganizers: any[] = []
        try {
          const { data: meetsData, error: meetsError } = await supabase
            .from('meets')
            .select(`
              id,
              title,
              description,
              date,
              image_url,
              organizer_id
            `)
            .gte('date', new Date().toISOString())
            .order('date', { ascending: true })
            .limit(2)

          if (meetsError) {
            console.error('Meets error details:', meetsError)
            console.error('Meets error code:', meetsError.code)
            console.error('Meets error message:', meetsError.message)
            throw meetsError
          }
          console.log('Meets data:', meetsData)

          // Get organizer names for meets
          if (meetsData && meetsData.length > 0) {
            const organizerIds = meetsData.map(meet => meet.organizer_id)
            const { data: organizersData, error: organizersError } = await supabase
              .from('users')
              .select('id, username')
              .in('id', organizerIds)

            if (organizersError) throw organizersError

            const organizerMap = new Map(organizersData?.map(u => [u.id, u]) || [])
            meetsWithOrganizers = meetsData.map((meet: any) => ({
              id: meet.id,
              title: meet.title,
              description: meet.description,
              date: meet.date,
              image_url: meet.image_url,
              organizer: {
                username: organizerMap.get(meet.organizer_id)?.username || 'Unknown'
              }
            }))
          }
        } catch (error) {
          console.error('Meets fetching failed:', error)
          meetsWithOrganizers = []
        }
        setNearbyMeets(meetsWithOrganizers)

        // Fetch following cars (friends' first cars) - only if user is logged in
        console.log('=== FOLLOWING CARS DEBUG ===')
        console.log('User object:', user)
        console.log('Session object:', session)
        console.log('Session user:', session?.user)
        console.log('User ID:', user?.id)
        console.log('Session loading:', session === undefined)
        
        // Check if we have a valid user from the session
        console.log('Current user for following cars:', currentUser)
        
        if (currentUser && currentUser.id) {
          console.log('Fetching follows for user:', currentUser.id)
          
          // Get users that the current user is following
          const { data: followsData, error: followsError } = await supabase
            .from('follows')
            .select('followed_id')
            .eq('follower_id', currentUser.id)

          console.log('Follows data:', followsData, 'Error:', followsError)

          if (followsError) {
            console.error('Follows error:', followsError)
            throw followsError
          }

          if (followsData && followsData.length > 0) {
            console.log('Followed user IDs:', followsData.map(f => f.followed_id))
            
            // Get cars from followed users
            const followedUserIds = followsData.map(f => f.followed_id)
            const { data: followingCarsData, error: followingCarsError } = await supabase
              .from('cars')
              .select(`
                id,
                make,
                model,
                year,
                image_url,
                user_id
              `)
              .in('user_id', followedUserIds)
              .order('created_at', { ascending: false })
              .limit(6)

            console.log('Following cars data:', followingCarsData, 'Error:', followingCarsError)

            if (followingCarsError) {
              console.error('Following cars error:', followingCarsError)
              throw followingCarsError
            }

            // Get user information for following cars
            let followingCarsWithUsers: any[] = []
            if (followingCarsData && followingCarsData.length > 0) {
              const userIds = followingCarsData.map(car => car.user_id)
              const { data: followingUsersData, error: followingUsersError } = await supabase
                .from('users')
                .select('id, username')
                .in('id', userIds)

              if (followingUsersError) throw followingUsersError

              const userMap = new Map(followingUsersData?.map(u => [u.id, u]) || [])
              followingCarsWithUsers = followingCarsData.map((car: any) => ({
                ...car,
                user: userMap.get(car.user_id)
              }))
            }

            console.log('Following cars with users:', followingCarsWithUsers)
            setFollowingCars(followingCarsWithUsers)
          } else {
            console.log('No follows found, setting empty array')
            setFollowingCars([])
          }
        } else {
          console.log('User not logged in or session not loaded, setting empty following cars')
          setFollowingCars([])
        }

        console.log('=== FINAL DATA SUMMARY ===')
        console.log('Setting state with:', {
          recentCars: carsWithUsers.length,
          trendingPosts: postsWithAuthors.length,
          featuredUsers: featuredUsersWithCars.length,
          nearbyMeets: meetsWithOrganizers.length,
          followingCars: currentUser && currentUser.id ? 'will be set separately' : 'empty'
        })

        console.log('=== STATE SET COMPLETE ===')
      } catch (error) {
        console.error('Error fetching home data:', error)
      } finally {
        console.log('Setting isLoading to false')
        setIsLoading(false)
      }
    }

    fetchHomeData()
  }, [user, session]) // Add user and session as dependencies

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleCarClick = (car: FollowingCar) => {
    router.push(`/users/${car.user.id}`)
  }

  const handleRecentCarClick = (car: RecentCar) => {
    router.push(`/users/${car.user.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="ml-64"> {/* Account for left sidebar */}
        <div className="container mx-auto px-4 py-8">
          {/* Instagram-style Layout */}
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Main Feed (3/4 width) */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Stories-like Section - Following Cars */}
                {user && (
                  <div className="bg-card-background/50 backdrop-blur-sm rounded-xl p-6 border border-card-border">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-foreground">Following</h2>
                      <Link 
                        href="/garage" 
                        className="text-accent-primary hover:text-accent-primary/80 text-sm font-medium"
                      >
                        View All
                      </Link>
                    </div>

                    {isLoading ? (
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="animate-pulse flex-shrink-0">
                            <div className="w-20 h-20 bg-muted rounded-full mb-2"></div>
                            <div className="w-16 h-3 bg-muted rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {(() => {
                          // Group cars by user and show only one car per user
                          const userCarsMap = new Map<string, FollowingCar>();
                          
                          followingCars.forEach(car => {
                            const userId = car.user.id;
                            if (!userCarsMap.has(userId)) {
                              // First car for this user
                              userCarsMap.set(userId, car);
                            }
                            // If this user has a favorite car, prioritize it
                            // For now, we'll just take the first car since we don't have favorite car data in FollowingCar
                          });
                          
                          const uniqueUserCars = Array.from(userCarsMap.values());
                          
                          return uniqueUserCars.map((car) => (
                            <div 
                              key={car.id} 
                              className="group cursor-pointer flex-shrink-0 text-center"
                              onClick={() => handleCarClick(car)}
                            >
                              <div className="relative w-20 h-20 rounded-full overflow-hidden mb-2 ring-2 ring-transparent group-hover:ring-accent-primary transition-all duration-200">
                                <Image
                                  src={getImageUrl('car', car.image_url)}
                                  alt={`${car.year} ${car.make} ${car.model}`}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = FALLBACK_IMAGES.car;
                                  }}
                                />
                              </div>
                              <p className="text-xs text-muted truncate w-20">@{car.user.username}</p>
                            </div>
                          ));
                        })()}
                        
                        {followingCars.length === 0 && (
                          <div className="text-center py-8 w-full">
                            <IconUsers size={32} className="text-muted mx-auto mb-3" />
                            <p className="text-sm text-muted">Follow users to see their cars</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Main Feed - Recent Cars */}
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Updates</h2>
                  </div>
                  
                  {isLoading ? (
                    <div className="space-y-6">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-card-background/50 backdrop-blur-sm rounded-xl border border-card-border animate-pulse">
                          <div className="p-4 border-b border-card-border">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-muted rounded-full"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-muted rounded w-1/3"></div>
                              </div>
                            </div>
                          </div>
                          <div className="aspect-square bg-muted"></div>
                          <div className="p-4 space-y-2">
                            <div className="h-5 bg-muted rounded"></div>
                            <div className="h-4 bg-muted rounded w-2/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {recentCars
                        .filter(car => car.user.id !== user?.id) // Filter out current user's cars
                        .map((car) => (
                        <article key={car.id} className="bg-card-background/50 backdrop-blur-sm rounded-xl border border-card-border overflow-hidden hover:shadow-lg transition-all duration-200">
                          {/* Car Image */}
                          <div className="relative aspect-video">
                            <Image
                              src={getImageUrl('car', car.image_url)}
                              alt={`${car.year} ${car.make} ${car.model}`}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = FALLBACK_IMAGES.car;
                              }}
                            />
                            {/* Overlay with car info */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-xl font-bold text-white mb-1">
                                    {car.year} {car.make} {car.model}
                                  </h3>
                                  <p className="text-sm text-white/80">
                                    Added by @{car.user.username}
                                  </p>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                                  <IconCar size={20} className="text-white" />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action buttons */}
                          <div className="p-4 flex items-center justify-between">
                            <button 
                              onClick={() => handleRecentCarClick(car)}
                              className="flex items-center gap-2 text-accent-primary hover:text-accent-primary/80 text-sm font-medium transition-colors"
                            >
                              <IconCar size={16} />
                              View Details
                            </button>
                            <div className="flex items-center gap-4 text-muted text-sm">
                              <span className="flex items-center gap-1">
                                <IconCalendar size={14} />
                                {formatDate(car.created_at || new Date().toISOString())}
                              </span>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar (1/4 width) */}
              <div className="space-y-6">
                {/* Featured Users */}
                <div className="bg-card-background/50 backdrop-blur-sm rounded-xl p-4 border border-card-border">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Suggested Users</h2>
                  
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-muted rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-muted rounded w-3/4"></div>
                              <div className="h-3 bg-muted rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(() => {
                        // Filter out users you already follow and current user
                        const followedUserIds = followingCars.map(car => car.user.id);
                        const suggestedUsers = featuredUsers.filter(user => 
                          !followedUserIds.includes(user.id) && user.id !== session?.user?.id
                        );
                        
                        if (suggestedUsers.length === 0) {
                          return (
                            <div className="text-center py-4">
                              <IconUsers size={24} className="text-muted mx-auto mb-2" />
                              <p className="text-xs text-muted">No new users to suggest</p>
                            </div>
                          );
                        }
                        
                        return suggestedUsers.map((user) => (
                          <div key={user.id} className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                              {user.avatar_url ? (
                                <Image
                                  src={user.avatar_url}
                                  alt={user.username}
                                  width={48}
                                  height={48}
                                  className="rounded-full object-cover"
                                />
                              ) : (
                                <IconUsers size={24} className="text-muted" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{user.username}</p>
                              <p className="text-xs text-muted">{user.follower_count} followers</p>
                            </div>
                            <FollowButton 
                              userId={user.id}
                              currentUserId={session?.user?.id || null}
                              variant="ghost"
                              size="sm"
                            />
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>

                {/* Popular Users */}
                <div className="bg-card-background/50 backdrop-blur-sm rounded-xl p-4 border border-card-border">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Popular Users</h2>
                  
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-muted rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-muted rounded w-3/4"></div>
                              <div className="h-3 bg-muted rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(() => {
                        // Filter out current user and already followed users
                        const followedUserIds = followingCars.map(car => car.user.id);
                        const popularUsers = featuredUsers
                          .filter(user => 
                            user.id !== session?.user?.id && 
                            !followedUserIds.includes(user.id)
                          )
                          .slice(0, 3); // Show top 3 popular users
                        
                        if (popularUsers.length === 0) {
                          return (
                            <div className="text-center py-4">
                              <IconUsers size={24} className="text-muted mx-auto mb-2" />
                              <p className="text-xs text-muted">No popular users to show</p>
                            </div>
                          );
                        }
                        
                        return popularUsers.map((user) => (
                          <div key={user.id} className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                              {user.avatar_url ? (
                                <Image
                                  src={user.avatar_url}
                                  alt={user.username}
                                  width={48}
                                  height={48}
                                  className="rounded-full object-cover"
                                />
                              ) : (
                                <IconUsers size={24} className="text-muted" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{user.username}</p>
                              <p className="text-xs text-muted">{user.follower_count} followers</p>
                            </div>
                            <FollowButton 
                              userId={user.id}
                              currentUserId={session?.user?.id || null}
                              variant="ghost"
                              size="sm"
                            />
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>

                {/* Nearby Meets */}
                <div className="bg-card-background/50 backdrop-blur-sm rounded-xl p-4 border border-card-border">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Upcoming Meets</h2>
                  
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="aspect-video bg-muted rounded-lg mb-2"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-muted rounded"></div>
                            <div className="h-3 bg-muted rounded w-2/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {nearbyMeets.map((meet) => (
                        <Link 
                          key={meet.id} 
                          href={`/meets/${meet.id}`}
                          className="group cursor-pointer block"
                        >
                          <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                            {meet.image_url ? (
                              <Image
                                src={getImageUrl('meet', meet.image_url)}
                                alt={meet.title}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = FALLBACK_IMAGES.car;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <IconCalendarEvent size={24} className="text-muted" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-foreground group-hover:text-accent-primary transition-colors duration-200 line-clamp-1">
                              {meet.title}
                            </h3>
                            <p className="text-xs text-muted">{formatDate(meet.date)}</p>
                          </div>
                        </Link>
                      ))}
                      
                      {nearbyMeets.length === 0 && (
                        <div className="text-center py-4">
                          <IconCalendarEvent size={24} className="text-muted mx-auto mb-2" />
                          <p className="text-xs text-muted">No upcoming meets</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 