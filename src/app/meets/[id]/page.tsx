'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  IconCalendarEvent,
  IconMapPin,
  IconUsers,
  IconArrowLeft,
  IconSend,
  IconEdit,
  IconTrash
} from '@tabler/icons-react'
import { useMeets, type Meet, type MeetAttendee, type AttendanceStatus } from '@/lib/meets'
import { useSession } from '@supabase/auth-helpers-react';
import { formatDateTime, getImageUrl } from '@/lib/utils'
import { toast } from 'sonner'

export default function MeetPage() {
  const params = useParams()
  const router = useRouter()
  const session = useSession();
  const user = session?.user;
  const {
    meets,
    attendees,
    comments,
    updateAttendance,
    addComment,
    updateComment,
    deleteComment,
    deleteMeet
  } = useMeets()

  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const meet = meets.find(m => m.id === params.id)
  const meetAttendees = attendees[params.id as string] || []
  const meetComments = comments[params.id as string] || []

  const userAttendance = meetAttendees.find(a => a.user_id === user?.id)
  const isOrganizer = meet?.organizer_id === user?.id

  const handleAttendance = async (status: AttendanceStatus) => {
    if (!user) {
      toast.error('Please sign in to RSVP')
      return
    }

    try {
      setIsSubmitting(true)
      await updateAttendance(params.id as string, status)
      toast.success('RSVP updated successfully')
    } catch (error) {
      console.error('Error updating attendance:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please sign in to comment')
      return
    }

    try {
      setIsSubmitting(true)
      await addComment(params.id as string, newComment.trim())
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteMeet = async () => {
    if (!isOrganizer) return

    try {
      setIsSubmitting(true)
      await deleteMeet(params.id as string)
      router.push('/meets')
    } catch (error) {
      console.error('Error deleting meet:', error)
      setIsSubmitting(false)
    }
  }

  if (!meet) {
    return (
      <div className="text-center py-12 text-zinc-400">
        Meet not found
      </div>
    )
  }

  const goingCount = meetAttendees.filter(a => a.status === 'going').length
  const maybeCount = meetAttendees.filter(a => a.status === 'maybe').length
  const spotsLeft = meet.max_attendees ? meet.max_attendees - goingCount : null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6"
      >
        <IconArrowLeft size={20} />
        Back to meets
      </button>

      <div className="bg-zinc-900 rounded-lg overflow-hidden mb-8">
        {meet.image_url && (
          <div className="relative h-64">
            <Image
              src={getImageUrl('meet', meet.image_url)}
              alt={meet.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="page-heading">{meet.title}</h1>
            {isOrganizer && (
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/meets/${meet.id}/edit`)}
                  className="text-zinc-400 hover:text-white"
                >
                  <IconEdit size={20} />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <IconTrash size={20} />
                  Cancel Meet
                </button>
              </div>
            )}
          </div>

          {meet.description && (
            <p className="text-zinc-400 mb-6">{meet.description}</p>
          )}

          <div className="space-y-4 text-zinc-300">
            <div className="flex items-center gap-2">
              <IconCalendarEvent size={20} className="text-zinc-400" />
              <span>{formatDateTime(meet.date, meet.time)}</span>
            </div>
            <div className="flex items-center gap-2">
              <IconMapPin size={20} className="text-zinc-400" />
              <span>{meet.location_address}, {meet.location_city}, {meet.location_state}</span>
            </div>
            <div className="flex items-center gap-2">
              <IconUsers size={20} className="text-zinc-400" />
              <span>
                {goingCount} going · {maybeCount} maybe
                {spotsLeft !== null && ` · ${spotsLeft} spots left`}
              </span>
            </div>
          </div>

          {!isOrganizer && (
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => handleAttendance('going')}
                disabled={isSubmitting}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  userAttendance?.status === 'going'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                {userAttendance?.status === 'going' ? 'Going!' : 'Going'}
              </button>
              <button
                onClick={() => handleAttendance('maybe')}
                disabled={isSubmitting}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  userAttendance?.status === 'maybe'
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                Maybe
              </button>
              <button
                onClick={() => handleAttendance('not_going')}
                disabled={isSubmitting}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  userAttendance?.status === 'not_going'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                Not Going
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-zinc-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Discussion</h2>

        <div className="space-y-6 mb-6">
          {meetComments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">User</span>
                  <span className="text-sm text-zinc-400">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-zinc-300">{comment.comment}</p>
              </div>
            </div>
          ))}

          {meetComments.length === 0 && (
            <div className="text-center py-6 text-zinc-400">
              No comments yet
            </div>
          )}
        </div>

        <form onSubmit={handleComment} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IconSend size={20} />
          </button>
        </form>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Cancel Meet</h3>
            <p className="text-zinc-400 mb-2">
              Are you sure you want to cancel this meet? This action cannot be undone.
            </p>
            <p className="text-zinc-400 mb-6">
              All attendees will be notified that the meet has been canceled.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Keep Meet
              </button>
              <button
                onClick={handleDeleteMeet}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Canceling...' : 'Yes, Cancel Meet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 