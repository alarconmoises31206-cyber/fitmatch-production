import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Test trainers with valid UUIDs
const testTrainers = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    headline: 'Alex Johnson - Certified Personal Trainer & Nutrition Coach',
    bio: 'Specialized in weight loss transformations and nutritional guidance. 5+ years experience helping clients achieve their fitness goals.',
    specialties: ['Weight Loss', 'HIIT', 'Nutrition', 'Cardio'],
    experience_years: 5,
    hourly_rate: 75,
    availability: { monday: true, wednesday: true, friday: true },
    certifications: ['NASM-CPT', 'Precision Nutrition L1']
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    headline: 'Sarah Miller - Yoga & Mindfulness Coach',
    bio: 'Helping clients find balance through yoga and mindfulness practices. Certified in Vinyasa, Hatha, and restorative yoga.',
    specialties: ['Yoga', 'Meditation', 'Flexibility', 'Mindfulness'],
    experience_years: 7,
    hourly_rate: 65,
    availability: { tuesday: true, thursday: true, saturday: true },
    certifications: ['RYT-500', 'Yoga Therapy Certified']
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    headline: 'Mike Rodriguez - Strength & Conditioning Coach',
    bio: 'Former athlete turned strength coach specializing in athletic performance, powerlifting, and bodybuilding.',
    specialties: ['Strength Training', 'Bodybuilding', 'Athletic Performance', 'Powerlifting'],
    experience_years: 8,
    hourly_rate: 85,
    availability: { monday: true, tuesday: true, thursday: true, friday: true },
    certifications: ['CSCS', 'NSCA-CPT', 'CPT']
  }
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🚀 Creating test trainers...');
    
    // Insert trainers with valid UUIDs
    const { error: insertError } = await supabase
      .from('trainer_profiles')
      .insert(testTrainers.map(trainer => ({
        ...trainer,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })));

    if (insertError) {
      console.error('Insert error:', insertError);
      return res.status(500).json({ 
        error: 'Failed to insert trainers', 
        details: insertError.message,
        hint: 'IDs must be valid UUIDs'
      });
    }

    console.log('✅ Test trainers created');
    
    // Generate embeddings
    console.log('🔄 Generating embeddings...');
    
    for (const trainer of testTrainers) {
      try {
        await fetch(`http://localhost:3000/api/ml/embed/trainer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trainer_id: trainer.id,
            trainer_data: {
              bio: trainer.bio,
              specialties: trainer.specialties,
              experience_years: trainer.experience_years,
              headline: trainer.headline
            }
          })
        });
        console.log(`✅ Embedding generated for ${trainer.headline.split(' - ')[0]}`);
      } catch (e) {
        console.log(`⚠️  Skipping embedding for ${trainer.id}:`, e.message);
      }
    }

    res.status(200).json({
      success: true,
      trainers_created: testTrainers.length,
      trainer_ids: testTrainers.map(t => t.id),
      note: 'Test trainers with valid UUIDs created for Phase 14'
    });

  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ error: 'Setup failed', details: error.message });
  }
}