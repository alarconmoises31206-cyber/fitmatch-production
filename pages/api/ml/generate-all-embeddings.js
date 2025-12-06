import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Get all trainers
  const { data: trainers } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_trainer', true)
    .limit(5);

  console.log(`Found ${trainers?.length || 0} trainers to embed`);

  // Generate embeddings for each
  for (const trainer of trainers || []) {
    try {
      await fetch('http://localhost:3000/api/ml/embed/trainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainer_id: trainer.id,
          trainer_data: {
            bio: trainer.bio || 'Certified personal trainer',
            specialties: trainer.specialties || ['General Fitness'],
            experience_years: 3,
            headline: trainer.headline || `${trainer.first_name} ${trainer.last_name}`
          }
        })
      });
      console.log(`✅ Generated embedding for ${trainer.first_name}`);
    } catch (error) {
      console.log(`⚠️ Failed for ${trainer.first_name}:`, error.message);
    }
  }

  res.status(200).json({ 
    success: true, 
    message: `Generated embeddings for ${trainers?.length || 0} trainers` 
  });
}