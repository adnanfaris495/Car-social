'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function StorageDebug() {
  const [status, setStatus] = useState<string>('Testing...')
  const [error, setError] = useState<string | null>(null)
  const [buckets, setBuckets] = useState<any[]>([])
  const [authStatus, setAuthStatus] = useState<string>('Checking...')
  const [user, setUser] = useState<any>(null)
  const [details, setDetails] = useState<string[]>([])
  const [uploadTestResult, setUploadTestResult] = useState<string>('')

  const addDetail = (detail: string) => {
    setDetails(prev => [...prev, detail])
  }

  const testUpload = async () => {
    try {
      setUploadTestResult('Testing upload...')
      addDetail('Starting upload test...')
      
      // Create a small test file
      const testContent = 'test'
      const testFile = new File([testContent], 'test.txt', { type: 'text/plain' })
      
      addDetail('Created test file')
      
      // Try to upload to cars bucket
      const { data, error } = await supabase.storage
        .from('cars')
        .upload(`test-${Date.now()}.txt`, testFile)
      
      if (error) {
        console.error('Upload error:', error)
        setUploadTestResult(`Upload failed: ${error.message}`)
        addDetail(`Upload error: ${error.message}`)
        addDetail(`Error details: ${JSON.stringify(error, null, 2)}`)
        return
      }
      
      setUploadTestResult(`Upload successful: ${data?.path}`)
      addDetail(`Upload successful: ${data?.path}`)
      
      // Clean up test file
      if (data?.path) {
        await supabase.storage.from('cars').remove([data.path])
        addDetail('Test file cleaned up')
      }
      
    } catch (err) {
      console.error('Upload test error:', err)
      setUploadTestResult(`Upload test error: ${err}`)
      addDetail(`Upload test error: ${err}`)
    }
  }

  useEffect(() => {
    const testStorage = async () => {
      try {
        setStatus('Testing authentication...')
        addDetail('Starting authentication test...')
        
        // Test authentication first
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.error('Auth error:', authError)
          setAuthStatus('Authentication failed')
          setError(`Authentication error: ${authError.message}`)
          addDetail(`Auth error: ${authError.message}`)
          return
        }
        
        if (!authUser) {
          setAuthStatus('Not authenticated')
          setError('User not authenticated')
          addDetail('User not authenticated')
          return
        }
        
        setUser(authUser)
        setAuthStatus(`Authenticated as: ${authUser.email}`)
        addDetail(`Authenticated as: ${authUser.email}`)
        addDetail(`User ID: ${authUser.id}`)
        
        // Test storage bucket access
        setStatus('Testing storage bucket access...')
        addDetail('Testing storage bucket access...')
        
        const { data: bucketsData, error: bucketsError } = await supabase.storage.listBuckets()
        
        if (bucketsError) {
          console.error('Error listing buckets:', bucketsError)
          setError(`Failed to list buckets: ${bucketsError.message}`)
          setStatus('Failed to list buckets')
          addDetail(`Bucket listing error: ${bucketsError.message}`)
          return
        }
        
        if (!bucketsData || bucketsData.length === 0) {
          setError('No buckets found in your Supabase project')
          setStatus('No buckets available')
          addDetail('Found 0 buckets')
          addDetail('No buckets found - this suggests buckets may not exist or RLS is blocking access')
          return
        }
        
        setBuckets(bucketsData)
        addDetail(`Found ${bucketsData.length} buckets`)
        
        bucketsData.forEach(bucket => {
          addDetail(`Bucket: ${bucket.name} (public: ${bucket.public}, created: ${bucket.created_at})`)
        })
        
        // Test bucket permissions by trying to list files
        setStatus('Testing bucket permissions...')
        addDetail('Testing bucket file listing permissions...')
        
        try {
          const { data: carsFiles, error: carsError } = await supabase.storage
            .from('cars')
            .list('', { limit: 1 })
          
          if (carsError) {
            console.error('Cars bucket access error:', carsError)
            setError(`Cars bucket access error: ${carsError.message}`)
            setStatus('Cars bucket access failed')
            addDetail(`Cars bucket access failed: ${carsError.message}`)
            return
          } else {
            addDetail(`Cars bucket access successful (${carsFiles?.length || 0} files found)`)
          }
          
          const { data: postFiles, error: postError } = await supabase.storage
            .from('post-images')
            .list('', { limit: 1 })
          
          if (postError) {
            console.error('Post-images bucket access error:', postError)
            setError(`Post-images bucket access error: ${postError.message}`)
            setStatus('Post-images bucket access failed')
            addDetail(`Post-images bucket access failed: ${postError.message}`)
            return
          } else {
            addDetail(`Post-images bucket access successful (${postFiles?.length || 0} files found)`)
          }
          
        } catch (error) {
          console.error('Bucket access test error:', error)
          setError(`Bucket access test error: ${error}`)
          setStatus('Bucket access test failed')
          addDetail(`Bucket access test error: ${error}`)
          return
        }
        
        setStatus('Storage test completed successfully')
        addDetail('All storage tests passed!')
        
      } catch (error) {
        console.error('Storage test error:', error)
        setError(`Storage test error: ${error}`)
        setStatus('Storage test failed')
        addDetail(`Storage test error: ${error}`)
      }
    }

    testStorage()
  }, [])

  return (
    <div className="bg-zinc-900 rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-white">Storage Debug</h2>
      
      <div className="space-y-4">
        <div>
          <strong className="text-white">Status:</strong> {status}
        </div>
        
        <div>
          <strong className="text-white">Auth Status:</strong> {authStatus}
        </div>
        
        {user && (
          <div>
            <strong className="text-white">User ID:</strong> {user.id}
          </div>
        )}
        
        {error && (
          <div className="text-red-400">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {buckets.length > 0 && (
          <div>
            <strong className="text-white">Available buckets:</strong>
            <ul className="list-disc list-inside text-white ml-4">
              {buckets.map(bucket => (
                <li key={bucket.name}>
                  {bucket.name} (public: {bucket.public.toString()})
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div>
          <strong className="text-white">Debug Details:</strong>
          <ul className="list-disc list-inside text-white ml-4 max-h-40 overflow-y-auto">
            {details.map((detail, index) => (
              <li key={index}>• {detail}</li>
            ))}
          </ul>
        </div>
        
        <div className="pt-4">
          <button
            onClick={testUpload}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Test File Upload
          </button>
          {uploadTestResult && (
            <div className="mt-2 text-sm">
              <strong className="text-white">Upload Test:</strong> {uploadTestResult}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 