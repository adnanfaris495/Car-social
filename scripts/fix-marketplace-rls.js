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

async function fixMarketplaceRLS() {
  console.log('🔍 Fixing Marketplace RLS policies and schema...\n')

  try {
    // Check if marketplace_listings table exists
    console.log('1. Checking marketplace_listings table...')
    const { data: tableExists, error: tableError } = await supabase
      .from('marketplace_listings')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.log('❌ marketplace_listings table does not exist or has issues')
      console.log('Error:', tableError.message)
      return
    }
    
    console.log('✅ marketplace_listings table exists')

    // Test inserting a marketplace listing
    console.log('\n2. Testing marketplace listing insertion...')
    const testListing = {
      user_id: '00000000-0000-0000-0000-000000000000', // Test UUID
      title: 'Test Listing',
      description: 'Test description',
      price: 100.00,
      condition: 'New',
      location: 'Test Location',
      image_urls: ['test1.jpg', 'test2.jpg'],
      compatible_makes: ['BMW'],
      compatible_models: ['M3'],
      compatible_years: [2020],
      is_trade_available: false,
      is_sold: false
    }

    const { data: insertData, error: insertError } = await supabase
      .from('marketplace_listings')
      .insert([testListing])
      .select()

    if (insertError) {
      console.log('❌ Marketplace listing insertion failed:', insertError.message)
      console.log('This confirms the RLS policy is blocking insertion')
    } else {
      console.log('✅ Marketplace listing insertion successful (this means RLS is not working properly)')
      
      // Clean up test record
      if (insertData && insertData[0]) {
        await supabase.from('marketplace_listings').delete().eq('id', insertData[0].id)
        console.log('✅ Test marketplace listing record cleaned up')
      }
    }

    console.log('\n📋 Marketplace RLS Fix Required')
    console.log('The issue is with the marketplace_listings table RLS policies. Run these SQL commands in your Supabase Dashboard SQL Editor:\n')
    
    console.log('-- First, drop existing policies')
    console.log('DROP POLICY IF EXISTS "Anyone can view listings" ON public.marketplace_listings;')
    console.log('DROP POLICY IF EXISTS "Authenticated users can create listings" ON public.marketplace_listings;')
    console.log('DROP POLICY IF EXISTS "Users can update their own listings" ON public.marketplace_listings;')
    console.log('DROP POLICY IF EXISTS "Users can delete their own listings" ON public.marketplace_listings;')
    console.log('')
    
    console.log('-- Enable RLS on marketplace_listings table')
    console.log('ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;')
    console.log('')
    
    console.log('-- Create new policies')
    console.log('-- Allow users to view all listings')
    console.log(`CREATE POLICY "Anyone can view listings" ON public.marketplace_listings
  FOR SELECT USING (true);`)
    console.log('')
    
    console.log('-- Allow authenticated users to create listings')
    console.log(`CREATE POLICY "Authenticated users can create listings" ON public.marketplace_listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);`)
    console.log('')
    
    console.log('-- Allow users to update their own listings')
    console.log(`CREATE POLICY "Users can update their own listings" ON public.marketplace_listings
  FOR UPDATE USING (auth.uid() = user_id);`)
    console.log('')
    
    console.log('-- Allow users to delete their own listings')
    console.log(`CREATE POLICY "Users can delete their own listings" ON public.marketplace_listings
  FOR DELETE USING (auth.uid() = user_id);`)
    console.log('')

    console.log('🎉 Marketplace RLS setup instructions provided!')
    console.log('\nNext steps:')
    console.log('1. Go to your Supabase Dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Run the SQL commands above')
    console.log('4. Test creating a marketplace listing in your app')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

fixMarketplaceRLS() 