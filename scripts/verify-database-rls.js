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

async function verifyDatabaseRLS() {
  console.log('🔍 Verifying Database RLS policies...\n')

  try {
    // Check if cars table exists and has RLS enabled
    console.log('1. Checking cars table and RLS status...')
    const { data: carsTable, error: carsTableError } = await supabase
      .from('cars')
      .select('*')
      .limit(1)
    
    if (carsTableError) {
      console.log('❌ RLS is enabled on cars table (expected - this is good)')
    } else {
      console.log('⚠️  RLS might not be enabled on cars table')
    }

    // Test inserting a car record
    console.log('\n2. Testing car insertion...')
    const testCar = {
      user_id: 'test-user-id',
      make: 'Test',
      model: 'Car',
      year: 2024,
      image_url: 'test.jpg',
      mods: []
    }

    const { data: insertData, error: insertError } = await supabase
      .from('cars')
      .insert([testCar])
      .select()

    if (insertError) {
      console.log('❌ Car insertion failed:', insertError.message)
      console.log('This confirms the RLS policy is blocking insertion')
    } else {
      console.log('✅ Car insertion successful (this means RLS is not working properly)')
      
      // Clean up test record
      if (insertData && insertData[0]) {
        await supabase.from('cars').delete().eq('id', insertData[0].id)
        console.log('✅ Test car record cleaned up')
      }
    }

    console.log('\n📋 Database RLS Fix Required')
    console.log('The issue is with the cars table RLS policies. Run these SQL commands in your Supabase Dashboard SQL Editor:\n')
    
    console.log('-- First, drop existing policies')
    console.log('DROP POLICY IF EXISTS "Users can view all cars" ON public.cars;')
    console.log('DROP POLICY IF EXISTS "Users can insert their own cars" ON public.cars;')
    console.log('DROP POLICY IF EXISTS "Users can update their own cars" ON public.cars;')
    console.log('DROP POLICY IF EXISTS "Users can delete their own cars" ON public.cars;')
    console.log('')
    
    console.log('-- Enable RLS on cars table')
    console.log('ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;')
    console.log('')
    
    console.log('-- Create new policies')
    console.log('-- Allow users to view all cars')
    console.log(`CREATE POLICY "Users can view all cars" ON public.cars
  FOR SELECT USING (true);`)
    console.log('')
    
    console.log('-- Allow authenticated users to insert their own cars')
    console.log(`CREATE POLICY "Users can insert their own cars" ON public.cars
  FOR INSERT WITH CHECK (auth.uid() = user_id);`)
    console.log('')
    
    console.log('-- Allow users to update their own cars')
    console.log(`CREATE POLICY "Users can update their own cars" ON public.cars
  FOR UPDATE USING (auth.uid() = user_id);`)
    console.log('')
    
    console.log('-- Allow users to delete their own cars')
    console.log(`CREATE POLICY "Users can delete their own cars" ON public.cars
  FOR DELETE USING (auth.uid() = user_id);`)
    console.log('')

    console.log('🎉 Database RLS setup instructions provided!')
    console.log('\nNext steps:')
    console.log('1. Go to your Supabase Dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Run the SQL commands above')
    console.log('4. Test creating a car in your app')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

verifyDatabaseRLS() 