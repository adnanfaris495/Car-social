import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { IconX, IconPlus, IconTrash } from '@tabler/icons-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { getImageUrl } from '@/lib/utils'

interface Car {
  id: string
  user_id: string
  make: string
  model: string
  year: number
  image_url: string
  mods: string[]
  created_at: string
}

interface CarDetailsDialogProps {
  car: Car
  isOpen: boolean
  onClose: () => void
  onCarUpdated: (updatedCar: Car) => void
  onCarDeleted: (carId: string) => void
}

export default function CarDetailsDialog({
  car,
  isOpen,
  onClose,
  onCarUpdated,
  onCarDeleted
}: CarDetailsDialogProps) {
  const [newMod, setNewMod] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAddMod = async () => {
    if (!newMod.trim()) return

    setIsLoading(true)
    try {
      const updatedMods = [...car.mods, newMod.trim()]
      const { data, error } = await supabase
        .from('cars')
        .update({ mods: updatedMods })
        .eq('id', car.id)
        .select()
        .single()

      if (error) throw error

      onCarUpdated(data)
      setNewMod('')
      toast.success('Modification added successfully!')
    } catch (error) {
      console.error('Error adding mod:', error)
      toast.error('Failed to add modification')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMod = async (modIndex: number) => {
    setIsLoading(true)
    try {
      const updatedMods = car.mods.filter((_, index) => index !== modIndex)
      const { data, error } = await supabase
        .from('cars')
        .update({ mods: updatedMods })
        .eq('id', car.id)
        .select()
        .single()

      if (error) throw error

      onCarUpdated(data)
      toast.success('Modification removed successfully!')
    } catch (error) {
      console.error('Error removing mod:', error)
      toast.error('Failed to remove modification')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCar = async () => {
    if (!window.confirm('Are you sure you want to delete this car? This action cannot be undone.')) {
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', car.id)

      if (error) throw error

      onCarDeleted(car.id)
      onClose()
      toast.success('Car deleted successfully!')
    } catch (error) {
      console.error('Error deleting car:', error)
      toast.error('Failed to delete car')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            {car.year} {car.make} {car.model}
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-6">
          {/* Car Image */}
          <div className="relative h-64 rounded-lg overflow-hidden">
            <Image
              src={getImageUrl('car', car.image_url)}
              alt={`${car.year} ${car.make} ${car.model}`}
              fill
              className="object-cover"
            />
          </div>

          {/* Modifications Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Modifications</h3>
            
            {/* Add New Mod */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newMod}
                onChange={(e) => setNewMod(e.target.value)}
                placeholder="Add a new modification..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleAddMod()}
              />
              <button
                onClick={handleAddMod}
                disabled={isLoading || !newMod.trim()}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <IconPlus size={20} />
                Add
              </button>
            </div>

            {/* Mods List */}
            <div className="flex flex-wrap gap-2">
              {car.mods.map((mod, index) => (
                <div
                  key={index}
                  className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full flex items-center gap-2"
                >
                  <span>{mod}</span>
                  <button
                    onClick={() => handleRemoveMod(index)}
                    disabled={isLoading}
                    className="text-zinc-400 hover:text-red-500 disabled:opacity-50"
                  >
                    <IconX size={16} />
                  </button>
                </div>
              ))}
              {car.mods.length === 0 && (
                <p className="text-zinc-500 italic">No modifications added yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-6 border-t border-zinc-800">
          <button
            onClick={handleDeleteCar}
            disabled={isLoading}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <IconTrash size={20} />
            Delete Car
          </button>
          <button
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 