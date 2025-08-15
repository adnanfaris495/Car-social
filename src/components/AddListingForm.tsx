import { useState } from 'react'
import { useMarketplace } from '@/lib/marketplace'
import { toast } from 'sonner'
import { useSession } from '@supabase/auth-helpers-react';
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { IconX, IconUpload } from '@tabler/icons-react'

interface AddListingFormProps {
  onClose: () => void
}

export default function AddListingForm({ onClose }: AddListingFormProps) {
  const { createListing, isLoading } = useMarketplace()
  const user = useSession()?.user;
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'New',
    location: '',
    compatible_makes: [''],
    compatible_models: [''],
    compatible_years: [''],
    is_trade_available: false,
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('You must be logged in to create a listing')
      return
    }

    if (imageFiles.length === 0) {
      toast.error('Please add at least one image')
      return
    }

    try {
      await createListing({
        ...formData,
        price: parseFloat(formData.price),
        compatible_makes: formData.compatible_makes.filter(Boolean),
        compatible_models: formData.compatible_models.filter(Boolean),
        compatible_years: formData.compatible_years.filter(Boolean).map(year => parseInt(year)),
        image_urls: [], // Will be populated by uploadImages
        is_sold: false
      }, imageFiles)

      onClose()
    } catch (error) {
      console.error('Error creating listing:', error)
      toast.error('Failed to create listing')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleArrayChange = (index: number, value: string, field: 'compatible_makes' | 'compatible_models' | 'compatible_years') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayField = (field: 'compatible_makes' | 'compatible_models' | 'compatible_years') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayField = (index: number, field: 'compatible_makes' | 'compatible_models' | 'compatible_years') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Images (Max 3)
          </label>
          <div className="flex flex-wrap gap-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative w-24 h-24">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white"
                >
                  <IconX size={16} />
                </button>
              </div>
            ))}
            {imagePreviews.length < 3 && (
              <label className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-zinc-700 rounded-md cursor-pointer hover:border-zinc-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <IconUpload className="w-6 h-6 text-zinc-500" />
              </label>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-white">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-white">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        {/* Price and Condition */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-white">
              Price
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-white">
              Condition
            </label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white"
            >
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Used - Excellent">Used - Excellent</option>
              <option value="Used - Good">Used - Good</option>
              <option value="Used - Fair">Used - Fair</option>
              <option value="For Parts">For Parts</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-white">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        {/* Compatible Makes */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Compatible Makes
          </label>
          {formData.compatible_makes.map((make, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={make}
                onChange={(e) => handleArrayChange(index, e.target.value, 'compatible_makes')}
                placeholder="e.g., BMW"
                className="flex-1 rounded-md bg-zinc-800 border-zinc-700 text-white"
              />
              {formData.compatible_makes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField(index, 'compatible_makes')}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayField('compatible_makes')}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            + Add Make
          </button>
        </div>

        {/* Compatible Models */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Compatible Models
          </label>
          {formData.compatible_models.map((model, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={model}
                onChange={(e) => handleArrayChange(index, e.target.value, 'compatible_models')}
                placeholder="e.g., M3"
                className="flex-1 rounded-md bg-zinc-800 border-zinc-700 text-white"
              />
              {formData.compatible_models.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField(index, 'compatible_models')}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayField('compatible_models')}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            + Add Model
          </button>
        </div>

        {/* Compatible Years */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Compatible Years
          </label>
          {formData.compatible_years.map((year, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="number"
                value={year}
                onChange={(e) => handleArrayChange(index, e.target.value, 'compatible_years')}
                placeholder="e.g., 2020"
                min="1900"
                max="2030"
                className="flex-1 rounded-md bg-zinc-800 border-zinc-700 text-white"
              />
              {formData.compatible_years.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField(index, 'compatible_years')}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayField('compatible_years')}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            + Add Year
          </button>
        </div>

        {/* Trade Available */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_trade_available"
            name="is_trade_available"
            checked={formData.is_trade_available}
            onChange={(e) => setFormData(prev => ({ ...prev, is_trade_available: e.target.checked }))}
            className="rounded bg-zinc-800 border-zinc-700 text-blue-600"
          />
          <label htmlFor="is_trade_available" className="ml-2 text-sm text-white">
            Trade offers accepted
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 rounded-md hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Listing'}
          </button>
        </div>
      </div>
    </form>
  )
} 