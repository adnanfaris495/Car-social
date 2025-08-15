'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconArrowLeft } from '@tabler/icons-react'
import { useMeets, type MeetType } from '@/lib/meets'
import { useSession } from '@supabase/auth-helpers-react';
import { toast } from 'sonner'

export default function NewMeetPage() {
  const router = useRouter()
  const session = useSession();
  const user = session?.user;
  const { createMeet } = useMeets()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location_address: '',
    location_city: '',
    location_state: '',
    max_attendees: '',
    type: '' as MeetType | ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please sign in to create a meet')
      return
    }

    try {
      setIsSubmitting(true)
      await createMeet({
        ...formData,
        organizer_id: user.id,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : 0,
        type: formData.type as MeetType,
        location_lat: null,
        location_lng: null,
        image_url: null
      })
      toast.success('Meet created successfully')
      router.push('/meets')
    } catch (error) {
      console.error('Error creating meet:', error)
      toast.error('Failed to create meet')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <IconArrowLeft size={20} />
        Back to meets
      </button>

      <h1 className="page-heading mb-8">Create a New Meet</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
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
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700">
            Time
          </label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="location_address" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            type="text"
            id="location_address"
            name="location_address"
            value={formData.location_address}
            onChange={handleChange}
            required
            placeholder="Street address"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="location_city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              id="location_city"
              name="location_city"
              value={formData.location_city}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="location_state" className="block text-sm font-medium text-gray-700">
              State
            </label>
            <input
              type="text"
              id="location_state"
              name="location_state"
              value={formData.location_state}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="max_attendees" className="block text-sm font-medium text-gray-700">
            Max Attendees (optional)
          </label>
          <input
            type="number"
            id="max_attendees"
            name="max_attendees"
            value={formData.max_attendees}
            onChange={handleChange}
            min="1"
            placeholder="Leave empty for unlimited"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Meet Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select meet type</option>
            <option value="cars_and_coffee">Cars & Coffee</option>
            <option value="track_day">Track Day</option>
            <option value="show_and_shine">Show & Shine</option>
            <option value="cruise">Cruise</option>
            <option value="meetup">General Meetup</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Meet'}
          </button>
        </div>
      </form>
    </div>
  )
} 