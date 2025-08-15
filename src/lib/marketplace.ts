import { create } from 'zustand'
import { supabase } from './supabase'
import { deleteImage } from './storage'
import { toast } from 'sonner'

export interface MarketplaceRating {
  id: string
  rater_id: string
  rated_user_id: string
  listing_id: string
  rating: number
  review: string | null
  created_at: string
}

export interface DBMarketplaceOffer {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  amount: number
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export interface DBMarketplaceListing {
  id: string
  user_id: string
  title: string
  description: string
  price: number
  condition: string
  location: string
  image_urls: string[]
  compatible_makes: string[]
  compatible_models: string[]
  compatible_years: number[]
  is_trade_available: boolean
  is_sold: boolean
  created_at: string
  updated_at: string
  users?: {
    id: string
    username: string
    avatar_url: string | null
  }
}

interface MarketplaceFilters {
  search: string
  minPrice: number | null
  maxPrice: number | null
  condition: string | null
  make: string | null
  model: string | null
  year: number | null
}

interface MarketplaceState {
  listings: DBMarketplaceListing[]
  userListings: DBMarketplaceListing[]
  favorites: string[]
  ratings: MarketplaceRating[]
  offers: DBMarketplaceOffer[]
  filters: MarketplaceFilters
  isLoading: boolean
  error: string | null
  fetchListings: () => Promise<void>
  fetchUserListings: (userId: string) => Promise<void>
  fetchFavorites: () => Promise<void>
  fetchOffersForListing: (listingId: string) => Promise<void>
  createListing: (listing: Omit<DBMarketplaceListing, 'id' | 'user_id' | 'created_at' | 'updated_at'>, images: File[]) => Promise<void>
  updateListing: (id: string, listing: Partial<DBMarketplaceListing>, newImages?: File[]) => Promise<void>
  deleteListing: (id: string) => Promise<void>
  toggleFavorite: (listingId: string) => Promise<void>
  createRating: (rating: Omit<MarketplaceRating, 'id' | 'created_at'>) => Promise<void>
  setFilters: (filters: Partial<MarketplaceFilters>) => void
  resetFilters: () => void
  createOffer: (listingId: string, amount: number) => Promise<void>
  respondToOffer: (offerId: string, accept: boolean) => Promise<void>
}

export const useMarketplace = create<MarketplaceState>((set, get) => ({
  listings: [],
  userListings: [],
  favorites: [],
  ratings: [],
  offers: [],
  filters: {
    search: '',
    minPrice: null,
    maxPrice: null,
    condition: null,
    make: null,
    model: null,
    year: null
  },
  isLoading: false,
  error: null,

  fetchListings: async () => {
    set({ isLoading: true, error: null })
    try {
      // First try without join to see if the basic query works
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
        set({ listings: data || [] })
    } catch (error) {
      console.error('Error fetching listings:', error)
      set({ error: 'Failed to fetch listings' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchUserListings: async (userId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ userListings: data || [] })
    } catch (error) {
      console.error('Error fetching user listings:', error)
      set({ error: 'Failed to fetch user listings' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchFavorites: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('marketplace_favorites')
        .select('listing_id')
        .eq('user_id', user.id)

      if (error) throw error

      set({ favorites: data?.map(f => f.listing_id) || [] })
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  },

  fetchOffersForListing: async (listingId: string) => {
    try {
      const { data, error } = await supabase
        .from('marketplace_offers')
        .select('*')
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ offers: data || [] })
    } catch (error) {
      console.error('Error fetching offers:', error)
    }
  },

  createListing: async (listing, images) => {
    set({ isLoading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Upload images first
      const imageUrls: string[] = []
      for (const image of images) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`
        const { data, error } = await supabase.storage
          .from('post-images')
          .upload(fileName, image)

        if (error) throw error
        imageUrls.push(fileName)
      }

      const { data, error } = await supabase
        .from('marketplace_listings')
        .insert([{
          ...listing,
          user_id: user.id,
          image_urls: imageUrls
        }])
        .select()
        .single()

      if (error) throw error

      set(state => ({
        listings: [data, ...state.listings],
        userListings: [data, ...state.userListings]
      }))

      toast.success('Listing created successfully')
    } catch (error) {
      console.error('Error creating listing:', error)
      set({ error: 'Failed to create listing' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  updateListing: async (id, listing, newImages) => {
    set({ isLoading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      let imageUrls = listing.image_urls || []

      // Upload new images if provided
      if (newImages && newImages.length > 0) {
        for (const image of newImages) {
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`
          const { data, error } = await supabase.storage
            .from('post-images')
            .upload(fileName, image)

          if (error) throw error
          imageUrls.push(fileName)
        }
      }

      const { data, error } = await supabase
        .from('marketplace_listings')
        .update({
          ...listing,
          image_urls: imageUrls,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      set(state => ({
        listings: state.listings.map(l => l.id === id ? data : l),
        userListings: state.userListings.map(l => l.id === id ? data : l)
      }))

      toast.success('Listing updated successfully')
    } catch (error) {
      console.error('Error updating listing:', error)
      set({ error: 'Failed to update listing' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  deleteListing: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get the listing to delete its images
      const { data: listing } = await supabase
        .from('marketplace_listings')
        .select('image_urls')
        .eq('id', id)
        .single()

      if (listing) {
        // Delete all images associated with the listing
        await Promise.all((listing.image_urls || []).map((path: string) => deleteImage(path, 'post-images')))
      }

      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user owns the listing

      if (error) throw error

      set(state => ({
        listings: state.listings.filter(l => l.id !== id),
        userListings: state.userListings.filter(l => l.id !== id)
      }))

      toast.success('Listing deleted successfully')
    } catch (error) {
      console.error('Error deleting listing:', error)
      set({ error: 'Failed to delete listing' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  toggleFavorite: async (listingId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const isFavorited = get().favorites.includes(listingId)

      if (isFavorited) {
        await supabase
          .from('marketplace_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId)

        set(state => ({
          favorites: state.favorites.filter(id => id !== listingId)
        }))
      } else {
        await supabase
          .from('marketplace_favorites')
          .insert({ user_id: user.id, listing_id: listingId })

        set(state => ({
          favorites: [...state.favorites, listingId]
        }))
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorite')
    }
  },

  createRating: async (rating) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('marketplace_ratings')
        .insert([rating])
        .select()
        .single()

      if (error) throw error

      set(state => ({
        ratings: [data, ...state.ratings]
      }))

      toast.success('Rating submitted successfully')
    } catch (error) {
      console.error('Error creating rating:', error)
      set({ error: 'Failed to submit rating' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  setFilters: (filters) => {
    set(state => ({
      filters: { ...state.filters, ...filters }
    }))
  },

  resetFilters: () => {
    set({
      filters: {
        search: '',
        minPrice: null,
        maxPrice: null,
        condition: null,
        make: null,
        model: null,
        year: null
      }
    })
  },

  createOffer: async (listingId: string, amount: number) => {
    set({ isLoading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: listing, error: listingError } = await supabase
        .from('marketplace_listings')
        .select('user_id')
        .eq('id', listingId)
        .single()

      if (listingError) throw listingError
      if (!listing) throw new Error('Listing not found')

      const { error } = await supabase
        .from('marketplace_offers')
        .insert([{
          listing_id: listingId,
          buyer_id: user.id,
          seller_id: listing.user_id,
          amount,
          status: 'pending'
        }])

      if (error) throw error
      await get().fetchOffersForListing(listingId)
      toast.success('Offer sent successfully')
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  respondToOffer: async (offerId: string, accept: boolean) => {
    set({ isLoading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: offer, error: offerError } = await supabase
        .from('marketplace_offers')
        .select('*, listing:marketplace_listings(*)')
        .eq('id', offerId)
        .single()

      if (offerError) throw offerError
      if (!offer) throw new Error('Offer not found')
      if (offer.seller_id !== user.id) throw new Error('Not authorized')

      const status = accept ? 'accepted' : 'rejected'

      const { error } = await supabase
        .from('marketplace_offers')
        .update({ status })
        .eq('id', offerId)

      if (error) throw error

      if (accept) {
        const { error: listingError } = await supabase
          .from('marketplace_listings')
          .update({ is_sold: true })
          .eq('id', offer.listing_id)

        if (listingError) throw listingError
      }

      await get().fetchOffersForListing(offer.listing_id)
      toast.success(`Offer ${status}`)
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  }
}))

export const useListings = create<{
  userListings: DBMarketplaceListing[]
  isLoading: boolean
  error: string | null
  fetchUserListings: (userId: string) => Promise<void>
}>((set) => ({
  userListings: [],
  isLoading: false,
  error: null,

  fetchUserListings: async (userId: string) => {
    try {
      set({ isLoading: true, error: null })
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform the data to match the DBMarketplaceListing type
      const transformedData: DBMarketplaceListing[] = data.map(listing => ({
        id: listing.id,
        user_id: listing.user_id,
        title: listing.title,
        description: listing.description || '',
        price: listing.price,
        condition: listing.condition || 'New',
        location: listing.location || 'Unknown',
        image_urls: listing.image_urls || [],
        compatible_makes: listing.compatible_makes || [],
        compatible_models: listing.compatible_models || [],
        compatible_years: listing.compatible_years || [],
        is_trade_available: listing.is_trade_available || false,
        is_sold: listing.is_sold || false,
        created_at: listing.created_at,
        updated_at: listing.updated_at || listing.created_at
      }))

      set({ userListings: transformedData })
    } catch (error: any) {
      set({ error: error.message })
      console.error('Error fetching listings:', error)
    } finally {
      set({ isLoading: false })
    }
  }
}))