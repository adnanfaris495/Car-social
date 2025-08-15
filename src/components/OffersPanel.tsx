'use client'

import { useEffect } from 'react'
import { useMarketplace } from '@/lib/marketplace'
import { useSession } from '@supabase/auth-helpers-react';
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

interface OffersPanelProps {
  listingId: string
  sellerId: string
}

export default function OffersPanel({ listingId, sellerId }: OffersPanelProps) {
  const { offers, fetchOffersForListing, respondToOffer } = useMarketplace()
  const user = useSession()?.user;
  const isSeller = user?.id === sellerId

  useEffect(() => {
    fetchOffersForListing(listingId)
  }, [listingId])

  const handleResponse = async (offerId: string, accept: boolean) => {
    try {
      await respondToOffer(offerId, accept)
      toast.success(accept ? 'Offer accepted' : 'Offer rejected')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to respond to offer')
    }
  }

  const listingOffers = offers.filter(offer => offer.listing_id === listingId)

  if (!isSeller || listingOffers.length === 0) return null

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-white">Offers</h2>
      <div className="space-y-4">
        {listingOffers.map(offer => (
          <div
            key={offer.id}
            className="p-4 rounded-lg bg-zinc-900 border border-zinc-700"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-white">${offer.amount}</p>
                <p className="text-sm text-zinc-400">
                  {formatDate(offer.created_at)}
                </p>
              </div>
              {offer.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResponse(offer.id, true)}
                    className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleResponse(offer.id, false)}
                    className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                  >
                    Reject
                  </button>
                </div>
              )}
              {offer.status !== 'pending' && (
                <span className={`capitalize text-sm font-medium ${
                  offer.status === 'accepted' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {offer.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 