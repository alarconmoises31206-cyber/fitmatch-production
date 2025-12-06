import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';

export default function MLBootstrap() {
  const [status, setStatus] = useState('Bootstrapping ML system...');

  useEffect(() => {
    const bootstrap = async () => {
      try {
        // 1. First, check client_top_matches
        setStatus('Checking for existing trainers...');
        const { data: existingTrainers } = await supabase
          .from('client_top_matches')
          .select('*')
          .limit(5);
        
        if (existingTrainers && existingTrainers.length > 0) {
          setStatus(`✅ Found ${existingTrainers.length} existing trainers. ML ready!`);
          setTimeout(() => window.location.href = '/matches', 2000);
          return;
        }

        // 2. No trainers found, need to create them
        setStatus('Creating trainer profiles...');
        
        // Try to insert into profiles table (which might feed the view)
        const trainers = [
          {
            first_name: 'Alex',
            last_name: 'Johnson',
            email: 'alex.trainer@fitmatch.com',
            role: 'trainer',
            headline: 'Weight Loss & HIIT Specialist',
            specialties: ['Weight Loss', 'HIIT', 'Strength Training'],
            bio: 'Certified personal trainer with 5+ years experience'
          },
          {
            first_name: 'Sarah',
            last_name: 'Miller',
            email: 'sarah.trainer@fitmatch.com',
            role: 'trainer',
            headline: 'Yoga & Mindfulness Coach',
            specialties: ['Yoga', 'Meditation', 'Flexibility'],
            bio: '500-hour certified yoga instructor'
          },
          {
            first_name: 'Mike',
            last_name: 'Davis',
            email: 'mike.trainer@fitmatch.com',
            role: 'trainer',
            headline: 'Strength & Conditioning Coach',
            specialties: ['Bodybuilding', 'Powerlifting', 'Nutrition'],
            bio: 'Strength coach for competitive athletes'
          }
        ];

        let createdCount = 0;
        
        for (const trainer of trainers) {
          // Try to insert into profiles table
          const { error } = await supabase
            .from('profiles')
            .insert([{
              first_name: trainer.first_name,
              last_name: trainer.last_name,
              email: trainer.email,
              role: 'trainer',
              created_at: new Date().toISOString()
            }]);
          
          if (!error) {
            createdCount++;
            console.log(`✅ Created trainer profile: ${trainer.first_name}`);
            
            // Generate ML embedding
            const text = `${trainer.first_name} ${trainer.last_name} - ${trainer.headline}. ${trainer.bio}. Specialties: ${trainer.specialties.join(', ')}`;
            
            await fetch('/api/ml/embed', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: text,
                type: 'trainer'
              })
            });
          }
        }

        setStatus(`✅ Created ${createdCount} trainer profiles. Generating user embedding...`);
        
        // Generate user embedding
        await fetch('/api/ml/embed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: 'User interested in weight loss, strength training, and overall fitness improvement',
            type: 'user',
            id: 'ml-user'
          })
        });

        setStatus('🎉 ML system bootstrapped! Redirecting...');
        setTimeout(() => window.location.href = '/matches', 3000);

      } catch (error) {
        setStatus(`❌ Error: ${error.message}`);
        // Redirect anyway after error
        setTimeout(() => window.location.href = '/matches', 3000);
      }
    };

    bootstrap();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse text-6xl mb-4">🤖</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ML System Bootstrap</h1>
        <p className="text-gray-600 mb-6">{status}</p>
        <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}