import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { toast } from 'react-hot-toast'

export interface BrandFollow {
  id: string
  user_id: string
  brand_name: string
  created_at: string
}

export function useBrandFollows() {
  const [followedBrands, setFollowedBrands] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchFollowedBrands = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setFollowedBrands([])
        return
      }

      const { data, error } = await supabase
        .from('brand_follows')
        .select('brand_name')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching followed brands:', error)
        toast.error('Failed to load followed brands')
        return
      }

      setFollowedBrands(data?.map(follow => follow.brand_name) || [])
    } catch (error) {
      console.error('Error fetching followed brands:', error)
      toast.error('Failed to load followed brands')
    } finally {
      setIsLoading(false)
    }
  }

  const followBrand = async (brandName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in to follow brands')
        return
      }

      const { error } = await supabase
        .from('brand_follows')
        .insert({
          user_id: user.id,
          brand_name: brandName
        })

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error('You are already following this brand')
        } else {
          console.error('Error following brand:', error)
          toast.error('Failed to follow brand')
        }
        return
      }

      setFollowedBrands(prev => [...prev, brandName])
      toast.success(`Now following ${brandName}`)
    } catch (error) {
      console.error('Error following brand:', error)
      toast.error('Failed to follow brand')
    }
  }

  const unfollowBrand = async (brandName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in to unfollow brands')
        return
      }

      const { error } = await supabase
        .from('brand_follows')
        .delete()
        .eq('user_id', user.id)
        .eq('brand_name', brandName)

      if (error) {
        console.error('Error unfollowing brand:', error)
        toast.error('Failed to unfollow brand')
        return
      }

      setFollowedBrands(prev => prev.filter(brand => brand !== brandName))
      toast.success(`Unfollowed ${brandName}`)
    } catch (error) {
      console.error('Error unfollowing brand:', error)
      toast.error('Failed to unfollow brand')
    }
  }

  const isFollowingBrand = (brandName: string) => {
    return followedBrands.includes(brandName)
  }

  useEffect(() => {
    fetchFollowedBrands()
  }, [])

  return {
    followedBrands,
    isLoading,
    followBrand,
    unfollowBrand,
    isFollowingBrand,
    refetch: fetchFollowedBrands
  }
} 