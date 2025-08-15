import { useState } from 'react'
import Image from 'next/image'
import { IconHeart, IconHeartFilled, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useMarketplace } from '@/lib/marketplace'
import { DBMarketplaceListing } from '@/lib/marketplace'
import { getImageUrl } from '@/lib/storage'
import { formatPrice } from '@/lib/utils'

interface ListingCardProps {
  listing: {
    id: string
    title: string
    price: number
    condition: string
    location: string
    image_urls: string[]
  }
  onSelect?: () => void
  showFavorite?: boolean
}

export default function ListingCard({ listing, onSelect, showFavorite = true }: ListingCardProps) {
  const { favorites, toggleFavorite } = useMarketplace()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const isFavorited = favorites.includes(listing.id)
  const imageUrls = listing.image_urls.map(path => getImageUrl(path, 'post-images'))

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length)
  }

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(listing.id)
  }

  const handleImageNavClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation()
    action()
  }

  return (
    <div
      className="group relative bg-zinc-900 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-red-500 transition-all"
      onClick={onSelect}
    >
      <div className="relative aspect-square">
        <Image
          src={imageUrls[currentImageIndex] || '/placeholder.jpg'}
          alt={listing.title}
          fill
          className="object-cover"
        />
        {imageUrls.length > 1 && (
          <>
            <button
              onClick={(e) => handleImageNavClick(e, previousImage)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <IconChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => handleImageNavClick(e, nextImage)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <IconChevronRight size={20} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {imageUrls.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
        {showFavorite && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {isFavorited ? <IconHeartFilled size={20} /> : <IconHeart size={20} />}
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white truncate">{listing.title}</h3>
        <p className="text-xl font-bold text-red-500">{formatPrice(listing.price)}</p>
        <div className="mt-2 flex items-center justify-between text-sm text-zinc-400">
          <span>{listing.condition}</span>
          <span>{listing.location}</span>
        </div>
      </div>
    </div>
  )
} 