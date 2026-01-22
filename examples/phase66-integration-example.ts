// examples/phase66-integration-example.ts
// Example of how to integrate Phase 66 AI endpoints into existing code

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Example 1: Profile save with AI interpretation
async function saveClientProfileWithAI(userId: string, profileData: any, questionnaireData?: any) {
  // Save profile first (primary action)
  const { error: saveError } = await supabase
    .from('client_profiles')
    .upsert({
      user_id: userId,
      ...profileData,
      updated_at: new Date().toISOString()
    });
  
  if (saveError) {
    throw new Error(`Failed to save profile: ${saveError.message}`);
  }
  
  // Then, optionally generate AI interpretation (non-blocking)
  try {
    const aiResponse = await fetch('/api/ai/interpret-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile_type: 'client',
        profile_data: profileData,
        questionnaire_data: questionnaireData,
        user_id: userId
      })
    });
    
    if (aiResponse.ok) {
      console.log('AI interpretation generated successfully');
      // AI data is stored automatically by the endpoint
    } else {
      console.warn('AI interpretation failed, profile saved successfully');
      // System continues to function without AI
    }
  } catch (aiError) {
    console.warn('AI service unavailable, profile saved successfully');
    // Graceful degradation - system works without AI
  }
  
  return { success: true, message: 'Profile saved' };
}

// Example 2: Match display with AI explanation
async function displayMatchWithExplanation(clientId: string, trainerId: string, matchScore: number) {
  // Get deterministic match factors (from your existing matching engine)
  const matchFactors = {
    tag_overlap: ['hypertrophy', 'nutrition'], // From your matching logic
    experience_match: true, // From your matching logic
    price_compatible: true, // From your matching logic
    availability_aligned: true, // From your matching logic
    deterministic_score: matchScore // From your matching logic
  };
  
  // Display match immediately (primary action)
  const matchDisplay = {
    trainerId,
    matchScore,
    factors: matchFactors
  };
  
  // Then, optionally add AI explanation
  try {
    const explanationResponse = await fetch('/api/ai/explain-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        trainer_id: trainerId,
        match_factors: matchFactors
      })
    });
    
    if (explanationResponse.ok) {
      const { explanation } = await explanationResponse.json();
      return {
        ...matchDisplay,
        ai_explanation: explanation,
        disclaimer: 'AI explanation for informational purposes only'
      };
    }
  } catch (error) {
    // AI explanation failed, but match is still displayed
    console.warn('AI explanation unavailable, match displayed normally');
  }
  
  return matchDisplay;
}

// Example 3: Questionnaire with optional AI assistance
async function submitQuestionnaireWithAssist(role: 'client' | 'trainer', answers: Record<string, any>) {
  // Primary action: Save questionnaire
  const { error: saveError } = await supabase
    .from(`${role}_questionnaires`)
    .upsert({
      ...answers,
      submitted_at: new Date().toISOString()
    });
  
  if (saveError) {
    throw new Error(`Failed to save questionnaire: ${saveError.message}`);
  }
  
  // Optional: Get AI suggestions before submission (for UX improvement)
  try {
    const assistResponse = await fetch('/api/ai/assist-questionnaire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role,
        current_answers: answers
      })
    });
    
    if (assistResponse.ok) {
      const { suggestions } = await assistResponse.json();
      return {
        success: true,
        saved: true,
        ai_suggestions: suggestions,
        note: 'AI suggestions are optional. You control all inputs.'
      };
    }
  } catch (error) {
    // AI assistance failed, but questionnaire is still saved
    console.warn('AI assistance unavailable, questionnaire saved successfully');
  }
  
  return { success: true, saved: true };
}

// Example 4: Founder tool for system explanation
async function explainSystemToFounder(question: string, context?: any) {
  // This is only for founder/administrator use
  try {
    const response = await fetch('/api/ai/explain-system', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Founder-Token': process.env.ADMIN_SECRET_TOKEN || 'demo-token'
      },
      body: JSON.stringify({
        question,
        context
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.explanation;
    }
  } catch (error) {
    console.error('System explanation unavailable:', error);
  }
  
  return {
    explanation: 'System explanation temporarily unavailable.',
    note: 'FitMatch functions mechanically without AI.'
  };
}

// Example usage patterns
async function demonstrateIntegration() {
  console.log('Phase 66 Integration Examples\n');
  
  // Pattern 1: Primary action first, AI optional second
  console.log('1. Profile save pattern:');
  console.log('   - Save profile (required)');
  console.log('   - Generate AI interpretation (optional)');
  console.log('   - System works if AI fails\n');
  
  // Pattern 2: Display deterministic data, explain with AI
  console.log('2. Match display pattern:');
  console.log('   - Calculate match score (deterministic)');
  console.log('   - Display match (required)');
  console.log('   - Add AI explanation (optional)\n');
  
  // Pattern 3: User control with AI assistance
  console.log('3. Questionnaire pattern:');
  console.log('   - User fills answers (required)');
  console.log('   - AI suggests improvements (optional)');
  console.log('   - User approves all changes (required)\n');
  
  // Pattern 4: Founder transparency tool
  console.log('4. Founder tool pattern:');
  console.log('   - Authenticated access only');
  console.log('   - Explains existing mechanics only');
  console.log('   - No predictions or recommendations\n');
  
  console.log('Key Architecture Principles:');
  console.log('✓ AI is always optional');
  console.log('✓ Primary actions succeed without AI');
  console.log('✓ AI interprets, never decides');
  console.log('✓ Clear boundaries prevent authority creep');
}

// Export for use in other files
export {
  saveClientProfileWithAI,
  displayMatchWithExplanation,
  submitQuestionnaireWithAssist,
  explainSystemToFounder,
  demonstrateIntegration
};
