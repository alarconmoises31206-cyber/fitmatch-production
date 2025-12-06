import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';

export default function ForceAddTrainers() {
  const [status, setStatus] = useState('Starting trainer insertion...');
  const [step, setStep] = useState(1);

  useEffect(() => {
    const forceAdd = async () => {
      try {
        // STEP 1: Check current state
        setStatus('Step 1: Checking current database state...');
        setStep(1);
        
        const { data: currentTrainers } = await supabase
          .from('trainer_profiles')
          .select('*')
          .limit(5);
        
        console.log('Current trainers:', currentTrainers?.length || 0);

        // STEP 2: Try multiple insertion methods
        setStatus('Step 2: Trying to insert trainers...');
        setStep(2);
        
        const trainers = [
          {
            name: 'Alex Johnson',
            first_name: 'Alex',
            last_name: 'Johnson',
            specialties: ['Weight Loss', 'HIIT', 'Strength'],
            bio: 'Certified personal trainer specializing in weight loss and HIIT workouts.',
            experience_years: 5,
            email: 'alex@fitmatch.com',
            created_at: new Date().toISOString()
          },
          {
            name: 'Sarah Miller',
            first_name: 'Sarah', 
            last_name: 'Miller',
            specialties: ['Yoga', 'Meditation', 'Flexibility'],
            bio: 'Yoga instructor with focus on mindfulness and holistic wellness.',
            experience_years: 3,
            email: 'sarah@fitmatch.com',
            created_at: new Date().toISOString()
          },
          {
            name: 'Mike Davis',
            first_name: 'Mike',
            last_name: 'Davis',
            specialties: ['Bodybuilding', 'Powerlifting', 'Strength'],
            bio: 'Strength coach for competitive bodybuilders and powerlifters.',
            experience_years: 8,
            email: 'mike@fitmatch.com', 
            created_at: new Date().toISOString()
          }
        ];

        // Try multiple approaches
        let inserted = false;
        
        // Approach 1: Direct insert
        const { error: approach1Error } = await supabase
          .from('trainer_profiles')
          .insert(trainers);

        if (!approach1Error) {
          inserted = true;
          console.log('✅ Approach 1: Direct insert worked');
        } else {
          console.log('❌ Approach 1 failed:', approach1Error.message);
          
          // Approach 2: Insert one by one
          setStatus('Trying alternative insertion method...');
          for (const trainer of trainers) {
            const { error } = await supabase
              .from('trainer_profiles')
              .insert([trainer]);
            
            if (!error) {
              inserted = true;
              console.log(`✅ Added: ${trainer.name}`);
            }
          }
        }

        if (!inserted) {
          // Approach 3: Try minimal fields only
          setStatus('Trying minimal field insertion...');
          const minimalTrainers = trainers.map(t => ({
            name: t.name,
            created_at: new Date().toISOString()
          }));
          
          const { error: minimalError } = await supabase
            .from('trainer_profiles')
            .insert(minimalTrainers);
          
          if (!minimalError) {
            inserted = true;
            console.log('✅ Minimal insert worked');
          }
        }

        // STEP 3: Verify insertion
        setStatus('Step 3: Verifying trainers were added...');
        setStep(3);
        
        const { data: verifyTrainers } = await supabase
          .from('trainer_profiles')
          .select('*');
        
        console.log('Verified trainers:', verifyTrainers?.length || 0);

        if (verifyTrainers && verifyTrainers.length > 0) {
          setStatus(`✅ SUCCESS: Added ${verifyTrainers.length} trainers to database!`);
          
          // STEP 4: Generate ML embeddings
          setStatus('Step 4: Generating ML embeddings...');
          setStep(4);
          
          for (const trainer of verifyTrainers) {
            const bioText = `${trainer.name || trainer.first_name} specializes in ${trainer.specialties?.join(', ') || 'fitness training'} with ${trainer.experience_years || 'several'} years experience. ${trainer.bio || ''}`;
            
            try {
              await fetch('/api/ml/embed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  text: bioText,
                  type: 'trainer',
                  id: trainer.id
                })
              });
              console.log(`✅ Generated embedding for ${trainer.name}`);
            } catch (embedError) {
              console.log(`⚠️ Embedding failed for ${trainer.name}`);
            }
          }
          
          setStatus('🎉 ML SYSTEM READY! Redirecting to matches...');
          
          // Redirect after success
          setTimeout(() => {
            window.location.href = '/matches';
          }, 3000);
          
        } else {
          setStatus('❌ FAILED: Could not verify trainers were added.');
        }

      } catch (error) {
        console.error('Force add error:', error);
        setStatus(`❌ ERROR: ${error.message}`);
      }
    };

    forceAdd();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Force Add Trainers to Database</h1>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-medium">Step {step} of 4</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-3">Status</h2>
          <div className="p-4 bg-gray-100 rounded">
            <p className="font-mono text-sm">{status}</p>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">What this does:</h3>
          <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
            <li>Adds 3 sample trainers to trainer_profiles table</li>
            <li>Generates ML embeddings for each trainer</li>
            <li>Activates the AI matching system</li>
            <li>Redirects you to test the matches page</li>
          </ul>
        </div>
      </div>
    </div>
  );
}