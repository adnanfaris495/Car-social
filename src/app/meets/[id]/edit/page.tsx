'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { IconArrowLeft } from '@tabler/icons-react'
import { useMeets, type MeetType } from '@/lib/meets'
import { useSession } from '@supabase/auth-helpers-react';
import { toast } from 'sonner'

export default function EditMeetPage() {
  const params = useParams()
  const router = useRouter()
  const session = useSession();
  const user = session?.user;
  const { meets, updateMeet } = useMeets()

  const meet = meets.find(m => m.id === params.id)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: meet?.title || '',
    description: meet?.description || '',
    date: meet?.date || '',
    time: meet?.time || '',
    location_address: meet?.location_address || '',
    location_city: meet?.location_city || '',
    location_state: meet?.location_state || '',
    max_attendees: meet?.max_attendees?.toString() || '',
    type: meet?.type || '' as MeetType | ''
  })

  useEffect(() => {
    if (!meet) {
      toast.error('Meet not found')
      router.push('/meets')
      return
    }

    if (meet.organizer_id !== user?.id) {
      toast.error('You are not authorized to edit this meet')
      router.push(`/meets/${meet.id}`)
      return
    }
  }, [meet, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!meet || !user) return

    try {
      setIsSubmitting(true)
      await updateMeet(meet.id, {
        ...formData,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : 0,
        type: formData.type as MeetType
      })
      router.push(`/meets/${meet.id}`)
    } catch (error) {
      console.error('Error updating meet:', error)
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (!meet || meet.organizer_id !== user?.id) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6"
      >
        <IconArrowLeft size={20} />
        Back to meet
      </button>

      <h1 className="page-heading mb-8">Edit Meet</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-zinc-400 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full bg-zinc-900 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-zinc-400 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full bg-zinc-900 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-zinc-400 mb-2">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full bg-zinc-900 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium text-zinc-400 mb-2">
              Time
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="w-full bg-zinc-900 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="location_address" className="block text-sm font-medium text-zinc-400 mb-2">
            Address
          </label>
          <input
            type="text"
            id="location_address"
            name="location_address"
            value={formData.location_address}
            onChange={handleChange}
            required
            className="w-full bg-zinc-900 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="location_city" className="block text-sm font-medium text-zinc-400 mb-2">
              City
            </label>
            <input
              type="text"
              id="location_city"
              name="location_city"
              value={formData.location_city}
              onChange={handleChange}
              required
              className="w-full bg-zinc-900 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="location_state" className="block text-sm font-medium text-zinc-400 mb-2">
              State
            </label>
            <input
              type="text"
              id="location_state"
              name="location_state"
              value={formData.location_state}
              onChange={handleChange}
              required
              className="w-full bg-zinc-900 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-zinc-400 mb-2">
              Event Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full bg-zinc-900 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="">Select Type</option>
              <option value="cars_and_coffee">Cars & Coffee</option>
              <option value="track_day">Track Day</option>
              <option value="cruise">Cruise</option>
              <option value="show">Car Show</option>
            </select>
          </div>

          <div>
            <label htmlFor="max_attendees" className="block text-sm font-medium text-zinc-400 mb-2">
              Max Attendees (optional)
            </label>
            <input
              type="number"
              id="max_attendees"
              name="max_attendees"
              value={formData.max_attendees}
              onChange={handleChange}
              min="1"
              className="w-full bg-zinc-900 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
} 