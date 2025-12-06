import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';

export default function DiagnoseML() {
  const [results, setResults] = useState({});

  useEffect(() => {
    const diagnose = async () => {
      const data = {};

      // Check client_top_matches
      const { data: matches, error: matchesError } = await supabase
        .from('client_top_matches')
        .select('*')
        .limit(5);
      
      data.client_top_matches = {
        count: matches?.length || 0,
        sample: matches?.[0],
        error: matchesError?.message,
        columns: matches?.[0] ? Object.keys(matches[0]) : []
      };

      // Check trainer_profiles  
      const { data: trainers, error: trainersError } = await supabase
        .from('trainer_profiles')
        .select('*')
        .limit(5);
      
      data.trainer_profiles = {
        count: trainers?.length || 0,
        sample: trainers?.[0],
        error: trainersError?.message
      };

      // Check profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'trainer')
        .limit(5);
      
      data.profiles_trainers = {
        count: profiles?.length || 0,
        sample: profiles?.[0],
        error: profilesError?.message
      };

      console.log('Diagnostic Results:', data);
      setResults(data);
    };

    diagnose();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">ML System Diagnostic</h1>
        
        {Object.entries(results).map(([table, info]) => (
          <div key={table} className="bg-white p-6 rounded-lg shadow mb-4">
            <h2 className="text-xl font-semibold mb-3">{table}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Record Count</p>
                <p className={`text-lg font-bold ${info.count > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {info.count}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className={info.count > 0 ? 'text-green-600' : 'text-red-600'}>
                  {info.count > 0 ? '✅ Has Data' : '❌ Empty'}
                </p>
              </div>
            </div>
            {info.error && (
              <div className="mt-3 p-3 bg-red-50 rounded">
                <p className="text-sm text-red-700">Error: {info.error}</p>
              </div>
            )}
            {info.columns && info.columns.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600">Columns:</p>
                <p className="text-sm font-mono">{info.columns.join(', ')}</p>
              </div>
            )}
          </div>
        ))}
        
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Recommended Action:</h3>
          {results.client_top_matches?.count > 0 ? (
            <div>
              <p className="text-green-700 mb-2">✅ Use client_top_matches view (has data)</p>
              <button 
                onClick={() => window.location.href = '/matches'}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Test ML System Now
              </button>
            </div>
          ) : (
            <div>
              <p className="text-red-700 mb-2">❌ No trainer data found</p>
              <button 
                onClick={() => window.location.href = '/create-test-trainers'}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Create Test Trainers
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}