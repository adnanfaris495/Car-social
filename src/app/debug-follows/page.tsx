'use client'

import { useSession } from '@supabase/auth-helpers-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'

export default function DebugFollows() {
  const session = useSession()
  const user = session?.user
  const supabase = createClientComponentClient()
  const [follows, setFollows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkFollows = async () => {
      if (!user) {
        console.log('No user logged in')
        setLoading(false)
        return
      }

      try {
        console.log('Checking follows for user:', user.id)
        
        // Get follows
        const { data: followsData, error: followsError } = await supabase
          .from('follows')
          .select('followed_id')
          .eq('follower_id', user.id)

        console.log('Follows data:', followsData, 'Error:', followsError)

        if (followsError) {
          console.error('Follows error:', followsError)
          return
        }

        if (followsData && followsData.length > 0) {
          const followedUserIds = followsData.map(follow => follow.followed_id)
          console.log('Followed user IDs:', followedUserIds)

          // Get followed users' cars
          const { data: carsData, error: carsError } = await supabase
            .from('cars')
            .select(`
              id,
              make,
              model,
              year,
              image_url,
              user_id
            `)
            .in('user_id', followedUserIds)

          console.log('Cars data:', carsData, 'Error:', carsError)

          if (carsData) {
            setFollows(carsData)
          }
        } else {
          console.log('No follows found')
        }
      } catch (error) {
        console.error('Error checking follows:', error)
      } finally {
        setLoading(false)
      }
    }

    checkFollows()
  }, [user, supabase])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Follows</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold">User Info:</h2>
        <p>Logged in: {user ? 'Yes' : 'No'}</p>
        <p>User ID: {user?.id || 'N/A'}</p>
        <p>Email: {user?.email || 'N/A'}</p>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold">Follows Found:</h2>
        <p>Count: {follows.length}</p>
      </div>

      {follows.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Followed Users' Cars:</h2>
          <div className="space-y-2">
            {follows.map((car) => (
              <div key={car.id} className="border p-3 rounded">
                <p><strong>Car:</strong> {car.year} {car.make} {car.model}</p>
                <p><strong>User ID:</strong> {car.user_id}</p>
                <p><strong>Image:</strong> {car.image_url || 'None'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Console Logs:</h2>
        <p>Check the browser console (F12) for detailed logs about the follows fetching process.</p>
      </div>
    </div>
  )
} 