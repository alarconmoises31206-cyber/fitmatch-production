import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';

export default function CheckAndFix() {
  const [logs, setLogs] = useState(['Starting database check...']);
  const [columns, setColumns] = useState([]);

  const addLog = (msg) => setLogs(prev => [...prev, msg]);

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        // 1. First, check what's in trainer_profiles
        addLog('🔍 Checking trainer_profiles structure...');
        
        const { data: sample, error } = await supabase
          .from('trainer_profiles')
          .select('*')
          .limit(1);
        
        if (error) {
          addLog(`❌ Error: ${error.message}`);
          return;
        }
        
        if (sample && sample.length > 0) {
          const firstRow = sample[0];
          const cols = Object.keys(firstRow);
          setColumns(cols);
          
          addLog(`✅ Found columns: ${cols.join(', ')}`);
          addLog(`📊 Found ${Object.keys(firstRow).length} columns in first row`);
          addLog('Sample data:', JSON.stringify(firstRow, null, 2));
        } else {
          addLog('📭 Table is empty, checking schema...');
          
          // Try to get schema info by attempting different inserts
          const testInserts = [
            { first_name: 'Test', last_name: 'Trainer' },
            { name: 'Test Trainer' },
            { trainer_name: 'Test Trainer' },
            { id: 999, some_field: 'test' }
          ];
          
          for (const test of testInserts) {
            const { error: insertError } = await supabase
              .from('trainer_profiles')
              .insert([test])
              .select();
            
            if (!insertError) {
              addLog(`✅ Successful insert with: ${Object.keys(test).join(', ')}`);
              break;
            }
          }
        }
        
      } catch (err) {
        addLog(`💥 Error: ${err.message}`);
      }
    };
    
    checkDatabase();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Database Check</h1>
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-3">Logs</h2>
          <div className="font-mono text-sm space-y-2 max-h-96 overflow-y-auto p-4 bg-gray-100 rounded">
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>
        
        {columns.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800">Columns Found:</h3>
            <ul className="mt-2 space-y-1">
              {columns.map(col => (
                <li key={col} className="text-green-700">• {col}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}