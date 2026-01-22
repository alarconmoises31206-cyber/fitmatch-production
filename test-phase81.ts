// Simple test of Phase 81 instrumentation
import { userAgencyInstrumentation } from '../src/services/user-agency-instrumentation';

async function testPhase81() {
    console.log('🧪 Testing Phase 81 Instrumentation...');
    
    // Test logging some events
    try {
        await userAgencyInstrumentation.logSignalViewed('client', 'matches', 85);
        console.log('✅ signal_viewed event logged');
        
        await userAgencyInstrumentation.logSignalHidden('client', 'matches');
        console.log('✅ signal_hidden event logged');
        
        await userAgencyInstrumentation.logMessageSentWithSignalVisible('client', 'matches', 75);
        console.log('✅ message_sent_with_signal_visible event logged');
        
        console.log('🎯 Phase 81 instrumentation is working!');
        console.log('Session ID:', userAgencyInstrumentation.getSessionId());
        
    } catch (error) {
        console.error('❌ Error testing Phase 81:', error);
    }
}

testPhase81();
