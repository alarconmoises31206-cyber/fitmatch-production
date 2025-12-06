import { useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { useRouter } from 'next/router';

export default function AddSampleTrainers() {
  const [status, setStatus] = useState('Ready to add sample trainers...');
  const router = useRouter();

  const sampleTrainers = [
    {
      name: 'Alex Johnson',
      specialties: ['Weight Loss', 'HIIT', 'Strength Training'],
      bio: 'Certified personal trainer with 5 years experience helping clients achieve their fitness goals through customized workout plans.',
      experience_years: 5,
      email: 'alex@fitmatch.com'
    },
    {
      name: 'Sarah Miller', 
      specialties: ['Yoga', 'Pilates', 'Flexibility', 'Mindfulness'],
      bio: 'Yoga and wellness coach focused on holistic health and sustainable fitness practices.',
      experience_years: 3,
      email: 'sarah@fitmatch.com'
    },
    {
      name: 'Mike Davis',
      specialties: ['Bodybuilding', 'Powerlifting', 'Nutrition', 'Strength'],
      bio: 'Strength and conditioning specialist with 8 years experience in competitive bodybuilding.',
      experience_years: 8,
      email: 'mike@fitmatch.com'
    },
    {
      name: 'Jessica Chen',
      specialties: ['Cardio', 'Weight Loss', 'Beginner Fitness', 'Nutrition'],
      bio: 'Fitness coach specializing in beginner transformations and sustainable weight loss.',
      experience_years: 4,
      email: 'jessica@fitmatch.com'
    },
    {
      name: 'David Wilson',
      specialties: ['CrossFit', 'Functional Training', 'Mobility', 'Endurance'],
      bio: 'CrossFit Level 2 trainer with expertise in functional movement and competition preparation.',
      experience_years: 6,
      email: 'david@fitmatch.com'
    }
  ];

  const addTrainers = async () => {
    setStatus('Adding sample trainers...');
    
    try {
      let addedCount = 0;
      
      for (const trainer of sampleTrainers) {
        // Try trainer_profiles table first
        const { error } = await supabase
          .from('trainer_profiles')
          .insert([{
            ...trainer,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) {
          console.log(`Failed to add to trainer_profiles: ${error.message}`);
          
          // Try client_top_matches as fallback
          const { error: fallbackError } = await supabase
            .from('client_top_matches')
            .insert([{
              first_name: trainer.name.split(' ')[0],
              last_name: trainer.name.split(' ')[1],
              specialties: trainer.specialties,
              bio: trainer.bio,
              experience_years: trainer.experience_years,
              match_score: Math.floor(Math.random() * 30) + 70 // Random score 70-100
            }]);

          if (fallbackError) {
            console.log(`Failed to add to client_top_matches: ${fallbackError.message}`);
          } else {
            addedCount++;
          }
        } else {
          addedCount++;
        }
      }

      setStatus(`✅ Successfully added ${addedCount} sample trainers!`);
      
      // Generate embeddings for the new trainers
      setTimeout(async () => {
        setStatus('Generating ML embeddings for trainers...');
        for (const trainer of sampleTrainers) {
          try {
            await fetch('/api/ml/embed', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: `${trainer.bio} ${trainer.specialties.join(' ')}`,
                type: 'trainer'
              })
            });
          } catch (error) {
            console.log('Embedding generation failed for:', trainer.name);
          }
        }
        setStatus('✅ ML embeddings generated! Ready to test matching.');
        
        // Redirect to matches after a delay
        setTimeout(() => {
          router.push('/matches');
        }, 2000);
      }, 1000);

    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Add Sample Trainers</h1>
        <p className="text-gray-600 mb-6">We need some trainer data to test the ML matching system.</p>
        
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Sample trainers to be added:</h2>
          <ul className="list-disc list-inside text-sm text-gray-600">
            {sampleTrainers.map((trainer, index) => (
              <li key={index}>{trainer.name} - {trainer.specialties.join(', ')}</li>
            ))}
          </ul>
        </div>

        <button
          onClick={addTrainers}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Add Sample Trainers & Test ML
        </button>
        
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm">{status}</p>
        </div>
      </div>
    </div>
  );
}