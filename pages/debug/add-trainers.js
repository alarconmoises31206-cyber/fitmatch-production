import { useState } from 'react';
import { supabase } from '../../lib/supabase/client';

export default function AddTrainers() {
  const [status, setStatus] = useState('Ready to add trainers...');

  const trainers = [
    {
      name: 'ML Test Trainer 1',
      specialties: ['Weight Loss', 'HIIT', 'Cardio'],
      bio: 'Specialized in high-intensity interval training and weight loss programs for busy professionals.',
      experience_years: 4
    },
    {
      name: 'ML Test Trainer 2', 
      specialties: ['Strength Training', 'Bodybuilding', 'Nutrition'],
      bio: 'Focus on strength development and muscle building with scientific nutrition guidance.',
      experience_years: 6
    },
    {
      name: 'ML Test Trainer 3',
      specialties: ['Yoga', 'Meditation', 'Flexibility'],
      bio: 'Holistic approach to fitness combining physical postures with mindfulness practices.',
      experience_years: 3
    }
  ];

  const addToDatabase = async () => {
    setStatus('Adding trainers to database...');
    
    try {
      // Try multiple table names
      const tables = ['trainer_profiles', 'client_top_matches'];
      let successCount = 0;
      
      for (const table of tables) {
        for (const trainer of trainers) {
          const { error } = await supabase
            .from(table)
            .insert([{
              name: trainer.name,
              specialties: trainer.specialties,
              bio: trainer.bio,
              experience_years: trainer.experience_years,
              created_at: new Date().toISOString()
            }]);

          if (!error) {
            successCount++;
            console.log(`Added to ${table}: ${trainer.name}`);
          }
        }
      }

      setStatus(`Added ${successCount} trainer entries to database!`);
      
      // Generate ML embeddings
      setTimeout(async () => {
        setStatus('Generating ML embeddings...');
        for (const trainer of trainers) {
          await fetch('/api/ml/embed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: `${trainer.bio} ${trainer.specialties.join(' ')}`,
              type: 'trainer',
              id: trainer.name.replace(/\s+/g, '-').toLowerCase()
            })
          });
        }
        setStatus('ML embeddings generated! Visit /matches to test AI matching.');
      }, 1000);

    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Add ML Test Trainers</h1>
        <button 
          onClick={addToDatabase}
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 mb-4"
        >
          Add Trainers & Generate ML Embeddings
        </button>
        <div className="p-3 bg-gray-100 rounded">
          <p className="text-sm">{status}</p>
        </div>
      </div>
    </div>
  );
}