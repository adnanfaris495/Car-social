'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import Image from 'next/image'
import { IconX, IconUpload } from '@tabler/icons-react'
import { uploadImages } from '@/lib/storage'

interface NewListingFormProps {
  userId: string
}

export default function NewListingForm({ userId }: NewListingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    // Limit to 3 images
    if (imageFiles.length + files.length > 3) {
      toast.error('Maximum 3 images allowed')
      return
    }

    // Validate each file
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        return false
      }

      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds 5MB limit`)
        return false
      }

      return true
    })

    if (!validFiles.length) return

    // Add new files to existing ones
    setImageFiles(prev => [...prev, ...validFiles])

    // Generate previews for new files
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    if (imageFiles.length === 0) {
      toast.error('Please add at least one image')
      setIsSubmitting(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    
    try {
      // Upload images first
      const imagePaths = await uploadImages(imageFiles, 'post-images')

      const data = {
        user_id: userId,
        title: formData.get('title'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price') as string),
        image_urls: imagePaths,
        condition: formData.get('condition'),
        compatible_makes: (formData.get('compatible_makes') as string).split(',').map(s => s.trim()).filter(Boolean),
        compatible_models: (formData.get('compatible_models') as string).split(',').map(s => s.trim()).filter(Boolean),
        compatible_years: (formData.get('compatible_years') as string).split(',').map(s => parseInt(s.trim())).filter(Boolean),
        location: formData.get('location'),
        is_trade_available: formData.get('is_trade_available') === 'true',
        is_sold: false
      }

      const { error: insertError } = await supabase
        .from('marketplace_listings')
        .insert([data])

      if (insertError) throw insertError

      router.push('/marketplace')
      router.refresh()
      toast.success('Listing created successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price
        </label>
        <input
          type="number"
          id="price"
          name="price"
          min="0"
          step="0.01"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images (Max 3)
        </label>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-wrap gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative w-32 h-32">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <IconX size={16} />
                </button>
              </div>
            ))}
            {imagePreviews.length < 3 && (
              <label className="w-32 h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="text-center">
                  <IconUpload size={24} className="mx-auto text-gray-400" />
                  <p className="text-xs text-gray-500 mt-1">Upload</p>
                </div>
              </label>
            )}
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
          Condition
        </label>
        <select
          id="condition"
          name="condition"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select condition</option>
          <option value="new">New</option>
          <option value="like_new">Like New</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
      </div>

      <div>
        <label htmlFor="compatible_makes" className="block text-sm font-medium text-gray-700">
          Compatible Makes (comma-separated)
        </label>
        <input
          type="text"
          id="compatible_makes"
          name="compatible_makes"
          placeholder="e.g., BMW, Audi, Mercedes"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="compatible_models" className="block text-sm font-medium text-gray-700">
          Compatible Models (comma-separated)
        </label>
        <input
          type="text"
          id="compatible_models"
          name="compatible_models"
          placeholder="e.g., 3 Series, A4, C-Class"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="compatible_years" className="block text-sm font-medium text-gray-700">
          Compatible Years (comma-separated)
        </label>
        <input
          type="text"
          id="compatible_years"
          name="compatible_years"
          placeholder="e.g., 2020, 2021, 2022"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          required
          placeholder="e.g., Los Angeles, CA"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_trade_available"
          name="is_trade_available"
          value="true"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="is_trade_available" className="ml-2 block text-sm text-gray-700">
          Trade offers accepted
        </label>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Listing'}
        </button>
      </div>
    </form>
  )
} 