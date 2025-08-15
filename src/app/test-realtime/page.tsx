'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'

export default function TestRealtimePage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    if (!user) return

    console.log('Setting up real-time test for user:', user.id)

    const channel = supabase
      .channel('test_realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('User UPDATE event:', payload)
          setEvents(prev => [...prev, { type: 'USER_UPDATE', payload, timestamp: new Date().toISOString() }])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'follows'
        },
        (payload) => {
          console.log('Follow INSERT event:', payload)
          setEvents(prev => [...prev, { type: 'FOLLOW_INSERT', payload, timestamp: new Date().toISOString() }])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'follows'
        },
        (payload) => {
          console.log('Follow DELETE event:', payload)
          setEvents(prev => [...prev, { type: 'FOLLOW_DELETE', payload, timestamp: new Date().toISOString() }])
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status)
        setIsSubscribed(status === 'SUBSCRIBED')
      })

    return () => {
      console.log('Cleaning up real-time test subscription')
      supabase.removeChannel(channel)
    }
  }, [user])

  const testFollow = async () => {
    if (!user) return

    try {
      // Get another user to follow
      const { data: otherUsers } = await supabase
        .from('users')
        .select('id')
        .neq('id', user.id)
        .limit(1)

      if (otherUsers && otherUsers.length > 0) {
        const targetUserId = otherUsers[0].id
        
        // Try to follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            followed_id: targetUserId
          })

        if (error) {
          console.error('Follow error:', error)
          alert('Follow failed: ' + error.message)
        } else {
          console.log('Follow successful')
          alert('Follow successful! Check the events below.')
        }
      }
    } catch (error) {
      console.error('Test follow error:', error)
      alert('Test follow failed: ' + error)
    }
  }

  const testUnfollow = async () => {
    if (!user) return

    try {
      // Get a user that the current user is following
      const { data: follows } = await supabase
        .from('follows')
        .select('followed_id')
        .eq('follower_id', user.id)
        .limit(1)

      if (follows && follows.length > 0) {
        const targetUserId = follows[0].followed_id
        
        // Try to unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('followed_id', targetUserId)

        if (error) {
          console.error('Unfollow error:', error)
          alert('Unfollow failed: ' + error.message)
        } else {
          console.log('Unfollow successful')
          alert('Unfollow successful! Check the events below.')
        }
      } else {
        alert('No follows found to unfollow')
      }
    } catch (error) {
      console.error('Test unfollow error:', error)
      alert('Test unfollow failed: ' + error)
    }
  }

  const testUsernameUpdate = async () => {
    if (!user) return

    try {
      const newUsername = `test_${Date.now()}`
      
      const { error } = await supabase
        .from('users')
        .update({ username: newUsername })
        .eq('id', user.id)

      if (error) {
        console.error('Username update error:', error)
        alert('Username update failed: ' + error.message)
      } else {
        console.log('Username update successful')
        alert('Username update successful! Check the events below.')
      }
    } catch (error) {
      console.error('Test username update error:', error)
      alert('Test username update failed: ' + error)
    }
  }

  const clearEvents = () => {
    setEvents([])
  }

  if (!user) {
    return <div className="p-8">Please sign in to test real-time functionality.</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Real-time Test Page</h1>
      
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className={`px-3 py-1 rounded text-sm ${isSubscribed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            Subscription Status: {isSubscribed ? 'Connected' : 'Disconnected'}
          </div>
          <button
            onClick={clearEvents}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
          >
            Clear Events
          </button>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={testFollow}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-400"
          >
            Test Follow
          </button>
          <button
            onClick={testUnfollow}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-400"
          >
            Test Unfollow
          </button>
          <button
            onClick={testUsernameUpdate}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-400"
          >
            Test Username Update
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Real-time Events ({events.length})</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-gray-500">No events yet. Try the test buttons above.</p>
          ) : (
            events.map((event, index) => (
              <div key={index} className="bg-gray-800 p-3 rounded text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{event.type}</span>
                  <span className="text-gray-400 text-xs">{event.timestamp}</span>
                </div>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(event.payload, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 