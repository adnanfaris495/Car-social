import { useState } from 'react'
import { useMeets, type MeetType } from '@/lib/meets'
import { toast } from 'sonner'
import { useSession } from '@supabase/auth-helpers-react';
import Image from 'next/image'
import { IconX, IconUpload } from '@tabler/icons-react'

interface AddMeetFormProps {
  onClose: () => void
}

export default function AddMeetForm({ onClose }: AddMeetFormProps) {
  const { createMeet, isLoading } = useMeets()
  const user = useSession()?.user;
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location_address: '',
    location_city: '',
    location_state: '',
    max_attendees: '',
    type: 'cars_and_coffee' as MeetType
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleImageChange triggered')
    const file = e.target.files?.[0]
    console.log('Selected file:', file)
    
    if (!file) {
      console.log('No file selected')
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      console.log('Invalid file type:', file.type)
      toast.error(`Invalid file type. Allowed types are: ${allowedTypes.join(', ')}`)
      return
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      console.log('File too large:', file.size)
      toast.error('File size exceeds 5MB limit')
      return
    }

    console.log('File validation passed, setting image')
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      console.log('FileReader completed, setting preview')
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('You must be logged in to create a meet')
      return
    }

    if (!imageFile) {
      toast.error('Please add an image for your meet')
      return
    }

    try {
      await createMeet({
        ...formData,
        max_attendees: parseInt(formData.max_attendees),
        location_lat: null,
        location_lng: null,
        organizer_id: user.id,
        image_url: null // Will be populated by uploadImages
      }, imageFile)

      onClose()
    } catch (error) {
      console.error('Error creating meet:', error)
      toast.error('Failed to create meet')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-4"
    >
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
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
          <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
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

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-white mb-2">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium text-white mb-2">
              Time
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label htmlFor="location_address" className="block text-sm font-medium text-white mb-2">
            Address
          </label>
          <input
            type="text"
            id="location_address"
            name="location_address"
            value={formData.location_address}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        {/* City and State */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="location_city" className="block text-sm font-medium text-white mb-2">
              City
            </label>
            <input
              type="text"
              id="location_city"
              name="location_city"
              value={formData.location_city}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div>
            <label htmlFor="location_state" className="block text-sm font-medium text-white mb-2">
              State
            </label>
            <input
              type="text"
              id="location_state"
              name="location_state"
              value={formData.location_state}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
        </div>

        {/* Max Attendees and Event Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="max_attendees" className="block text-sm font-medium text-white mb-2">
              Maximum Attendees
            </label>
            <input
              type="number"
              id="max_attendees"
              name="max_attendees"
              value={formData.max_attendees}
              onChange={handleChange}
              required
              min="1"
              className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-white mb-2">
              Event Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white"
            >
              <option value="cars_and_coffee">Cars & Coffee</option>
              <option value="track_day">Track Day</option>
              <option value="car_show">Car Show</option>
              <option value="cruise">Cruise</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Event Image */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Event Image
          </label>
          <div className="relative aspect-video rounded-lg overflow-hidden">
            {imagePreview ? (
              <>
                <Image
                  src={imagePreview}
                  alt="Event preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 z-10"
                >
                  <IconX size={16} />
                </button>
              </>
            ) : (
              <div className="relative aspect-video rounded-lg border-2 border-dashed border-zinc-700 hover:border-zinc-500 transition-colors group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="meet-image-upload"
                />
                <label 
                  htmlFor="meet-image-upload"
                  className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-10"
                >
                  <IconUpload className="w-8 h-8 text-zinc-400 group-hover:text-zinc-300 transition-colors" />
                  <span className="text-sm text-zinc-400 group-hover:text-zinc-300 mt-2 transition-colors">
                    Click to Add Event Image
                  </span>
                </label>
              </div>
            )}
          </div>
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
            {isLoading ? 'Creating...' : 'Create Meet'}
          </button>
        </div>
      </div>
    </form>
  )
} 