'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugUserProfilePage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const runDebug = async () => {
      const info: any = {}
      
      try {
        // Test user ID from the URL
        const testUserId = 'ffc30bd4-3b79-46cf-b7c1-f04b9a3230ba'
        
        // 1. Check if we can query the users table at all
        const { data: allUsers, error: allUsersError } = await supabase
          .from('users')
          .select('id, username, created_at')
          .limit(5)
        
        info.allUsers = allUsers
        info.allUsersError = allUsersError
        
        // 2. Try to fetch the specific user
        const { data: specificUser, error: specificUserError } = await supabase
          .from('users')
          .select('*')
          .eq('id', testUserId)
          .single()
        
        info.specificUser = specificUser
        info.specificUserError = specificUserError
        
        // 3. Check if the user exists in auth.users
        const { data: authUser, error: authError } = await supabase.auth.getUser()
        info.currentAuthUser = authUser?.user
        info.authError = authError
        
        // 4. Try to query with RLS disabled (if possible)
        try {
          const { data: rpcResult, error: rpcError } = await supabase
            .rpc('get_user_by_id', { user_id: testUserId })
          info.rpcResult = rpcResult
          info.rpcError = rpcError
        } catch (error) {
          info.rpcError = 'RPC function not available'
        }
        
      } catch (error) {
        info.generalError = error
      } finally {
        setLoading(false)
      }
      
      setDebugInfo(info)
    }

    runDebug()
  }, [])

  if (loading) {
    return <div className="p-8">Loading debug info...</div>
  }

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">User Profile Debug</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">All Users (first 5)</h2>
          <pre className="bg-gray-800 p-4 rounded overflow-auto">
            {JSON.stringify(debugInfo.allUsers, null, 2)}
          </pre>
          {debugInfo.allUsersError && (
            <div className="text-red-400 mt-2">
              Error: {JSON.stringify(debugInfo.allUsersError, null, 2)}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Specific User Query</h2>
          <pre className="bg-gray-800 p-4 rounded overflow-auto">
            {JSON.stringify(debugInfo.specificUser, null, 2)}
          </pre>
          {debugInfo.specificUserError && (
            <div className="text-red-400 mt-2">
              Error: {JSON.stringify(debugInfo.specificUserError, null, 2)}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Current Auth User</h2>
          <pre className="bg-gray-800 p-4 rounded overflow-auto">
            {JSON.stringify(debugInfo.currentAuthUser, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">RPC Result</h2>
          <pre className="bg-gray-800 p-4 rounded overflow-auto">
            {JSON.stringify(debugInfo.rpcResult, null, 2)}
          </pre>
          {debugInfo.rpcError && (
            <div className="text-red-400 mt-2">
              RPC Error: {JSON.stringify(debugInfo.rpcError, null, 2)}
            </div>
          )}
        </div>

        {debugInfo.generalError && (
          <div>
            <h2 className="text-xl font-semibold mb-2 text-red-400">General Error</h2>
            <pre className="bg-red-900 p-4 rounded overflow-auto">
              {JSON.stringify(debugInfo.generalError, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
} 