'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestUserExistsPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const testUser = async () => {
      const userId = 'ffc30bd4-3b79-46cf-b7c1-f04b9a3230ba'
      
      try {
        // Test 1: Check if user exists in users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        // Test 2: Check if user exists in auth.users (if possible)
        const { data: authData, error: authError } = await supabase.auth.getUser()

        setResult({
          userId,
          userData,
          userError,
          currentAuthUser: authData?.user,
          authError
        })
      } catch (error) {
        setResult({ error: error })
      } finally {
        setLoading(false)
      }
    }

    testUser()
  }, [])

  if (loading) {
    return <div className="p-8">Testing user existence...</div>
  }

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Test User Exists</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">User Data from users table:</h2>
          <pre className="bg-gray-800 p-4 rounded overflow-auto">
            {JSON.stringify(result?.userData, null, 2)}
          </pre>
          {result?.userError && (
            <div className="text-red-400 mt-2">
              Error: {JSON.stringify(result.userError, null, 2)}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Current Auth User:</h2>
          <pre className="bg-gray-800 p-4 rounded overflow-auto">
            {JSON.stringify(result?.currentAuthUser, null, 2)}
          </pre>
        </div>

        {result?.error && (
          <div>
            <h2 className="text-xl font-semibold mb-2 text-red-400">General Error:</h2>
            <pre className="bg-red-900 p-4 rounded overflow-auto">
              {JSON.stringify(result.error, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
} 