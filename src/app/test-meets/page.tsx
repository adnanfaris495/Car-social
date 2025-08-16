'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function TestMeetsPage() {
  const [testResults, setTestResults] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const runTests = async () => {
      const results: any = {}

      try {
        // Test 1: Check if meets table exists
        const { data: tableCheck, error: tableError } = await supabase
          .from('meets')
          .select('count')
          .limit(1)

        results.tableExists = !tableError
        results.tableError = tableError?.message

        // Test 2: Try to fetch meets
        const { data: meets, error: meetsError } = await supabase
          .from('meets')
          .select('*')
          .limit(5)

        results.canFetchMeets = !meetsError
        results.meetsError = meetsError?.message
        results.meetsCount = meets?.length || 0

        // Test 3: Check user authentication
        const { data: { user } } = await supabase.auth.getUser()
        results.userAuthenticated = !!user
        results.userId = user?.id

        // Test 4: Try to insert a test meet (if authenticated)
        if (user) {
          const testMeet = {
            title: 'Test Meet',
            description: 'Test description',
            date: '2024-12-25',
            time: '14:00',
            location_address: 'Test Address',
            location_city: 'Test City',
            location_state: 'TS',
            max_attendees: 10,
            type: 'cars_and_coffee',
            organizer_id: user.id
          }

          const { data: insertData, error: insertError } = await supabase
            .from('meets')
            .insert([testMeet])
            .select()

          results.canInsert = !insertError
          results.insertError = insertError?.message

          // Clean up test data
          if (insertData?.[0]?.id) {
            await supabase
              .from('meets')
              .delete()
              .eq('id', insertData[0].id)
          }
        }

      } catch (error) {
        results.generalError = error instanceof Error ? error.message : 'Unknown error'
      }

      setTestResults(results)
      setIsLoading(false)
    }

    runTests()
  }, [supabase])

  if (isLoading) {
    return <div>Testing meets functionality...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Meets Functionality Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold">Table Exists: {testResults.tableExists ? '✅' : '❌'}</h2>
          {testResults.tableError && <p className="text-red-500">Error: {testResults.tableError}</p>}
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">Can Fetch Meets: {testResults.canFetchMeets ? '✅' : '❌'}</h2>
          <p>Meets count: {testResults.meetsCount}</p>
          {testResults.meetsError && <p className="text-red-500">Error: {testResults.meetsError}</p>}
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">User Authenticated: {testResults.userAuthenticated ? '✅' : '❌'}</h2>
          {testResults.userId && <p>User ID: {testResults.userId}</p>}
        </div>

        {testResults.userAuthenticated && (
          <div className="p-4 border rounded">
            <h2 className="font-semibold">Can Insert Meet: {testResults.canInsert ? '✅' : '❌'}</h2>
            {testResults.insertError && <p className="text-red-500">Error: {testResults.insertError}</p>}
          </div>
        )}

        {testResults.generalError && (
          <div className="p-4 border rounded bg-red-50">
            <h2 className="font-semibold text-red-600">General Error:</h2>
            <p className="text-red-500">{testResults.generalError}</p>
          </div>
        )}
      </div>
    </div>
  )
}
