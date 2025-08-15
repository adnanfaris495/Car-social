import Link from 'next/link'
import Image from 'next/image'

interface MarketplaceCardProps {
  id: string
  title: string
  price: number
  imageUrl?: string
  condition?: string
  location?: string
}

export default function MarketplaceCard({
  id,
  title,
  price,
  imageUrl,
  condition = 'Not specified',
  location = 'Location not specified'
}: MarketplaceCardProps) {
  // Ensure price is a valid number
  const validPrice = typeof price === 'number' && !isNaN(price) ? price : 0

  return (
    <Link
      href={`/marketplace/${id}`}
      className="block bg-zinc-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
    >
      <div className="relative aspect-video">
        <Image
          src={imageUrl || '/placeholder.png'}
          alt={title}
          fill
          className="object-cover"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement
            target.src = '/placeholder.png'
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-white line-clamp-2">{title}</h3>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-green-500">
            ${validPrice.toLocaleString()}
          </span>
          <span className="text-sm text-zinc-400">{condition}</span>
        </div>
        <div className="mt-2 text-sm text-zinc-400">
          📍 {location}
        </div>
      </div>
    </Link>
  )
} 