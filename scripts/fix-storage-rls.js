const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
      process.env[key.trim()] = value.trim()
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixStorageRLS() {
  console.log('🔧 Fixing Supabase Storage RLS policies...')

  try {
    // First, let's check what buckets exist
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError)
      return
    }

    console.log('Existing buckets:', buckets.map(b => b.name))

    // Create buckets if they don't exist
    const requiredBuckets = ['cars', 'post-images', 'listings']
    
    for (const bucketName of requiredBuckets) {
      const bucketExists = buckets.some(b => b.name === bucketName)
      
      if (!bucketExists) {
        console.log(`Creating bucket: ${bucketName}`)
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          fileSizeLimit: 5242880 // 5MB
        })
        
        if (createError) {
          console.error(`Error creating bucket ${bucketName}:`, createError)
        } else {
          console.log(`✅ Created bucket: ${bucketName}`)
        }
      } else {
        console.log(`Bucket ${bucketName} already exists`)
      }
    }

    // Now let's set up proper RLS policies for each bucket
    const policies = [
      {
        bucket: 'cars',
        name: 'Allow authenticated users to upload car images',
        definition: 'auth.role() = \'authenticated\'',
        operation: 'INSERT'
      },
      {
        bucket: 'cars',
        name: 'Allow public to view car images',
        definition: 'true',
        operation: 'SELECT'
      },
      {
        bucket: 'cars',
        name: 'Allow users to delete their own car images',
        definition: 'auth.role() = \'authenticated\'',
        operation: 'DELETE'
      },
      {
        bucket: 'post-images',
        name: 'Allow authenticated users to upload post images',
        definition: 'auth.role() = \'authenticated\'',
        operation: 'INSERT'
      },
      {
        bucket: 'post-images',
        name: 'Allow public to view post images',
        definition: 'true',
        operation: 'SELECT'
      },
      {
        bucket: 'post-images',
        name: 'Allow users to delete their own post images',
        definition: 'auth.role() = \'authenticated\'',
        operation: 'DELETE'
      },
      {
        bucket: 'listings',
        name: 'Allow authenticated users to upload listing images',
        definition: 'auth.role() = \'authenticated\'',
        operation: 'INSERT'
      },
      {
        bucket: 'listings',
        name: 'Allow public to view listing images',
        definition: 'true',
        operation: 'SELECT'
      },
      {
        bucket: 'listings',
        name: 'Allow users to delete their own listing images',
        definition: 'auth.role() = \'authenticated\'',
        operation: 'DELETE'
      }
    ]

    for (const policy of policies) {
      console.log(`Setting up policy: ${policy.name}`)
      
      // First, try to drop existing policy if it exists
      try {
        await supabase.rpc('drop_policy_if_exists', {
          table_name: `storage.objects`,
          policy_name: policy.name
        })
      } catch (error) {
        // Policy might not exist, which is fine
      }

      // Create the policy
      const { error: policyError } = await supabase.rpc('create_policy', {
        table_name: `storage.objects`,
        policy_name: policy.name,
        definition: policy.definition,
        operation: policy.operation,
        bucket_name: policy.bucket
      })

      if (policyError) {
        console.error(`Error creating policy ${policy.name}:`, policyError)
      } else {
        console.log(`✅ Created policy: ${policy.name}`)
      }
    }

    console.log('🎉 Storage RLS policies setup complete!')

  } catch (error) {
    console.error('Error fixing storage RLS:', error)
  }
}

fixStorageRLS() 