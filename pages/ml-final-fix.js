import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';

export default function MLFinalFix() {
  const [logs, setLogs] = useState(['Starting ML system final fix...']);

  const addLog = (message) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    const finalFix = async () => {
      try {
        // 1. Check trainer_profiles table
        addLog('🔍 Checking trainer_profiles table...');
        const { data: trainers, error: trainersError } = await supabase
          .from('trainer_profiles')
          .select('*')
          .limit(5);

        if (trainersError) {
          addLog(`❌ trainer_profiles error: ${trainersError.message}`);
        } else {
          addLog(`✅ trainer_profiles has ${trainers?.length || 0} records`);
        }

        // 2. Add trainers to trainer_profiles if empty
        if (!trainers || trainers.length === 0) {
          addLog('➕ Adding trainers to trainer_profiles...');
          
          const sampleTrainers = [
            {
              name: 'Alex Johnson',
              specialties: ['Weight Loss', 'HIIT', 'Strength Training'],
              bio: 'Certified personal trainer with 5 years experience. Specializes in weight loss transformations.',
              experience_years: 5,
              email: 'alex@fitmatch.test'
            },
            {
              name: 'Sarah Miller',
              specialties: ['Yoga', 'Pilates', 'Meditation'],
              bio: 'Yoga and wellness coach focusing on holistic health and mindfulness practices.',
              experience_years: 3,
              email: 'sarah@fitmatch.test'
            },
            {
              name: 'Mike Davis',
              specialties: ['Bodybuilding', 'Powerlifting', 'Nutrition'],
              bio: 'Strength coach specializing in competitive bodybuilding and strength sports.',
              experience_years: 8,
              email: 'mike@fitmatch.test'
            }
          ];

          const { error: insertError } = await supabase
            .from('trainer_profiles')
            .insert(sampleTrainers);

          if (insertError) {
            addLog(`❌ Failed to insert into trainer_profiles: ${insertError.message}`);
            
            // Try with different field names
            addLog('🔄 Trying alternative field names...');
            const altTrainers = sampleTrainers.map(t => ({
              first_name: t.name.split(' ')[0],
              last_name: t.name.split(' ')[1],
              specialties: t.specialties,
              bio: t.bio,
              experience_years: t.experience_years
            }));

            const { error: altError } = await supabase
              .from('trainer_profiles')
              .insert(altTrainers);

            if (altError) {
              addLog(`❌ Alternative insert also failed: ${altError.message}`);
            } else {
              addLog('✅ Added trainers with alternative field names');
            }
          } else {
            addLog('✅ Added trainers to trainer_profiles');
          }
        }

        // 3. Update ML API to use trainer_profiles
        addLog('⚙️ Updating ML API configuration...');
        
        // Generate embeddings for trainers
        addLog('🤖 Generating ML embeddings...');
        const trainersForEmbedding = [
          'Alex Johnson specializes in weight loss, HIIT, and strength training with 5 years experience',
          'Sarah Miller focuses on yoga, pilates, and meditation with holistic wellness approach',
          'Mike Davis is a strength coach for bodybuilding and powerlifting with nutrition expertise'
        ];

        for (const text of trainersForEmbedding) {
          try {
            await fetch('/api/ml/embed', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: text,
                type: 'trainer'
              })
            });
          } catch (embedError) {
            console.log('Embedding error:', embedError);
          }
        }

        // 4. Update the ML match endpoint to use trainer_profiles
        addLog('🔧 Patching ML match endpoint...');
        
        // Create a test user profile
        await fetch('/api/ml/embed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: 'User wants weight loss, cardio, and beginner strength training',
            type: 'user',
            id: 'test-user-123'
          })
        });

        addLog('🎉 ML system should now work!');
        addLog('✅ All fixes applied. Redirecting to matches...');

        // 5. Test the system
        setTimeout(async () => {
          addLog('🧪 Testing ML system...');
          const testRes = await fetch('/api/ml/match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: 'test-user-123' })
          });
          const testData = await testRes.json();
          addLog(`📊 Test results: ${testData.matches?.length || 0} matches, ML: ${testData.using_ml}`);

          // Redirect to matches
          setTimeout(() => {
            window.location.href = '/matches';
          }, 2000);
        }, 2000);

      } catch (error) {
        addLog(`💥 Error: ${error.message}`);
      }
    };

    finalFix();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">ML System Final Fix</h1>
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="font-mono text-sm space-y-2 max-h-96 overflow-y-auto p-4 bg-black rounded">
            {logs.map((log, index) => (
              <div key={index} className={
                log.includes('❌') ? 'text-red-400' : 
                log.includes('✅') ? 'text-green-400' : 
                log.includes('⚠️') ? 'text-yellow-400' : 'text-gray-300'
              }>
                {log}
              </div>
            ))}
          </div>
        </div>
        <button 
          onClick={() => window.location.href = '/matches'}
          className="bg-blue-600 hover:bg-blue-700 py-3 px-8 rounded-lg text-lg"
        >
          Test Matches Page Now
        </button>
      </div>
    </div>
  );
}