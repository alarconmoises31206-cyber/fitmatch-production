// test-rls-permissions.js
// Test Row Level Security permissions

const { createClient } = require('@supabase/supabase-js');

async function testRLSPermissions() {
    console.log('🔐 Testing RLS Permissions\n');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('Testing with different keys:');
    console.log(`- URL: ${supabaseUrl ? '✅' : '❌'}`);
    console.log(`- Anon Key: ${supabaseAnonKey ? '✅' : '❌'}`);
    console.log(`- Service Key: ${supabaseServiceKey ? '✅' : '❌'}`);
    
    // Test 1: With anon key (what frontend uses)
    console.log('\n1. Testing with ANON key (frontend):');
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    
    try {
        const testData = {
            test_field: 'RLS test ' + Date.now(),
            created_at: new Date().toISOString()
        };
        
        // Try to insert into conversations
        const { data: convData, error: convError } = await anonClient
            .from('conversations')
            .insert([testData])
            .select();
        
        if (convError) {
            console.log(`  conversations insert: ❌ ${convError.message}`);
        } else {
            console.log('  conversations insert: ✅ SUCCESS');
            // Clean up
            await anonClient.from('conversations').delete().eq('id', convData[0].id);
        }
        
        // Try to insert into profiles
        const { data: profileData, error: profileError } = await anonClient
            .from('profiles')
            .insert([testData])
            .select();
        
        if (profileError) {
            console.log(`  profiles insert: ❌ ${profileError.message}`);
        } else {
            console.log('  profiles insert: ✅ SUCCESS');
            // Clean up
            await anonClient.from('profiles').delete().eq('id', profileData[0].id);
        }
        
    } catch (err) {
        console.log(`  Error: ${err.message}`);
    }
    
    // Test 2: With service role key (bypasses RLS)
    if (supabaseServiceKey) {
        console.log('\n2. Testing with SERVICE ROLE key (bypasses RLS):');
        const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
        
        try {
            const testData = {
                test_field: 'Service role test ' + Date.now(),
                created_at: new Date().toISOString()
            };
            
            const { data: convData, error: convError } = await serviceClient
                .from('conversations')
                .insert([testData])
                .select();
            
            if (convError) {
                console.log(`  conversations insert: ❌ ${convError.message}`);
            } else {
                console.log('  conversations insert: ✅ SUCCESS (bypassed RLS)');
                // Clean up
                await serviceClient.from('conversations').delete().eq('id', convData[0].id);
            }
            
        } catch (err) {
            console.log(`  Error: ${err.message}`);
        }
    }
    
    console.log('\n💡 DIAGNOSIS:');
    console.log('- If anon key fails but service key works: RLS policies blocking writes');
    console.log('- Need to: 1) Check RLS policies in Supabase dashboard');
    console.log('           2) Enable INSERT permissions for authenticated users');
    console.log('           3) Or use service role key for server-side operations');
}

require('dotenv').config({ path: '.env.local' });
testRLSPermissions();
