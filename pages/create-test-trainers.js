import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';

export default function CreateTestTrainers() {
  const [status, setStatus] = useState('Creating test trainer users...');

  useEffect(() => {
    const createTrainers = async () => {
      try {
        // Create 3 test trainer user accounts
        const trainers = [
          {
            email: 'trainer1@fitmatch.test',
            password: 'trainer123',
            name: 'Alex Johnson',
            headline: 'Weight Loss & HIIT Specialist'
          },
          {
            email: 'trainer2@fitmatch.test', 
            password: 'trainer123',
            name: 'Sarah Miller',
            headline: 'Yoga & Mindfulness Coach'
          },
          {
            email: 'trainer3@fitmatch.test',
            password: 'trainer123',
            name: 'Mike Davis',
            headline: 'Strength & Bodybuilding Coach'
          }
        ];

        let createdCount = 0;

        for (const trainer of trainers) {
          // 1. Create auth user
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: trainer.email,
            password: trainer.password,
            options: {
              data: {
                name: trainer.name,
                role: 'trainer'
              }
            }
          });

          if (authError && !authError.message.includes('already registered')) {
            console.log(`Auth error for ${trainer.email}:`, authError.message);
            continue;
          }

          if (authData?.user) {
            console.log(`✅ Created auth user: ${trainer.email}`);
            
            // 2. Wait a moment for user to be created
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 3. Create trainer profile
            const { error: profileError } = await supabase
              .from('trainer_profiles')
              .insert({
                id: authData.user.id,
                headline: trainer.headline,
                bio: `${trainer.name} is a professional trainer.`,
                specialties: ['Test Specialty'],
                experience_years: 3,
                hourly_rate: 65.00
              });

            if (profileError) {
              console.log(`Profile error: ${profileError.message}`);
            } else {
              createdCount++;
              console.log(`✅ Created trainer profile for ${trainer.name}`);
            }
          }
        }

        setStatus(`✅ Created ${createdCount} test trainers. Generating ML embeddings...`);
        
        // Generate embeddings
        setTimeout(() => {
          window.location.href = '/matches';
        }, 3000);

      } catch (error) {
        setStatus(`❌ Error: ${error.message}`);
      }
    };

    createTrainers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Create Test Trainers</h1>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
}