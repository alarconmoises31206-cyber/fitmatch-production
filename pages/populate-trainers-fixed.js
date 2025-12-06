// File: /pages/quick-populate.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase/client';

export default function QuickPopulate() {
  const router = useRouter();

  useEffect(() => {
    const quickAdd = async () => {
      try {
        // Ultra simple insert - just first_name and last_name
        await supabase
          .from('client_top_matches')
          .insert([
            { first_name: 'Alex', last_name: 'Johnson' },
            { first_name: 'Sarah', last_name: 'Miller' }
          ]);
        
        console.log('✅ Added basic trainers');
        router.push('/matches');
      } catch (error) {
        console.log('Simple add failed, redirecting anyway...');
        router.push('/matches');
      }
    };

    quickAdd();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Adding trainers and redirecting to matches...</p>
      </div>
    </div>
  );
}