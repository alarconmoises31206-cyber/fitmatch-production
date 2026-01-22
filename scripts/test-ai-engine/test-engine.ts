// scripts/test-ai-engine/test-engine.ts
import { AIMatchmakingEngine } from '../../infra/ai-matchmaking';
import { ClientProfile, TrainerProfile } from '../../infra/ai-matchmaking/types';

// Sample client profile
const sampleClient: ClientProfile = {
  id: 'client-test-123',
  user_id: 'user-client-123',
  goals: ['weight loss', 'muscle gain', 'improve endurance'],
  experience_level: 'intermediate',
  training_preference: 'strength training',
  weekly_time_availability: 'weekday evenings, weekend mornings',
  timezone: 'EST',
  communication_style: 'direct'
}

// Sample trainers with different tiers and specialties
const sampleTrainers: TrainerProfile[] = [
  {
    id: 'trainer-elite-1',
    user_id: 'user-trainer-elite-1',
    specialties: ['weight loss', 'strength training', 'nutrition', 'bodybuilding'],
    experience_years: 10,
    availability: 'weekday evenings, weekends',
    availability_schedule: 'flexible',
    timezone: 'EST',
    communication_style: 'direct',
    communication_tone: 'assertive',
    subscription_status: 'elite_verified'
  },
  {
    id: 'trainer-paid-1',
    user_id: 'user-trainer-paid-1',
    specialties: ['weight loss', 'cardio', 'yoga'],
    experience_years: 5,
    availability: 'weekday mornings, evenings',
    availability_schedule: 'structured',
    timezone: 'CST',
    communication_style: 'supportive',
    communication_tone: 'encouraging',
    subscription_status: 'paid'
  },
  {
    id: 'trainer-free-1',
    user_id: 'user-trainer-free-1',
    specialties: ['general fitness', 'beginner training'],
    experience_years: 2,
    availability: 'weekends only',
    availability_schedule: 'limited',
    timezone: 'PST',
    communication_style: 'casual',
    communication_tone: 'friendly',
    subscription_status: 'free'
  },
  {
    id: 'trainer-web-1',
    user_id: 'user-trainer-web-1',
    specialties: ['online coaching'],
    experience_years: 1,
    availability: 'flexible',
    availability_schedule: 'online',
    timezone: 'EST',
    communication_style: 'analytical',
    communication_tone: 'detailed',
    subscription_status: 'web'
  },
  {
    id: 'trainer-mismatch-1',
    user_id: 'user-trainer-mismatch-1',
    specialties: ['sports training', 'rehabilitation'],
    experience_years: 8,
    availability: 'weekday afternoons',
    availability_schedule: 'limited',
    timezone: 'GMT',
    communication_style: 'technical',
    communication_tone: 'professional',
    subscription_status: 'verified'
  }
];

// Main test function
async function testAIMatchmakingEngine() {
  console.log('🧪 Testing AI Matchmaking Engine...\n')
  
  // Initialize engine
  const engine = new AIMatchmakingEngine()
  
  console.log('📊 Engine Info:')
  console.log(engine.getEngineInfo())
  console.log('')
  
  // Test 1: Generate matches without token budget
  console.log('🔍 Test 1: Generate matches (no token budget)')
  const result1 = await engine.generateMatches(
    sampleClient,
    sampleTrainers,
    { clientId: sampleClient.id, limit: 3 }
  )
  
  console.log(`Generated ${result1.matches.length} matches:`)
  result1.matches.forEach((match, index) => {
    console.log(`\n${index + 1}. Trainer: ${match.trainerId}`)
    console.log(`   Score: ${match.score}/100, Confidence: ${Math.round(match.confidence * 100)}%`)
    console.log(`   Token Cost: ${match.tokenCostEstimate}`)
    console.log(`   Visibility: ${match.visibleDetails}`)
    console.log(`   Summary: ${match.rationale.split('\n')[0]}`)
  })
  
  // Test 2: Generate matches with token budget
  console.log('\n💰 Test 2: Generate matches with token budget (5 tokens)')
  const result2 = await engine.generateMatches(
    sampleClient,
    sampleTrainers,
    { clientId: sampleClient.id, tokenBudget: 5, limit: 10 }
  )
  
  console.log(`Generated ${result2.matches.length} matches within budget:`)
  const totalTokens = result2.matches.reduce((sum, match) => sum + match.tokenCostEstimate, 0)
  console.log(`Total token cost: ${totalTokens}`)
  console.log(`Tokens remaining: ${result2.tokensRemaining}`)
  
  // Test 3: Explain a specific match
  console.log('\n📝 Test 3: Get detailed explanation for top match')
  if (result1.matches.length > 0) {
    const topMatch = result1.matches[0];
    const trainer = sampleTrainers.find(t => t.id === topMatch.trainerId)
    if (trainer) {
      const explanation = engine.explainMatch(topMatch, trainer)
      console.log(`Trainer: ${trainer.subscription_status}`)
      console.log(`Summary: ${explanation.summary}`)
      console.log(`Tier: ${explanation.tierExplanation}`)
      console.log(`Token Cost: ${explanation.tokenCost}`)
    }
  }
  
  // Test 4: Validate contact permissions
  console.log('\n📞 Test 4: Validate contact permissions')
  const tierEnforcer = (engine as any).tierEnforcer;
  const clientUsage = {
    freeContactsUsed: 0,
    tokensAvailable: 10,
    weeklyMatches: 5,
    monthlyContacts: 10
  }
  
  sampleTrainers.forEach((trainer, index) => {
    const contactCheck = tierEnforcer.canContactTrainer(trainer, clientUsage)
    console.log(`${index + 1}. ${trainer.subscription_status}: ${contactCheck.allowed ? '✅ Can contact' : '❌ Cannot contact'} ${contactCheck.reason ? `(${contactCheck.reason})` : ''}`)
  })
  
  // Test 5: Batch processing simulation
  console.log('\n🚀 Test 5: Batch processing simulation')
  const clients = [sampleClient, { ...sampleClient, id: 'client-test-456' }];
  const requests = [
    { clientId: 'client-test-123', tokenBudget: 5, limit: 3 },
    { clientId: 'client-test-456', tokenBudget: 10, limit: 5 }
  ];
  
  try {
    const batchResults = await engine.batchGenerateMatches(clients, sampleTrainers, requests)
    console.log(`Processed ${batchResults.length} clients in batch`)
    batchResults.forEach((result, index) => {
      console.log(`  Client ${index + 1}: ${result.matches.length} matches`)
    })
  } catch (error) {
    console.log(`Batch processing error: ${error.message}`)
  }
  
  console.log('\n✅ AI Matchmaking Engine tests completed!')
  
  // Output recommendations for improvement
  console.log('\n📈 Recommendations:')
  console.log('1. Consider adding location data (latitude/longitude) for better matching')
  console.log('2. Add personality trait arrays to both client and trainer profiles')
  console.log('3. Implement caching for frequently requested matches')
  console.log('4. Add A/B testing for weight adjustments')
  console.log('5. Consider machine learning model for continuous improvement')
}

// Run the test
testAIMatchmakingEngine().catch(console.error)

// Export for use in other tests
export { testAIMatchmakingEngine }
