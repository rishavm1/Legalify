// Test database connection and setup
// Run with: node scripts/test-db-connection.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

async function checkTables() {
  console.log('🔍 Checking required tables...');
  
  const requiredTables = ['users', 'chat_sessions', 'chat_messages'];
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table '${table}' not found or accessible:`, error.message);
      } else {
        console.log(`✅ Table '${table}' exists and accessible`);
      }
    } catch (error) {
      console.log(`❌ Error checking table '${table}':`, error.message);
    }
  }
}

async function createTestUser() {
  console.log('🔍 Testing user creation...');
  
  const testUser = {
    email: 'test@example.com',
    name: 'Test User',
    is_verified: true
  };
  
  try {
    // Try to create a test user
    const { data, error } = await supabase
      .from('users')
      .upsert(testUser, { onConflict: 'email' })
      .select()
      .single();
    
    if (error) {
      console.log('❌ Failed to create test user:', error.message);
      return null;
    }
    
    console.log('✅ Test user created/updated:', data.id);
    return data;
  } catch (error) {
    console.log('❌ Error creating test user:', error.message);
    return null;
  }
}

async function testChatSession(userId) {
  console.log('🔍 Testing chat session creation...');
  
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        title: 'Test Chat Session'
      })
      .select()
      .single();
    
    if (error) {
      console.log('❌ Failed to create chat session:', error.message);
      return false;
    }
    
    console.log('✅ Chat session created successfully:', data.id);
    
    // Clean up - delete the test session
    await supabase.from('chat_sessions').delete().eq('id', data.id);
    console.log('✅ Test session cleaned up');
    
    return true;
  } catch (error) {
    console.log('❌ Error testing chat session:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting database tests...\n');
  
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('\n❌ Database connection failed. Please check your Supabase configuration.');
    return;
  }
  
  console.log('');
  await checkTables();
  
  console.log('');
  const testUser = await createTestUser();
  
  if (testUser) {
    console.log('');
    await testChatSession(testUser.id);
    
    // Clean up test user
    await supabase.from('users').delete().eq('email', 'test@example.com');
    console.log('✅ Test user cleaned up');
  }
  
  console.log('\n🎉 Database tests completed!');
  console.log('\nIf you see any ❌ errors above, please:');
  console.log('1. Run the fix-database.sql script in your Supabase SQL Editor');
  console.log('2. Make sure your .env.local file has the correct Supabase credentials');
  console.log('3. Restart your Next.js development server');
}

runTests().catch(console.error);