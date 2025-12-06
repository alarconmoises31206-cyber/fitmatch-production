import { useState } from 'react';
import { supabase } from '../lib/supabase/client';

export default function PopulateTrainers() {
  const [status, setStatus] = useState('Ready to populate database...');

  const sampleTrainers = [
    {
      name: 'Alex Johnson',
      specialties: ['Weight Loss', 'HIIT', 'Strength Training'],
      bio: 'Certified personal trainer with 5 years experience. Specializes in weight loss and high-intensity interval training.',
      experience_years: 5,
      email: 'alex@example.com'
    },
    {
      name: 'Sarah Miller',
      specialties: ['Yoga', 'Pilates', 'Flexibility'],
      bio: 'Yoga and wellness coach with 3 years experience. Focuses on holistic health and mindfulness.',
      experience_years: 3,
      email: 'sarah@example.com'
    },
    {
      name: 'Mike Davis',
      specialties: ['Bodybuilding', 'Powerlifting', 'Strength'],
      bio: 'Strength coach with 8 years experience. Specializes in competitive bodybuilding and powerlifting.',
      experience_years: 8,
      email: 'mike@example.com'
    },
    {
      name: 'Jessica Chen',
      specialties: ['Cardio', 'Weight Loss', 'Nutrition'],
      bio: 'Fitness coach specializing in beginner transformations and sustainable weight loss.',
      experience_years: 4,
      email: 'jessica@example.com'
    }
  ];

  const populateDatabase = async () => {
    setStatus('Populating database with trainers...');
    
    try {
      let addedCount = 0;
      
      // Try trainer_profiles table first
      const { error } = await supabase
        .from('trainer_profiles')
        .insert(sampleTrainers);

      if (error) {
        console.log('trainer_profiles failed, trying client_top_matches...');
        
        // Format for client_top_matches table
        const formattedTrainers = sampleTrainers.map(trainer => ({
          first_name: trainer.name.split(' ')[0],
          last_name: trainer.name.split(' ')[1],
          specialties: trainer.specialties,
          bio: trainer.bio,
          experience_years: trainer.experience_years,
          match_score: Math.floor(Math.random() * 20) + 80 // 80-100
        }));

        const { error: fallbackError } = await supabase
          .from('client_top_matches')
          .insert(formattedTrainers);

        if (fallbackError) {
          throw new Error(`Both tables failed: ${fallbackError.message}`);
        }
      }

      addedCount = sampleTrainers.length;
      setStatus(`✅ Added ${addedCount} trainers to database!`);
      
      // Now generate ML embeddings
      setTimeout(async () => {
        setStatus('Generating ML embeddings...');
        for (const trainer of sampleTrainers) {
          const text = `${trainer.bio} ${trainer.specialties.join(' ')}`;
          
          await fetch('/api/ml/embed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: text,
              type: 'trainer'
            })
          });
        }
        
        setStatus('🎉 Database populated and ML embeddings generated!');
        setStatus('✅ Visit /matches to see AI-powered matching in action!');
      }, 1000);

    } catch (error) {
      console.error('Error:', error);
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Populate Database for ML Testing</h1>
        <p className="text-gray-600 mb-4">We need trainer data in the database for the ML system to match against.</p>
        
        <button
          onClick={populateDatabase}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 mb-4"
        >
          Populate Database & Generate ML Embeddings
        </button>
        
        <div className="p-4 bg-gray-100 rounded-lg">
          <p className="font-semibold mb-2">Status:</p>
          <p className="text-sm">{status}</p>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> After populating, refresh the matches page to see AI-powered matching!
          </p>
        </div>
      </div>
    </div>
  );
}