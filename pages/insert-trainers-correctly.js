import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';

export default function InsertTrainersCorrectly() {
  const [status, setStatus] = useState('Ready to insert trainers with correct schema...');

  useEffect(() => {
    const insertCorrectly = async () => {
      try {
        setStatus('Inserting trainers with correct column names...');
        
        const trainers = [
          {
            headline: 'Weight Loss & HIIT Specialist',
            bio: 'Certified personal trainer with 5 years experience helping clients achieve weight loss goals through HIIT and strength training.',
            specialties: ['Weight Loss', 'HIIT', 'Strength Training', 'Nutrition'],
            experience_years: 5,
            hourly_rate: 75.00
          },
          {
            headline: 'Yoga & Mindfulness Coach',
            bio: 'Yoga instructor focusing on mindfulness, flexibility, and holistic wellness practices for mental and physical health.',
            specialties: ['Yoga', 'Meditation', 'Flexibility', 'Mindfulness'],
            experience_years: 3,
            hourly_rate: 65.00
          },
          {
            headline: 'Strength & Bodybuilding Coach',
            bio: 'Strength coach specializing in competitive bodybuilding, powerlifting, and athletic performance enhancement.',
            specialties: ['Bodybuilding', 'Powerlifting', 'Strength Training', 'Competition Prep'],
            experience_years: 8,
            hourly_rate: 85.00
          }
        ];

        const { error } = await supabase
          .from('trainer_profiles')
          .insert(trainers);

        if (error) {
          setStatus(`❌ Insert failed: ${error.message}`);
        } else {
          setStatus(`✅ Successfully inserted ${trainers.length} trainers!`);
          
          // Generate embeddings
          setTimeout(async () => {
            setStatus('Generating ML embeddings...');
            for (const trainer of trainers) {
              const text = `${trainer.headline}. ${trainer.bio}. Specializes in: ${trainer.specialties.join(', ')}`;
              
              await fetch('/api/ml/embed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  text: text,
                  type: 'trainer'
                })
              });
            }
            
            setStatus('🎉 ML system ready! Redirecting to matches...');
            setTimeout(() => window.location.href = '/matches', 2000);
          }, 1000);
        }
        
      } catch (error) {
        setStatus(`💥 Error: ${error.message}`);
      }
    };

    insertCorrectly();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Insert Trainers Correctly</h1>
        <div className="p-4 bg-gray-100 rounded mb-4">
          <p className="font-mono text-sm">{status}</p>
        </div>
        <p className="text-sm text-gray-600">
          Using correct column names: headline, bio, specialties, experience_years, hourly_rate
        </p>
      </div>
    </div>
  );
}