import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';

export default function DebugTrainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkData() {
      console.log('🔍 Checking database for trainers...');
      
      // Check different table names
      const tables = ['trainer_profiles', 'client_top_matches', 'profiles'];
      
      for (let table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(5);
        
        console.log(`📊 ${table}:`, { data, error });
        
        if (data && data.length > 0) {
          setTrainers(data);
          break;
        }
      }
      
      setLoading(false);
    }

    checkData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Checking database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Database Debug</h1>
        
        {trainers.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">No trainers found!</h2>
            <p className="text-yellow-700">We need to add some trainer data to test the ML system.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Found {trainers.length} trainers</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(trainers, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Quick Fix Options:</h3>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.href = '/add-sample-trainers'}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add Sample Trainers
            </button>
            <button 
              onClick={() => window.location.href = '/matches'}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 ml-4"
            >
              Check Matches Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}