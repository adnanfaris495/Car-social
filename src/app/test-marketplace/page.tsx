'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestMarketplacePage() {
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function runTests() {
      const results: any = {}

      try {
        // Test 1: Basic connection
        console.log('Testing basic connection...')
        const { data: connectionTest, error: connectionError } = await supabase
          .from('marketplace_listings')
          .select('count')
          .limit(1)
        
        results.connection = {
          success: !connectionError,
          error: connectionError?.message,
          data: connectionTest
        }

        // Test 2: Check table structure
        console.log('Checking table structure...')
        const { data: structureTest, error: structureError } = await supabase
          .from('marketplace_listings')
          .select('*')
          .limit(1)
        
        results.structure = {
          success: !structureError,
          error: structureError?.message,
          data: structureTest
        }

        // Test 3: Check RLS policies
        console.log('Checking RLS policies...')
        // Try to insert a test record to check RLS
        const { data: policiesTest, error: policiesError } = await supabase
          .from('marketplace_listings')
          .select('id')
          .limit(1)
        
        results.policies = {
          success: !policiesError,
          error: policiesError?.message,
          data: policiesTest
        }

        // Test 4: Try to fetch listings with join
        console.log('Testing listings fetch with join...')
        const { data: listingsTest, error: listingsError } = await supabase
          .from('marketplace_listings')
          .select(`
            *,
            users (
              id,
              username,
              avatar_url
            )
          `)
          .limit(5)
        
        results.listings = {
          success: !listingsError,
          error: listingsError?.message,
          data: listingsTest,
          count: listingsTest?.length || 0
        }

        // Test 5: Check if users table exists and has data
        console.log('Checking users table...')
        const { data: usersTest, error: usersError } = await supabase
          .from('users')
          .select('id, username')
          .limit(5)
        
        results.users = {
          success: !usersError,
          error: usersError?.message,
          data: usersTest,
          count: usersTest?.length || 0
        }

        // Test 6: Check foreign key relationship
        console.log('Checking foreign key relationship...')
        const { data: fkTest, error: fkError } = await supabase
          .from('marketplace_listings')
          .select('user_id')
          .limit(5)
        
        results.foreignKey = {
          success: !fkError,
          error: fkError?.message,
          data: fkTest
        }

      } catch (error) {
        console.error('Test error:', error)
        results.generalError = error
      }

      setTestResults(results)
      setLoading(false)
    }

    runTests()
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Testing Marketplace Database...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Marketplace Database Test Results</h1>
      
      {Object.entries(testResults).map(([testName, result]: [string, any]) => (
        <div key={testName} className="mb-6 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2 capitalize">{testName}</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="font-medium">
                {result.success ? 'SUCCESS' : 'FAILED'}
              </span>
            </div>
            {result.error && (
              <div className="text-red-600 bg-red-50 p-2 rounded">
                <strong>Error:</strong> {result.error}
              </div>
            )}
            {result.data && (
              <div className="text-sm bg-gray-50 p-2 rounded">
                <strong>Data:</strong> {JSON.stringify(result.data, null, 2)}
              </div>
            )}
            {result.count !== undefined && (
              <div className="text-sm text-gray-600">
                Count: {result.count}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
} 