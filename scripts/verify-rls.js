const { createClient } = require('@supabase/supabase-js')

// Load environment variables from .env.local
const fs = require('fs')
const path = require('path')

function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    
    lines.forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '')
          process.env[key] = value
        }
      }
    })
  }
}

// Load .env.local file
loadEnvFile(path.join(__dirname, '..', '.env.local'))

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyRLS() {
  console.log('🔍 Verifying RLS policies...\n')

  try {
    // Check if RLS is enabled on storage.objects
    console.log('1. Checking RLS status on storage.objects...')
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('storage.objects')
      .select('*')
      .limit(1)
    
    if (rlsError) {
      console.log('❌ RLS is enabled (expected - this is good)')
    } else {
      console.log('⚠️  RLS might not be enabled')
    }

    // List existing policies
    console.log('\n2. Checking existing policies...')
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
          FROM pg_policies 
          WHERE tablename = 'objects' 
          AND schemaname = 'storage'
        `
      })

    if (policiesError) {
      console.log('❌ Cannot check policies (exec_sql not available)')
      console.log('You need to check policies manually in Supabase Dashboard')
      console.log('\nGo to: Supabase Dashboard → Storage → Policies')
      console.log('Look for policies on the storage.objects table')
      return
    }

    if (policies && policies.length > 0) {
      console.log('✅ Found policies:')
      policies.forEach(policy => {
        console.log(`   - ${policy.policyname} (${policy.cmd})`)
      })
    } else {
      console.log('❌ No policies found')
    }

    // Test bucket access
    console.log('\n3. Testing bucket access...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.log('❌ Cannot list buckets:', bucketsError.message)
      return
    }

    console.log('✅ Buckets found:', buckets.map(b => b.name).join(', '))

    // Test file listing
    console.log('\n4. Testing file listing...')
    const { data: files, error: filesError } = await supabase.storage
      .from('cars')
      .list('', { limit: 1 })

    if (filesError) {
      console.log('❌ Cannot list files in cars bucket:', filesError.message)
    } else {
      console.log('✅ Can list files in cars bucket')
    }

    // Test file upload
    console.log('\n5. Testing file upload...')
    const testContent = 'test'
    const testFile = new File([testContent], 'test.txt', { type: 'text/plain' })
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cars')
      .upload(`test-${Date.now()}.txt`, testFile)

    if (uploadError) {
      console.log('❌ Upload failed:', uploadError.message)
      console.log('This is likely an RLS policy issue')
    } else {
      console.log('✅ Upload successful:', uploadData.path)
      
      // Clean up
      await supabase.storage.from('cars').remove([uploadData.path])
      console.log('✅ Test file cleaned up')
    }

    console.log('\n📋 Summary:')
    console.log('If upload failed, you need to fix RLS policies.')
    console.log('\nGo to Supabase Dashboard → SQL Editor and run:')
    console.log(`
-- Drop existing policies first
DROP POLICY IF EXISTS "cars upload" ON storage.objects;
DROP POLICY IF EXISTS "cars read" ON storage.objects;
DROP POLICY IF EXISTS "post-images upload" ON storage.objects;
DROP POLICY IF EXISTS "post-images read" ON storage.objects;
DROP POLICY IF EXISTS "update own uploads" ON storage.objects;
DROP POLICY IF EXISTS "delete own uploads" ON storage.objects;

-- Create new policies
CREATE POLICY "cars upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cars' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "cars read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'cars'
  );

CREATE POLICY "post-images upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'post-images' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "post-images read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'post-images'
  );

CREATE POLICY "update own uploads" ON storage.objects
  FOR UPDATE USING (
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "delete own uploads" ON storage.objects
  FOR DELETE USING (
    auth.uid()::text = (storage.foldername(name))[1]
  );
    `)

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

verifyRLS() 