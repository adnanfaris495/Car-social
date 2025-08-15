'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useMarketplace } from '@/lib/marketplace'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'

interface MakeOfferDialogProps {
  isOpen: boolean
  onClose: () => void
  listingId: string
  listingTitle: string
  listingPrice: number
}

export default function MakeOfferDialog({
  isOpen,
  onClose,
  listingId,
  listingTitle,
  listingPrice,
}: MakeOfferDialogProps) {
  const [amount, setAmount] = useState(listingPrice)
  const [isLoading, setIsLoading] = useState(false)
  const { createOffer } = useMarketplace()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createOffer(listingId, amount)
      toast.success('Offer sent successfully')
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send offer')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Make an Offer</DialogTitle>
          <p className="text-zinc-400 text-sm mt-1">{listingTitle}</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-zinc-400 mb-2">
              Your Offer
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-zinc-800 rounded-lg pl-8 pr-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                min={0}
                step={0.01}
                required
              />
            </div>
            <p className="mt-2 text-sm text-zinc-400">
              Original price: {formatPrice(listingPrice)}
            </p>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send Offer'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 