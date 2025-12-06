import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';

export default function DebugML() {
  const [logs, setLogs] = useState(['Starting ML system debug...']);

  const addLog = (message) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    const debugML = async () => {
      try {
        // 1. Check database tables
        addLog('🔍 Checking database tables...');
        const tables = ['client_top_matches', 'trainer_profiles', 'profiles'];
        
        for (const table of tables) {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(5);
          
          if (error) {
            addLog(`❌ Table ${table}: ${error.message}`);
          } else {
            addLog(`✅ Table ${table}: Found ${data?.length || 0} records`);
            if (data && data.length > 0) {
              console.log(`${table} data:`, data);
            }
          }
        }

        // 2. Test embedding API
        addLog('🔤 Testing embedding API...');
        const embedRes = await fetch('/api/ml/embed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: 'Test user wants weight loss and strength training',
            type: 'user'
          })
        });
        const embedData = await embedRes.json();
        addLog(`✅ Embedding API: ${embedData.success ? 'Working' : 'Failed'}`);

        // 3. Test matching API
        addLog('🤖 Testing matching API...');
        const matchRes = await fetch('/api/ml/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 'debug-test' })
        });
        const matchData = await matchRes.json();
        addLog(`✅ Matching API: ${matchData.success ? 'Working' : 'Failed'}`);
        addLog(`📊 Matches found: ${matchData.matches?.length || 0}`);
        addLog(`⚡ Using ML: ${matchData.using_ml}`);

        // 4. Check if we need to add trainers
        if (matchData.matches?.length === 0) {
          addLog('⚠️ No trainers found. Adding sample trainers...');
          
          // Add minimal trainers
          const { error } = await supabase
            .from('client_top_matches')
            .insert([
              { first_name: 'Test', last_name: 'Trainer1' },
              { first_name: 'Test', last_name: 'Trainer2' }
            ]);
          
          if (error) {
            addLog(`❌ Failed to add trainers: ${error.message}`);
          } else {
            addLog('✅ Added test trainers to database');
            
            // Retry matching
            setTimeout(async () => {
              const retryRes = await fetch('/api/ml/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: 'debug-test' })
              });
              const retryData = await retryRes.json();
              addLog(`🔄 Retry matches: ${retryData.matches?.length || 0}`);
            }, 1000);
          }
        }

        addLog('🎉 Debug complete!');
        
      } catch (error) {
        addLog(`💥 Error: ${error.message}`);
      }
    };

    debugML();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">ML System Debug</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="font-mono text-sm space-y-2 max-h-96 overflow-y-auto p-4 bg-black rounded">
            {logs.map((log, index) => (
              <div key={index} className={log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-green-400' : 'text-gray-300'}>
                {log}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <button 
              onClick={() => window.location.href = '/matches'}
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded mb-2"
            >
              Test Matches Page
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded"
            >
              Refresh Debug
            </button>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Status</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${logs.some(l => l.includes('Embedding API: Working')) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Embedding Service</span>
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${logs.some(l => l.includes('Matching API: Working')) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Matching Service</span>
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${logs.some(l => l.includes('Found') && l.includes('records')) ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span>Database Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}