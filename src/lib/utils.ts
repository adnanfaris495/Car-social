import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function formatShortDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function formatTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const FALLBACK_IMAGES = {
  car: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2000',
  part: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2000',
  meet: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2000',
  marketplace: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2000',
  profile: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2000'
}

export function getImageUrl(type: 'meet' | 'car' | 'listing', url: string | null): string {
  if (!url) {
    return '/placeholder.jpg'
  }
  
  if (url.startsWith('http')) {
    return url
  }
  
  // Map types to correct bucket names
  const bucketMap = {
    'meet': 'post-images',
    'car': 'cars', 
    'listing': 'post-images' // Marketplace listings use post-images bucket
  }
  
  const bucket = bucketMap[type]
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${url}`
}

export function formatDateTime(dateString: string, timeString: string): string {
  const date = new Date(`${dateString}T${timeString}`)
  return formatDate(date)
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price)
} 