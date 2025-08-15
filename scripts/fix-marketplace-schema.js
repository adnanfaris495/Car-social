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

async function fixMarketplaceSchema() {
  console.log('🔍 Checking Marketplace table schema...\n')

  try {
    // Check the actual schema by trying different column names
    console.log('1. Testing different column names...')
    
    // Test with image_url (singular)
    const testListing1 = {
      user_id: '00000000-0000-0000-0000-000000000000',
      title: 'Test Listing 1',
      description: 'Test description',
      price: 100.00,
      condition: 'New',
      location: 'Test Location',
      image_url: 'test1.jpg', // singular
      compatible_makes: ['BMW'],
      compatible_models: ['M3'],
      compatible_years: [2020],
      is_trade_available: false,
      is_sold: false
    }

    const { data: insertData1, error: insertError1 } = await supabase
      .from('marketplace_listings')
      .insert([testListing1])
      .select()

    if (insertError1) {
      console.log('❌ Failed with image_url (singular):', insertError1.message)
    } else {
      console.log('✅ Success with image_url (singular)')
      // Clean up
      if (insertData1 && insertData1[0]) {
        await supabase.from('marketplace_listings').delete().eq('id', insertData1[0].id)
      }
    }

    // Test with image_urls (plural)
    const testListing2 = {
      user_id: '00000000-0000-0000-0000-000000000000',
      title: 'Test Listing 2',
      description: 'Test description',
      price: 100.00,
      condition: 'New',
      location: 'Test Location',
      image_urls: ['test1.jpg', 'test2.jpg'], // plural
      compatible_makes: ['BMW'],
      compatible_models: ['M3'],
      compatible_years: [2020],
      is_trade_available: false,
      is_sold: false
    }

    const { data: insertData2, error: insertError2 } = await supabase
      .from('marketplace_listings')
      .insert([testListing2])
      .select()

    if (insertError2) {
      console.log('❌ Failed with image_urls (plural):', insertError2.message)
    } else {
      console.log('✅ Success with image_urls (plural)')
      // Clean up
      if (insertData2 && insertData2[0]) {
        await supabase.from('marketplace_listings').delete().eq('id', insertData2[0].id)
      }
    }

    console.log('\n📋 Schema Fix Required')
    console.log('Based on the test results, you need to fix the schema mismatch. Run these SQL commands in your Supabase Dashboard SQL Editor:\n')
    
    console.log('-- Option 1: If the table has image_url (singular), rename it to image_urls (plural)')
    console.log('ALTER TABLE public.marketplace_listings RENAME COLUMN image_url TO image_urls;')
    console.log('ALTER TABLE public.marketplace_listings ALTER COLUMN image_urls TYPE TEXT[] USING ARRAY[image_urls];')
    console.log('')
    
    console.log('-- Option 2: If the table has image_urls (plural), make sure it\'s TEXT[] type')
    console.log('ALTER TABLE public.marketplace_listings ALTER COLUMN image_urls TYPE TEXT[];')
    console.log('')
    
    console.log('-- Also ensure RLS policies are correct:')
    console.log('DROP POLICY IF EXISTS "Anyone can view listings" ON public.marketplace_listings;')
    console.log('DROP POLICY IF EXISTS "Authenticated users can create listings" ON public.marketplace_listings;')
    console.log('DROP POLICY IF EXISTS "Users can update their own listings" ON public.marketplace_listings;')
    console.log('DROP POLICY IF EXISTS "Users can delete their own listings" ON public.marketplace_listings;')
    console.log('')
    console.log('ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;')
    console.log('')
    console.log('CREATE POLICY "Anyone can view listings" ON public.marketplace_listings FOR SELECT USING (true);')
    console.log('CREATE POLICY "Authenticated users can create listings" ON public.marketplace_listings FOR INSERT WITH CHECK (auth.uid() = user_id);')
    console.log('CREATE POLICY "Users can update their own listings" ON public.marketplace_listings FOR UPDATE USING (auth.uid() = user_id);')
    console.log('CREATE POLICY "Users can delete their own listings" ON public.marketplace_listings FOR DELETE USING (auth.uid() = user_id);')

    console.log('\n🎉 Schema fix instructions provided!')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

fixMarketplaceSchema() 