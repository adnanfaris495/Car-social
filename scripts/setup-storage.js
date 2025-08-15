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
  console.error('\nPlease add SUPABASE_SERVICE_ROLE_KEY to your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  console.log('🚀 Setting up Supabase storage...\n')

  try {
    // List existing buckets
    console.log('📋 Checking existing buckets...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError)
      return
    }

    console.log('Existing buckets:', buckets.map(b => b.name))

    // Check if cars bucket exists
    const carsBucket = buckets.find(b => b.name === 'cars')
    if (carsBucket) {
      console.log('✅ Cars bucket already exists')
    } else {
      console.log('❌ Cars bucket missing')
    }

    // Check if post-images bucket exists
    const postImagesBucket = buckets.find(b => b.name === 'post-images')
    if (postImagesBucket) {
      console.log('✅ Post-images bucket already exists')
    } else {
      console.log('❌ Post-images bucket missing')
    }

    console.log('\n🔒 RLS Policies Setup Required')
    console.log('Since automatic policy creation is not available, please run these SQL commands in your Supabase Dashboard SQL Editor:\n')
    
    console.log('-- Enable RLS on storage.objects table')
    console.log('ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;\n')
    
    console.log('-- Policy for authenticated users to upload to cars bucket')
    console.log(`CREATE POLICY "cars upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cars' AND 
    auth.role() = 'authenticated'
  );`)
    console.log('')
    
    console.log('-- Policy for authenticated users to read from cars bucket')
    console.log(`CREATE POLICY "cars read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'cars'
  );`)
    console.log('')
    
    console.log('-- Policy for authenticated users to upload to post-images bucket')
    console.log(`CREATE POLICY "post-images upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'post-images' AND 
    auth.role() = 'authenticated'
  );`)
    console.log('')
    
    console.log('-- Policy for authenticated users to read from post-images bucket')
    console.log(`CREATE POLICY "post-images read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'post-images'
  );`)
    console.log('')
    
    console.log('-- Policy for users to update their own uploads')
    console.log(`CREATE POLICY "update own uploads" ON storage.objects
  FOR UPDATE USING (
    auth.uid()::text = (storage.foldername(name))[1]
  );`)
    console.log('')
    
    console.log('-- Policy for users to delete their own uploads')
    console.log(`CREATE POLICY "delete own uploads" ON storage.objects
  FOR DELETE USING (
    auth.uid()::text = (storage.foldername(name))[1]
  );`)
    console.log('')

    console.log('🎉 Storage setup completed!')
    console.log('\nNext steps:')
    console.log('1. Go to your Supabase Dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Run the SQL commands above')
    console.log('4. Test the StorageDebug component in your app')

  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

setupStorage() 