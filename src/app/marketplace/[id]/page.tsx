'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { IconMapPin, IconHeart, IconChevronLeft, IconChevronRight, IconArrowLeft, IconUser, IconTrash } from '@tabler/icons-react'
import { useMarketplace } from '@/lib/marketplace'
import { useSession } from '@supabase/auth-helpers-react';
import { getImageUrl as getStorageImageUrl } from '@/lib/storage'
import { formatPrice } from '@/lib/utils'
import MakeOfferDialog from '@/components/MakeOfferDialog'
import OffersPanel from '@/components/OffersPanel'
import FollowButton from '@/components/FollowButton'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { MarketplaceListing } from '@/lib/supabase/types'

type ListingWithUser = MarketplaceListing & {
  users?: {
    id: string;
    username: string;
    avatar_url: string | null;
  }
};

export default function ListingPage({ params }: { params: { id: string } }) {
  const session = useSession();
  const user = session?.user;
  const [listing, setListing] = useState<ListingWithUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showOfferDialog, setShowOfferDialog] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { favorites, toggleFavorite } = useMarketplace()
  const router = useRouter()
  
  // Add error state
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    const fetchListing = async () => {
      try {
        console.log('ListingPage: params.id', params.id)
        console.log('ListingPage: session', session)
        const { data, error } = await supabase
          .from('marketplace_listings')
          .select('*')
          .eq('id', params.id)
          .single()
        console.log('ListingPage: supabase query result', { data, error })
        if (error) throw error
        
        // Fetch user data separately
        if (data && data.user_id) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, username, avatar_url')
            .eq('id', data.user_id)
            .single()
          
          if (userError) {
            console.error('Error fetching user data:', userError)
            // Continue without user data
            setListing(data)
          } else {
            setListing({ ...data, users: userData })
          }
        } else {
          setListing(data)
        }
      } catch (error) {
        console.error('Error fetching listing:', error)
        setListing(null)
        setError(error)
        toast.error('Failed to load listing')
      } finally {
        setIsLoading(false)
      }
    }

    fetchListing()
  }, [params.id, refreshTrigger, session])

  const handleFollowChange = () => {
    // Trigger a refresh when follow status changes
    setRefreshTrigger(prev => prev + 1)
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Listing not found</h1>
          {error && (
            <div className="bg-red-900 text-red-300 p-4 mb-4 rounded">
              <pre className="text-xs text-left whitespace-pre-wrap">{JSON.stringify(error, null, 2)}</pre>
            </div>
          )}
          <button
            onClick={() => router.back()}
            className="button-primary"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  const isFavorited = favorites.includes(listing.id)
  const isOwner = user?.id === listing.user_id
  const hasImages = listing.image_urls && listing.image_urls.length > 0
  const totalImages = hasImages ? listing.image_urls.length : 0

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % totalImages)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages)
  }

  const handleBack = () => {
    router.push('/marketplace')
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', listing.id)

      if (error) throw error

      toast.success('Listing deleted successfully')
      router.push('/marketplace')
    } catch (error) {
      console.error('Error deleting listing:', error)
      toast.error('Failed to delete listing')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="ml-64"> {/* Account for left sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-muted hover:text-foreground transition-colors font-medium"
            >
              <IconArrowLeft size={20} />
              <span>Back to Marketplace</span>
            </button>
          </div>

          <div className="bg-card-background border border-card-border rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-card-border bg-card-background">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">{listing.title}</h1>
                  <p className="text-3xl font-bold text-accent-primary mt-2">
                    {formatPrice(listing.price)}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleFavorite(listing.id)}
                    className={`p-3 rounded-full transition-all duration-200 ${
                      isFavorited 
                        ? 'bg-accent-primary/10 text-accent-primary shadow-md' 
                        : 'bg-card-background border border-card-border text-muted hover:bg-accent-primary/10 hover:text-accent-primary hover:border-accent-primary hover:shadow-md'
                    }`}
                  >
                    <IconHeart className="w-6 h-6" fill={isFavorited ? 'currentColor' : 'none'} />
                  </button>
                  {!isOwner && (
                    <button
                      onClick={() => setShowOfferDialog(true)}
                      className="bg-accent-primary hover:bg-accent-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md"
                    >
                      Make Offer
                    </button>
                  )}
                  {isOwner && (
                    <button
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md"
                    >
                      <IconTrash size={20} className="mr-2" /> Delete Listing
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
              {/* Images Gallery */}
              <div className="space-y-4">
                {hasImages ? (
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="aspect-square relative rounded-xl overflow-hidden bg-muted shadow-sm">
                      <Image
                        src={getStorageImageUrl(listing.image_urls[currentImageIndex], 'post-images')}
                        alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                        fill
                        className="object-cover"
                      />
                      
                      {/* Navigation Arrows */}
                      {totalImages > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background text-foreground p-3 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <IconChevronLeft size={20} />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background text-foreground p-3 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <IconChevronRight size={20} />
                          </button>
                          
                          {/* Image Counter */}
                          <div className="absolute bottom-4 right-4 bg-background/90 text-foreground px-3 py-2 rounded-lg text-sm font-semibold shadow-sm">
                            {currentImageIndex + 1} / {totalImages}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Thumbnails */}
                    {totalImages > 1 && (
                      <div className="flex gap-3">
                        {listing.image_urls.map((imageUrl, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 shadow-sm hover:shadow-md ${
                              index === currentImageIndex 
                                ? 'border-accent-primary shadow-md' 
                                : 'border-card-border hover:border-accent-primary/50'
                            }`}
                          >
                            <Image
                              src={getStorageImageUrl(imageUrl, 'post-images')}
                              alt={`Thumbnail ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-card-border">
                    <p className="text-muted font-medium">No image available</p>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">Description</h2>
                  <p className="text-muted leading-relaxed">{listing.description}</p>
                </div>

                {/* Seller Information */}
                {listing.users && (
                  <div className="border-t border-card-border pt-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">Seller</h2>
                    <div className="flex items-center justify-between bg-card-background border border-card-border rounded-xl p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-accent-primary flex items-center justify-center overflow-hidden shadow-sm">
                          {listing.users.avatar_url ? (
                            <Image
                              src={listing.users.avatar_url}
                              alt={listing.users.username}
                              width={56}
                              height={56}
                              className="object-cover"
                            />
                          ) : (
                            <IconUser size={28} className="text-white" />
                          )}
                        </div>
                        <div>
                          <a
                            href={`/users/${listing.users.id}`}
                            className="text-lg font-bold text-foreground hover:text-accent-primary transition-colors"
                          >
                            {listing.users.username}
                          </a>
                          <p className="text-muted">Member since {new Date(listing.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <FollowButton 
                        userId={listing.users.id} 
                        currentUserId={user?.id || null}
                        variant="outline"
                        size="sm"
                        onFollowChange={handleFollowChange}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-card-background border border-card-border rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-muted mb-2">Condition</h3>
                    <p className="text-foreground font-medium">{listing.condition}</p>
                  </div>
                  <div className="bg-card-background border border-card-border rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-muted mb-2">Location</h3>
                    <div className="flex items-center text-foreground font-medium">
                      <IconMapPin className="w-5 h-5 mr-2 text-accent-primary" />
                      {listing.location}
                    </div>
                  </div>
                </div>

                {listing.compatible_makes && listing.compatible_makes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-3">Compatible Makes</h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.compatible_makes.map((make, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-accent-primary/10 text-accent-primary text-sm font-semibold rounded-full border border-accent-primary/20"
                        >
                          {make}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {listing.is_trade_available && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-amber-800 font-semibold">
                      <strong>🔄 Trades accepted</strong> - Open to trade offers
                    </p>
                  </div>
                )}

                {listing.is_sold && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-800 font-semibold">
                      <strong>❌ Sold</strong> - This item has been sold
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Offers Panel */}
            {isOwner && <OffersPanel listingId={listing.id} sellerId={listing.user_id} />}
          </div>
        </div>

        {/* Make Offer Dialog */}
        {showOfferDialog && (
          <MakeOfferDialog
            listingId={listing.id}
            isOpen={showOfferDialog}
            listingTitle={listing.title}
            listingPrice={listing.price}
            onClose={() => setShowOfferDialog(false)}
          />
        )}
      </div>
    </div>
  )
} 