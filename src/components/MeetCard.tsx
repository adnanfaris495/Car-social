import Image from 'next/image'
import { IconCalendar, IconClock, IconMapPin, IconUsers } from '@tabler/icons-react'
import { getImageUrl } from '@/lib/storage'
import { formatDate, formatTime } from '@/lib/utils'

interface MeetCardProps {
  meet: {
    id: string
    title: string
    date: string
    time: string
    location_address: string
    location_city: string
    location_state: string
    max_attendees: number
    type: string
    image_url: string | null
  }
  onSelect?: () => void
}

export default function MeetCard({ meet, onSelect }: MeetCardProps) {
  const imageUrl = meet.image_url ? getImageUrl(meet.image_url, 'post-images') : '/placeholder.jpg'

  return (
    <div
      className="group relative bg-zinc-900 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-red-500 transition-all"
      onClick={onSelect}
    >
      <div className="relative aspect-video">
        <Image
          src={imageUrl}
          alt={meet.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-lg font-semibold text-white truncate">{meet.title}</h3>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-white/80">
            <div className="flex items-center gap-1">
              <IconCalendar size={16} />
              <span>{formatDate(meet.date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <IconClock size={16} />
              <span>{formatTime(meet.time)}</span>
            </div>
            <div className="flex items-center gap-1">
              <IconMapPin size={16} />
              <span>{`${meet.location_city}, ${meet.location_state}`}</span>
            </div>
            <div className="flex items-center gap-1">
              <IconUsers size={16} />
              <span>{meet.max_attendees} attendees max</span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/50 text-white text-xs font-medium">
        {meet.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </div>
    </div>
  )
} 