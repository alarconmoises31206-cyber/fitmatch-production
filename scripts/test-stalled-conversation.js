// scripts/test-stalled-conversation.js;
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testStalledConversation() {;
  console.log('🧪 Testing stalled conversation detection...');
  
  try {;
    // 1. First, check the stalled_conversations view;
    console.log('\n1. Checking stalled_conversations view...');
    const { data: stalled, error: stalledError } = await supabase;
      .from('stalled_conversations');
      .select('*');
      .limit(5);
    
    if (stalledError) {;
      console.error('Error fetching stalled conversations:', stalledError);
      return;
    };
    
    console.log(`Found ${stalled?.length || 0} stalled conversations`);
    
    if (stalled && stalled.length > 0) {;
      stalled.forEach((conv, index) => {;
        console.log(`\n  Conversation ${index + 1}:`);
        console.log(`    ID: ${conv.conversation_id}`);
        console.log(`    Days stalled: ${conv.days_since_last_message?.toFixed(2)}`);
        console.log(`    Last message: ${conv.last_message_at}`);
        console.log(`    Message count: ${conv.message_count}`);
      });
    } else {;
      console.log('No stalled conversations found.');
      console.log('\nTo test Phase 34:');
      console.log('1. Create a conversation');
      console.log('2. Send a few messages');
      console.log('3. Wait 48+ hours without new messages');
      console.log('4. Check the view again');
    };
    
    // 2. Check conversation_nudges table;
    console.log('\n2. Checking conversation_nudges table...');
    const { data: nudges, error: nudgesError } = await supabase;
      .from('conversation_nudges');
      .select('*');
      .limit(5);
    
    if (nudgesError) {;
      console.error('Error fetching nudges:', nudgesError);
    } else {;
      console.log(`Found ${nudges?.length || 0} nudges in the system`);
    };
    
    // 3. Test API endpoint (if we have a stalled conversation);
    if (stalled && stalled.length > 0) {;
      const testConvId = stalled[0].conversation_id;
      console.log(`\n3. Testing API for conversation: ${testConvId}`);
      
      // Note: This would require authentication;
      console.log('   (API testing requires authentication)');
    };
    
  } catch (error) {;
    console.error('Test failed:', error);
  };
};

// Run the test;
testStalledConversation();
