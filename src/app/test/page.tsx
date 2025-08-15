'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@supabase/auth-helpers-react'
import { supabase } from '@/lib/supabase'
import { useForums } from '@/lib/forums'
import { IconCheck, IconX, IconAlertCircle } from '@tabler/icons-react'

export default function TestPage() {
  const session = useSession()
  const [testResults, setTestResults] = useState<Record<string, { status: 'pending' | 'pass' | 'fail', message?: string }>>({
    authentication: { status: 'pending' },
    database: { status: 'pending' },
    forums: { status: 'pending' },
    session: { status: 'pending' },
  })
  const [isRunning, setIsRunning] = useState(false)

  const { fetchPosts } = useForums()

  const runTests = async () => {
    setIsRunning(true)
    setTestResults({
      authentication: { status: 'pending' },
      database: { status: 'pending' },
      forums: { status: 'pending' },
      session: { status: 'pending' },
    })

    // Test 1: Authentication
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setTestResults(prev => ({
          ...prev,
          authentication: { status: 'pass', message: `Authenticated as ${user.email}` }
        }))
      } else {
        setTestResults(prev => ({
          ...prev,
          authentication: { status: 'fail', message: 'No authenticated user found' }
        }))
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        authentication: { status: 'fail', message: `Auth error: ${error}` }
      }))
    }

    // Test 2: Database Connection
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (error) throw error
      
      setTestResults(prev => ({
        ...prev,
        database: { status: 'pass', message: 'Database connection successful' }
      }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        database: { status: 'fail', message: `Database error: ${error}` }
      }))
    }

    // Test 3: Forums
    try {
      await fetchPosts()
      setTestResults(prev => ({
        ...prev,
        forums: { status: 'pass', message: 'Forums functionality working' }
      }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        forums: { status: 'fail', message: `Forums error: ${error}` }
      }))
    }

    // Test 4: Session Management
    try {
      if (session) {
        setTestResults(prev => ({
          ...prev,
          session: { status: 'pass', message: `Session active for ${session.user?.email}` }
        }))
      } else {
        setTestResults(prev => ({
          ...prev,
          session: { status: 'fail', message: 'No session found' }
        }))
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        session: { status: 'fail', message: `Session error: ${error}` }
      }))
    }

    setIsRunning(false)
  }

  useEffect(() => {
    runTests()
  }, [])

  const getStatusIcon = (status: 'pending' | 'pass' | 'fail') => {
    switch (status) {
      case 'pass':
        return <IconCheck className="w-5 h-5 text-green-500" />
      case 'fail':
        return <IconX className="w-5 h-5 text-red-500" />
      default:
        return <IconAlertCircle className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: 'pending' | 'pass' | 'fail') => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'fail':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="ml-64">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="content-card">
            <h1 className="text-3xl font-bold text-foreground mb-6">System Test Results</h1>
            
            <div className="mb-6">
              <button
                onClick={runTests}
                disabled={isRunning}
                className="button-primary disabled:opacity-50"
              >
                {isRunning ? 'Running Tests...' : 'Run Tests Again'}
              </button>
            </div>

            <div className="space-y-4">
              {Object.entries(testResults).map(([testName, result]) => (
                <div
                  key={testName}
                  className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <h3 className="font-semibold capitalize">
                        {testName.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      {result.message && (
                        <p className="text-sm mt-1">{result.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Current Session Info</h3>
              <pre className="text-sm text-blue-700 overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
