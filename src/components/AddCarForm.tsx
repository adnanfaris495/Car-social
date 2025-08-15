'use client'

import { useState } from 'react'
import { IconX, IconUpload } from '@tabler/icons-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { uploadCarImage } from '@/lib/storage'
import { useSession } from '@supabase/auth-helpers-react';

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

interface AddCarFormProps {
  onSubmit: (car: Omit<Car, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  onClose: () => void
}

export default function AddCarForm({ onSubmit, onClose }: AddCarFormProps) {
  const user = useSession()?.user;
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    image_url: '',
    mods: [] as string[],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mod, setMod] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error(`Invalid file type. Allowed types are: ${allowedTypes.join(', ')}`)
      return
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File size exceeds 5MB limit')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('You must be logged in to add a car')
      return
    }

    if (!imageFile) {
      toast.error('Please select an image for your car')
      return
    }

    setIsSubmitting(true)
    try {
      console.log('Starting car upload process...')
      console.log('User ID:', user.id)
      
      let image_url: string
      try {
        console.log('Uploading image:', imageFile.name)
        image_url = await uploadCarImage(imageFile)
        console.log('Image uploaded successfully:', image_url)
      } catch (error) {
        console.error('Image upload error:', error)
        if (error instanceof Error) {
          toast.error(`Failed to upload image: ${error.message}`)
        } else {
          toast.error('Failed to upload image')
        }
        setIsSubmitting(false)
        return
      }

      const carData = {
        ...formData,
        image_url,
        year: Number(formData.year)
      }

      console.log('Submitting car data:', carData)
      
      // First, try to insert directly into the database to verify RLS policies
      const { data: insertedCar, error: insertError } = await supabase
        .from('cars')
        .insert([{
          ...carData,
          user_id: user.id,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (insertError) {
        console.error('Database error:', insertError)
        throw new Error(`Database error: ${insertError.message}`)
      }

      if (!insertedCar) {
        throw new Error('No data returned from database')
      }

      console.log('Car added successfully:', insertedCar)
      await onSubmit(carData)
      
      toast.success('Car added successfully!')
      onClose()
    } catch (error) {
      console.error('Error adding car:', error)
      if (error instanceof Error) {
        toast.error(`Failed to add car: ${error.message}`)
      } else {
        toast.error('Failed to add car')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddMod = (e: React.FormEvent) => {
    e.preventDefault()
    if (mod.trim()) {
      setFormData(prev => ({
        ...prev,
        mods: [...prev.mods, mod.trim()]
      }))
      setMod('')
    }
  }

  const handleRemoveMod = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mods: prev.mods.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
          disabled={isSubmitting}
        >
          <IconX size={20} />
        </button>

        <h2 className="section-heading mb-6 text-white">Add a Car</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="make" className="block text-sm font-medium mb-1 text-white">
              Make
            </label>
            <input
              type="text"
              id="make"
              value={formData.make}
              onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium mb-1 text-white">
              Model
            </label>
            <input
              type="text"
              id="model"
              value={formData.model}
              onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium mb-1 text-white">
              Year
            </label>
            <input
              type="number"
              id="year"
              value={formData.year}
              onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              required
              min="1886"
              max={new Date().getFullYear() + 1}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Car Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-zinc-700 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="relative w-full h-40">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-40 w-auto mx-auto object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview('')
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                      disabled={isSubmitting}
                    >
                      <IconX size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <IconUpload
                      className="mx-auto h-12 w-12 text-zinc-400"
                      aria-hidden="true"
                    />
                    <div className="flex text-sm text-zinc-400">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-medium text-red-500 hover:text-red-400"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageChange}
                          disabled={isSubmitting}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-zinc-400">
                      PNG, JPG, or WebP up to 5MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Modifications
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={mod}
                onChange={(e) => setMod(e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Add a modification"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={handleAddMod}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-400 transition-colors disabled:opacity-50"
                disabled={!mod.trim() || isSubmitting}
              >
                Add
              </button>
            </div>
            {formData.mods.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.mods.map((mod, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 text-sm bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full"
                  >
                    {mod}
                    <button
                      type="button"
                      onClick={() => handleRemoveMod(index)}
                      className="text-zinc-400 hover:text-white"
                      disabled={isSubmitting}
                    >
                      <IconX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-400 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Car'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 