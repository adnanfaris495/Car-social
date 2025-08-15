'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  IconCalendarEvent,
  IconMapPin,
  IconUsers,
  IconPlus,
  IconFilter,
  IconSearch
} from '@tabler/icons-react'
import { useMeets, type MeetType } from '@/lib/meets'
import { useSession } from '@supabase/auth-helpers-react';
import { formatDate, getImageUrl } from '@/lib/utils'
import AddMeetForm from '@/components/AddMeetForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function MeetsPage() {
  const router = useRouter()
  const session = useSession();
  const user = session?.user;
  const {
    meets,
    attendees,
    isLoading,
    error,
    fetchMeets,
    fetchAttendeesForMeet
  } = useMeets()

  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    type: '' as MeetType | '',
    city: '',
    state: '',
    date: ''
  })
  const [showAddMeet, setShowAddMeet] = useState(false)

  useEffect(() => {
    const loadMeets = async () => {
      await fetchMeets()
      // Fetch attendees for each meet
      const { meets: currentMeets } = useMeets.getState()
      for (const meet of currentMeets) {
        await fetchAttendeesForMeet(meet.id)
      }
    }
    loadMeets()
  }, [fetchMeets, fetchAttendeesForMeet])

  const filteredMeets = meets.filter(meet => {
    if (searchTerm && !meet.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (filters.type && meet.type !== filters.type) {
      return false
    }
    if (filters.city && meet.location_city.toLowerCase() !== filters.city.toLowerCase()) {
      return false
    }
    if (filters.state && meet.location_state.toLowerCase() !== filters.state.toLowerCase()) {
      return false
    }
    if (filters.date && meet.date !== filters.date) {
      return false
    }
    return true
  })

  const getAttendeeCount = (meetId: string) => {
    return attendees[meetId]?.filter(a => a.status === 'going').length || 0
  }

  if (isLoading) {
    return (
      <div className="ml-64"> {/* Account for left sidebar */}
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="ml-64"> {/* Account for left sidebar */}
        <div className="text-center text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="ml-64"> {/* Account for left sidebar */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="page-heading">Car Meets</h1>
          {user && (
            <button
              onClick={() => setShowAddMeet(true)}
              className="flex items-center gap-2 rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-white hover:bg-accent-primary/90 transition-colors"
            >
              <IconPlus size={16} />
              Create Meet
            </button>
          )}
        </div>

        <div className="car-themed-section rounded-lg p-4 mb-8">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search meets..."
                className="w-full bg-background border border-border rounded-lg search-input-with-icon pr-4 py-2 text-foreground focus:ring-2 focus:ring-accent-primary focus:outline-none"
              />
              <IconSearch size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-background border border-border text-foreground px-4 py-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
            >
              <IconFilter size={20} />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={filters.type}
                onChange={(e) => setFilters(f => ({ ...f, type: e.target.value as MeetType | '' }))}
                className="bg-background border border-border text-foreground px-3 py-2 rounded-md focus:ring-2 focus:ring-accent-primary focus:outline-none"
              >
                <option value="">All Types</option>
                <option value="cars_and_coffee">Cars & Coffee</option>
                <option value="track_day">Track Day</option>
                <option value="cruise">Cruise</option>
                <option value="show">Car Show</option>
              </select>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => setFilters(f => ({ ...f, city: e.target.value }))}
                placeholder="City"
                className="bg-background border border-border text-foreground px-3 py-2 rounded-md focus:ring-2 focus:ring-accent-primary focus:outline-none"
              />
              <input
                type="text"
                value={filters.state}
                onChange={(e) => setFilters(f => ({ ...f, state: e.target.value }))}
                placeholder="State"
                className="bg-background border border-border text-foreground px-3 py-2 rounded-md focus:ring-2 focus:ring-accent-primary focus:outline-none"
              />
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters(f => ({ ...f, date: e.target.value }))}
                className="bg-background border border-border text-foreground px-3 py-2 rounded-md focus:ring-2 focus:ring-accent-primary focus:outline-none"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMeets.map((meet) => (
            <button
              key={meet.id}
              onClick={() => router.push(`/meets/${meet.id}`)}
              className="bg-card rounded-lg overflow-hidden shadow-lg hover:bg-zinc-800/50 transition-colors text-left w-full"
            >
              <div className="relative h-48">
                <Image
                  src={getImageUrl('meet', meet.image_url)}
                  alt={meet.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{meet.title}</h3>
                <div className="space-y-2 text-zinc-400">
                  <div className="flex items-center gap-2">
                    <IconCalendarEvent size={20} />
                    <span>{formatDate(meet.date)} at {meet.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconMapPin size={20} />
                    <span>{meet.location_city}, {meet.location_state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconUsers size={20} />
                    <span>
                      {getAttendeeCount(meet.id)} attending
                      {meet.max_attendees && ` (${meet.max_attendees - getAttendeeCount(meet.id)} spots left)`}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}

          {filteredMeets.length === 0 && (
            <div className="col-span-full text-center py-12 text-zinc-400">
              <IconCalendarEvent size={48} className="mx-auto mb-4 opacity-50" />
              <p>No meets found</p>
            </div>
          )}
        </div>

        <Dialog open={showAddMeet} onOpenChange={setShowAddMeet}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Meet</DialogTitle>
            </DialogHeader>
            <AddMeetForm onClose={() => setShowAddMeet(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 