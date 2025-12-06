import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase/client';

export default function ForceMLActivation() {
  const router = useRouter();

  useEffect(() => {
    const activateML = async () => {
      console.log('🚀 Activating ML system...');
      
      try {
        // 1. Ensure trainers exist
        const { data: trainers } = await supabase
          .from('client_top_matches')
          .select('*')
          .limit(5);

        console.log('🔍 Found trainers:', trainers?.length || 0);

        // 2. Generate embeddings for each trainer
        if (trainers && trainers.length > 0) {
          for (const trainer of trainers) {
            const bioText = `${trainer.first_name || ''} ${trainer.last_name || ''} is a fitness trainer.`;
            
            await fetch('/api/ml/embed', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: bioText,
                type: 'trainer',
                id: trainer.id || trainer.trainer_id
              })
            });
          }
          console.log('✅ Generated ML embeddings');
        }

        // 3. Generate user embedding
        await fetch('/api/ml/embed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: 'I want to lose weight and build muscle with cardio and strength training',
            type: 'user',
            id: 'ml-test-user'
          })
        });

        console.log('✅ Generated user embedding');
        console.log('🎉 ML system activated! Redirecting to matches...');

        // 4. Redirect to matches
        setTimeout(() => {
          router.push('/matches');
        }, 1000);

      } catch (error) {
        console.error('Activation failed:', error);
        router.push('/matches');
      }
    };

    activateML();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Activating ML matching system...</p>
        <p className="text-sm text-purple-600 mt-2">Generating AI embeddings</p>
      </div>
    </div>
  );
}