'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'

export default function DebugProfilePage() {
  const { user } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const runDebug = async () => {
      const info: any = {}
      
      try {
        // 1. Check current auth user
        const { data: authData, error: authError } = await supabase.auth.getUser()
        info.currentUser = authData?.user
        info.authError = authError
        
        // 2. Check if we can query the users table at all
        const { data: allUsers, error: allUsersError } = await supabase
          .from('users')
          .select('id, username, created_at')
          .limit(5)
        
        info.allUsers = allUsers
        info.allUsersError = allUsersError
        
        // 3. If we have a current user, try to fetch their profile
        if (authData?.user?.id) {
          const { data: userProfile, error: userProfileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single()
          
          info.userProfile = userProfile
          info.userProfileError = userProfileError
        }
        
        // 4. Test with a specific user ID (replace with an actual user ID from your database)
        const testUserId = '575a7946-aa3d-43be-94af-222748808a54' // Replace with actual user ID
        const { data: testProfile, error: testProfileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', testUserId)
          .single()
        
        info.testProfile = testProfile
        info.testProfileError = testProfileError
        
        // 5. Check RLS policies
        let policies = null
        let policiesError = null
        try {
          const { data, error } = await supabase
            .rpc('get_table_policies', { table_name: 'users' })
          policies = data
          policiesError = error
        } catch (error) {
          policiesError = 'RPC not available'
        }
        
        info.policies = policies
        info.policiesError = policiesError
        
      } catch (error) {
        info.generalError = error
      }
      
      setDebugInfo(info)
      setLoading(false)
    }
    
    runDebug()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Profile - Loading...</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Profile</h1>
      
      <div className="space-y-6">
        <div className="bg-zinc-900 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Current Auth User</h2>
          <pre className="text-sm text-zinc-300 overflow-auto">
            {JSON.stringify(debugInfo.currentUser, null, 2)}
          </pre>
          {debugInfo.authError && (
            <div className="mt-2 text-red-400">
              Auth Error: {JSON.stringify(debugInfo.authError, null, 2)}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">All Users (First 5)</h2>
          <pre className="text-sm text-zinc-300 overflow-auto">
            {JSON.stringify(debugInfo.allUsers, null, 2)}
          </pre>
          {debugInfo.allUsersError && (
            <div className="mt-2 text-red-400">
              All Users Error: {JSON.stringify(debugInfo.allUsersError, null, 2)}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Current User Profile</h2>
          <pre className="text-sm text-zinc-300 overflow-auto">
            {JSON.stringify(debugInfo.userProfile, null, 2)}
          </pre>
          {debugInfo.userProfileError && (
            <div className="mt-2 text-red-400">
              User Profile Error: {JSON.stringify(debugInfo.userProfileError, null, 2)}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Test User Profile</h2>
          <pre className="text-sm text-zinc-300 overflow-auto">
            {JSON.stringify(debugInfo.testProfile, null, 2)}
          </pre>
          {debugInfo.testProfileError && (
            <div className="mt-2 text-red-400">
              Test Profile Error: {JSON.stringify(debugInfo.testProfileError, null, 2)}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">RLS Policies</h2>
          <pre className="text-sm text-zinc-300 overflow-auto">
            {JSON.stringify(debugInfo.policies, null, 2)}
          </pre>
          {debugInfo.policiesError && (
            <div className="mt-2 text-red-400">
              Policies Error: {JSON.stringify(debugInfo.policiesError, null, 2)}
            </div>
          )}
        </div>

        {debugInfo.generalError && (
          <div className="bg-red-900 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">General Error</h2>
            <pre className="text-sm text-red-300 overflow-auto">
              {JSON.stringify(debugInfo.generalError, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
} 