'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IconSearch, IconCar, IconUser } from '@tabler/icons-react'
import { supabase } from '@/lib/supabase'
import { useSession } from '@supabase/auth-helpers-react';
import { useFollows } from '@/lib/follows'
import { toast } from 'sonner'
import Image from 'next/image'
import { getImageUrl } from '@/lib/utils'

interface SearchResult {
  user: {
    id: string
    username: string
    avatar_url: string | null
    follower_count: number
    following_count: number
  }
  cars: {
    id: string
    make: string
    model: string
    year: number
    image_url: string
  }[]
}

export default function UserSearch() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const user = useSession()?.user;
  const { follows, fetchUserFollows, followUser, unfollowUser, isFollowing } = useFollows()

  useEffect(() => {
    // Only fetch follows if user is authenticated and auth is initialized
    if (user) {
      fetchUserFollows(user.id)
    }
  }, [user, fetchUserFollows])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      // First, search for users by username
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          username,
          avatar_url,
          follower_count,
          following_count
        `)
        .ilike('username', `%${searchQuery}%`)
        .limit(10)

      if (usersError) throw usersError

      // Then, search for cars matching the query
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
        .or(`make.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })

      if (carsError) throw carsError

      // Get user IDs from cars
      const carUserIds = carsData?.map(car => car.user_id).filter(Boolean) || []
      
      // Fetch user data for cars
      let carUsersData: any[] = []
      if (carUserIds.length > 0) {
        const { data: usersForCars, error: usersForCarsError } = await supabase
          .from('users')
          .select(`
            id,
            username,
            avatar_url,
            follower_count,
            following_count
          `)
          .in('id', carUserIds)

        if (usersForCarsError) throw usersForCarsError
        carUsersData = usersForCars || []
      }

      // Create a map of user data for quick lookup
      const userMap = new Map<string, any>()
      carUsersData.forEach(user => {
        userMap.set(user.id, user)
      })

      // Combine and deduplicate results
      const resultMap = new Map<string, SearchResult>()
      
      // Add users found by username search
      usersData?.forEach((user: any) => {
        const userData = {
          id: user.id,
          username: user.username,
          avatar_url: user.avatar_url,
          follower_count: user.follower_count || 0,
          following_count: user.following_count || 0
        }
        
        resultMap.set(user.id, {
          user: userData,
          cars: []
        })
      })

      // Add users found by car search
      carsData?.forEach((car: any) => {
        const userId = car.user_id
        const userData = userMap.get(userId)
        
        if (userData) {
          const userInfo = {
            id: userData.id,
            username: userData.username,
            avatar_url: userData.avatar_url,
            follower_count: userData.follower_count || 0,
            following_count: userData.following_count || 0
          }
          
          if (!resultMap.has(userId)) {
            resultMap.set(userId, {
              user: userInfo,
              cars: []
            })
          }
          
          resultMap.get(userId)!.cars.push({
            id: car.id,
            make: car.make,
            model: car.model,
            year: car.year,
            image_url: car.image_url
          })
        }
      })

      setSearchResults(Array.from(resultMap.values()))
    } catch (error) {
      console.error('Error searching users:', error)
      toast.error('Failed to search users')
    } finally {
      setIsSearching(false)
    }
  }

  const handleFollowToggle = async (userId: string) => {
    if (!user) {
      toast.error('You must be logged in to follow users')
      return
    }

    if (userId === user.id) {
      toast.error('You cannot follow yourself')
      return
    }

    try {
      if (isFollowing(userId)) {
        await unfollowUser(userId)
      } else {
        await followUser(userId)
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  const handleUserClick = (userId: string) => {
    if (!userId) {
      console.error('Invalid user ID provided')
      return
    }
    
    console.log('Navigating to user profile:', userId)
    router.push(`/users/${userId}`)
  }

  // Don't render the follow button if auth is not initialized
  const canShowFollowButton = user

  return (
    <div className="content-card">
      <h2 className="content-card-title racing-font">Find Users & Cars</h2>
      
      {/* Search Input */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <IconSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted" size={20} />
          <input
            type="text"
            placeholder="Search by username or car make/model (e.g., john, BMW M3)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="form-input search-input-with-icon"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="button-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Found {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}
          </h3>
          
          {searchResults.map((result) => (
            <div key={result.user.id} className="content-card hover-lift">
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleUserClick(result.user.id)}
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {result.user.avatar_url ? (
                      <Image
                        src={result.user.avatar_url}
                        alt={result.user.username}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <IconUser size={24} className="text-muted" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{result.user.username}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted">
                      <span>{result.user.follower_count} followers</span>
                      <span>{result.user.following_count} following</span>
                    </div>
                  </div>
                </div>
                
                {canShowFollowButton && result.user.id !== user?.id && (
                  <button
                    onClick={() => handleFollowToggle(result.user.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isFollowing(result.user.id)
                        ? 'bg-muted text-foreground hover:bg-accent-primary/10 hover:text-accent-primary'
                        : 'bg-accent-secondary text-white hover:bg-accent-secondary/90'
                    }`}
                  >
                    {isFollowing(result.user.id) ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
              
              {/* User's Cars */}
              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <IconCar size={16} />
                  Cars ({result.cars.length})
                </h5>
                
                {result.cars.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.cars.map((car) => (
                      <div key={car.id} className="bg-card-background rounded-xl p-3 border border-card-border hover:border-accent-primary transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                            {car.image_url ? (
                              <Image
                                src={getImageUrl('car', car.image_url)}
                                alt={`${car.make} ${car.model}`}
                                width={48}
                                height={48}
                                className="rounded-lg object-cover"
                              />
                            ) : (
                              <IconCar size={24} className="text-muted" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h6 className="font-medium text-foreground text-sm">
                              {car.year} {car.make} {car.model}
                            </h6>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-sm">No cars found</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {searchQuery && !isSearching && searchResults.length === 0 && (
        <div className="text-center py-8">
          <IconSearch size={48} className="text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No users or cars found</h3>
          <p className="text-muted text-sm">
            Try searching for a different username or car make/model
          </p>
        </div>
      )}
    </div>
  )
} 