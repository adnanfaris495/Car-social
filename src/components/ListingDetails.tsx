'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { IconMapPin, IconHeart, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useMarketplace } from '@/lib/marketplace'
import { useSession } from '@supabase/auth-helpers-react';
import { getImageUrl, formatPrice } from '@/lib/utils'
import MakeOfferDialog from '@/components/MakeOfferDialog'
import OffersPanel from '@/components/OffersPanel'

export default function ListingDetails({ id }: { id: string }) {
  const [showOfferDialog, setShowOfferDialog] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { listings, favorites, toggleFavorite } = useMarketplace()
  const user = useSession()?.user;
  const router = useRouter()

  const listing = listings.find(l => l.id === id)
  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="page-heading-secondary mb-4">Listing not found</h1>
          <button
            onClick={() => router.push('/marketplace')}
            className="text-red-500 hover:text-red-600"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    )
  }

  const isOwner = user?.id === listing.user_id
  const isFavorited = favorites.includes(listing.id)
  const images = listing.image_urls || []
  const currentImage = images[currentImageIndex] || ''

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-900 rounded-lg p-6">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800">
          {images.length > 0 ? (
            <>
              <Image
                src={getImageUrl('listing', currentImage)}
                alt={listing.title}
                fill
                className="object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <IconChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <IconChevronRight size={20} />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400">
              No image available
            </div>
          )}
        </div>
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="page-heading-secondary text-white">{listing.title}</h1>
              <p className="text-xl font-semibold mt-2 text-white">{formatPrice(listing.price)}</p>
            </div>
            {user && (
              <button
                onClick={() => toggleFavorite(listing.id)}
                className={`p-2 rounded-full ${
                  isFavorited ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <IconHeart className={isFavorited ? 'fill-current' : ''} />
              </button>
            )}
          </div>
          <div className="mt-4 flex items-center text-zinc-400">
            <IconMapPin className="mr-2" />
            <span>{listing.location}</span>
          </div>
          <p className="mt-4 text-zinc-300">{listing.description}</p>
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2 text-white">Compatible With</h2>
            <div className="space-y-2 bg-zinc-800 p-4 rounded-lg">
              <p>
                <span className="text-zinc-400">Makes:</span>{' '}
                <span className="text-white">{listing.compatible_makes.join(', ')}</span>
              </p>
              <p>
                <span className="text-zinc-400">Models:</span>{' '}
                <span className="text-white">{listing.compatible_models.join(', ')}</span>
              </p>
              <p>
                <span className="text-zinc-400">Years:</span>{' '}
                <span className="text-white">{listing.compatible_years.join(', ')}</span>
              </p>
            </div>
          </div>
          {!isOwner && user && (
            <button
              onClick={() => setShowOfferDialog(true)}
              className="mt-6 w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
            >
              Make an Offer
            </button>
          )}
          {!user && (
            <p className="mt-6 text-center text-zinc-400">
              Please sign in to make an offer
            </p>
          )}
          {isOwner && <OffersPanel listingId={listing.id} sellerId={listing.user_id} />}
        </div>
      </div>
      {showOfferDialog && (
        <MakeOfferDialog
          isOpen={showOfferDialog}
          onClose={() => setShowOfferDialog(false)}
          listingId={listing.id}
          listingTitle={listing.title}
          listingPrice={listing.price}
        />
      )}
    </div>
  )
} 