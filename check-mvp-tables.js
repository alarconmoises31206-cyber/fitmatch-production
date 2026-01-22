// check-mvp-tables.js
// Precise check of MVP-required tables

const { createClient } = require('@supabase/supabase-js');

async function checkMVPTables() {
    console.log('🔍 PRECISE MVP TABLE CHECK\n');
    
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // MVP-REQUIRED TABLES (from our architecture)
    const mvpTables = {
        'users': { required: true, purpose: 'User accounts & profiles' },
        'profiles': { required: true, purpose: 'Trainer/client profiles' },
        'trainers': { required: true, purpose: 'Trainer-specific data' },
        'matches': { required: true, purpose: 'AI Matchmaking results' },
        'conversations': { required: true, purpose: 'Messaging between users' },
        'transactions': { required: false, purpose: 'Token payments (Phase 2.5)' },
        'onboarding_progress': { required: false, purpose: 'User onboarding state' }
    };
    
    console.log('📊 TABLE EXISTENCE CHECK:');
    console.log('=' .repeat(50));
    
    let allRequiredExist = true;
    
    for (const [tableName, tableInfo] of Object.entries(mvpTables)) {
        try {
            const { error } = await supabase
                .from(tableName)
                .select('count')
                .limit(1);
            
            if (error) {
                if (error.message.includes('Could not find the table')) {
                    console.log(`  ${tableName.padEnd(20)} ❌ MISSING - ${tableInfo.purpose}`);
                    if (tableInfo.required) {
                        console.log(`        ⚠ REQUIRED for MVP`);
                        allRequiredExist = false;
                    }
                } else {
                    console.log(`  ${tableName.padEnd(20)} ⚠ ERROR - ${error.message}`);
                }
            } else {
                console.log(`  ${tableName.padEnd(20)} ✅ EXISTS - ${tableInfo.purpose}`);
            }
        } catch (err) {
            console.log(`  ${tableName.padEnd(20)} ❌ ERROR - ${err.message}`);
            if (tableInfo.required) allRequiredExist = false;
        }
    }
    
    console.log('\n' + '=' .repeat(50));
    
    if (allRequiredExist) {
        console.log('🎉 ALL REQUIRED MVP TABLES EXIST!');
    } else {
        console.log('⚠ SOME REQUIRED TABLES ARE MISSING');
        console.log('\n💡 RECOMMENDATIONS:');
        console.log('1. Check Supabase SQL Editor for schema');
        console.log('2. Run database migrations if needed');
        console.log('3. The app can still run with Supabase Auth (auth.users)');
    }
    
    // Check Supabase Auth tables (these are built-in)
    console.log('\n🔐 SUPABASE AUTH TABLES (built-in):');
    try {
        // Try to check auth.users indirectly via auth.getUser
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.log('  auth tables: ⚠ Auth error - ' + error.message);
        } else {
            console.log('  auth.users: ✅ EXISTS (Supabase Auth working)');
            if (user) {
                console.log(`  Current user: ${user.email} (${user.id.substring(0, 8)}...)`);
            }
        }
    } catch (err) {
        console.log('  auth tables: ❌ Error - ' + err.message);
    }
    
    return allRequiredExist;
}

require('dotenv').config({ path: '.env.local' });
checkMVPTables();
