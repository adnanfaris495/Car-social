'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'

export default function TestDBPage() {
  const { user } = useAuth()
  const [dbInfo, setDbInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        // Check users table structure
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .limit(1)

        console.log('Users table check:', { data: usersData, error: usersError })

        // Check follows table structure
        const { data: followsData, error: followsError } = await supabase
          .from('follows')
          .select('*')
          .limit(1)

        console.log('Follows table check:', { data: followsData, error: followsError })

        // Check current user's profile
        if (user) {
          const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

          console.log('Current user profile:', { data: userProfile, error: profileError })

          // Check if user has any follows
          const { data: userFollows, error: followsError2 } = await supabase
            .from('follows')
            .select('*')
            .or(`follower_id.eq.${user.id},followed_id.eq.${user.id}`)

          console.log('User follows:', { data: userFollows, error: followsError2 })
        }

        setDbInfo({
          users: usersData,
          follows: followsData,
          userProfile: user ? await supabase.from('users').select('*').eq('id', user.id).single() : null,
          userFollows: user ? await supabase.from('follows').select('*').or(`follower_id.eq.${user.id},followed_id.eq.${user.id}`) : null
        })
      } catch (error) {
        console.error('Database check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkDatabase()
  }, [user])

  if (loading) {
    return <div className="p-8">Loading database info...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Users Table Structure</h2>
          <pre className="bg-gray-800 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(dbInfo?.users, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Follows Table Structure</h2>
          <pre className="bg-gray-800 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(dbInfo?.follows, null, 2)}
          </pre>
        </div>

        {user && (
          <>
            <div>
              <h2 className="text-xl font-semibold mb-2">Current User Profile</h2>
              <pre className="bg-gray-800 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(dbInfo?.userProfile, null, 2)}
              </pre>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">User Follows</h2>
              <pre className="bg-gray-800 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(dbInfo?.userFollows, null, 2)}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 