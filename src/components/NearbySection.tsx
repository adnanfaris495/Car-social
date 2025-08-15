'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { IconMapPin, IconClock, IconUsers, IconHeart, IconCalendarEvent } from '@tabler/icons-react'
import { FALLBACK_IMAGES } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { getImageUrl } from '@/lib/utils'

interface NearbyMeet {
  id: string
  title: string
  date: string
  time: string
  location_city: string
  location_state: string
  attendee_count: number
  max_attendees: number
  image_url: string
}

interface NearbyListing {
  id: string
  title: string
  price: number
  location: string
  image_urls: string[]
  user: {
    username: string
  }
}

export default function NearbySection() {
  const [activeTab, setActiveTab] = useState<'meets' | 'listings'>('meets')
  const [nearbyMeets, setNearbyMeets] = useState<NearbyMeet[]>([])
  const [nearbyListings, setNearbyListings] = useState<NearbyListing[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNearbyData = async () => {
      try {
        // Fetch nearby meets (upcoming meets)
        const { data: meetsData, error: meetsError } = await supabase
          .from('meets')
          .select(`
            id,
            title,
            date,
            time,
            location_city,
            location_state,
            max_attendees,
            image_url
          `)
          .gte('date', new Date().toISOString().split('T')[0])
          .order('date', { ascending: true })
          .limit(3)

        if (meetsError) throw meetsError

        // Get attendee counts for meets
        if (meetsData && meetsData.length > 0) {
          const meetIds = meetsData.map(meet => meet.id)
          const { data: attendeesData } = await supabase
            .from('meet_participants')
            .select('meet_id')
            .in('meet_id', meetIds)
            .eq('status', 'confirmed')

          const attendeeCounts = new Map<string, number>()
          attendeesData?.forEach(attendee => {
            attendeeCounts.set(attendee.meet_id, (attendeeCounts.get(attendee.meet_id) || 0) + 1)
          })

          const meetsWithAttendees = meetsData.map(meet => ({
            ...meet,
            attendee_count: attendeeCounts.get(meet.id) || 0
          }))

          setNearbyMeets(meetsWithAttendees)
        }

        // Fetch nearby listings (recent listings)
        const { data: listingsData, error: listingsError } = await supabase
          .from('marketplace_listings')
          .select(`
            id,
            title,
            price,
            location,
            image_urls,
            users!inner (
              username
            )
          `)
          .order('created_at', { ascending: false })
          .limit(3)

        if (listingsError) throw listingsError

        setNearbyListings(listingsData?.map((listing: any) => ({
          id: listing.id,
          title: listing.title,
          price: listing.price,
          location: listing.location,
          image_urls: listing.image_urls,
          user: listing.users
        })) || [])
      } catch (error) {
        console.error('Error fetching nearby data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNearbyData()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="content-card">
      <h2 className="content-card-title racing-font">Nearby</h2>
      
      {/* Toggle */}
      <div className="nearby-toggle">
        <button
          onClick={() => setActiveTab('meets')}
          className={`nearby-toggle-item ${
            activeTab === 'meets'
              ? 'nearby-toggle-active'
              : ''
          }`}
        >
          Meets
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`nearby-toggle-item ${
            activeTab === 'listings'
              ? 'nearby-toggle-active'
              : ''
          }`}
        >
          Listings
        </button>
      </div>

      {/* Content */}
      <div className="nearby-list">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-muted rounded-xl mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'meets' ? (
          nearbyMeets.length > 0 ? (
            nearbyMeets.map((meet) => (
              <div key={meet.id} className="nearby-item hover-lift cursor-pointer">
                <div className="relative aspect-video mb-4 rounded-xl overflow-hidden bg-muted">
                  {meet.image_url ? (
                    <Image
                      src={getImageUrl('meet', meet.image_url)}
                      alt={meet.title}
                      fill
                      className="object-cover transition-transform duration-200 hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = FALLBACK_IMAGES.meet;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10">
                      <IconCalendarEvent size={48} className="text-muted" />
                    </div>
                  )}
                  {/* Meet badge overlay */}
                  <div className="absolute top-2 left-2 bg-accent-primary text-white text-xs px-2 py-1 rounded-full font-medium">
                    Meet
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-3">{meet.title}</h3>
                <div className="space-y-2 text-sm text-muted">
                  <div className="flex items-center gap-2">
                    <IconMapPin size={16} />
                    {meet.location_city}, {meet.location_state}
                  </div>
                  <div className="flex items-center gap-2">
                    <IconClock size={16} />
                    {formatDate(meet.date)} at {meet.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <IconUsers size={16} />
                    {meet.attendee_count} attending
                    {meet.max_attendees && ` (${meet.max_attendees - meet.attendee_count} spots left)`}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <IconClock size={48} className="text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No upcoming meets</h3>
              <p className="text-muted text-sm">
                Check back later for new car meets in your area
              </p>
            </div>
          )
        ) : (
          nearbyListings.length > 0 ? (
            nearbyListings.map((listing) => {
              const hasImages = listing.image_urls && listing.image_urls.length > 0
              
              return (
                <div key={listing.id} className="nearby-item hover-lift cursor-pointer">
                  <div className="relative aspect-video mb-4 rounded-xl overflow-hidden bg-muted">
                    {hasImages ? (
                      <Image
                        src={getImageUrl('listing', listing.image_urls[0])}
                        alt={listing.title}
                        fill
                        className="object-cover transition-transform duration-200 hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = FALLBACK_IMAGES.car;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10">
                        <IconHeart size={48} className="text-muted" />
                      </div>
                    )}
                    {/* Listing badge overlay */}
                    <div className="absolute top-2 left-2 bg-accent-secondary text-white text-xs px-2 py-1 rounded-full font-medium">
                      Sale
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-3">{listing.title}</h3>
                  <div className="space-y-2 text-sm text-muted">
                    <div className="flex items-center gap-2">
                      <IconMapPin size={16} />
                      {listing.location}
                    </div>
                    <div className="text-accent-secondary font-semibold">
                      {formatPrice(listing.price)}
                    </div>
                    <div className="text-xs text-muted">
                      by {listing.user.username}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8">
              <IconHeart size={48} className="text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No recent listings</h3>
              <p className="text-muted text-sm">
                Check the marketplace for new listings
              </p>
            </div>
          )
        )}
      </div>
    </div>
  )
} 