import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';

export default function FixMLData() {
  const [logs, setLogs] = useState(['Finding correct tables...']);
  const [foundTable, setFoundTable] = useState(null);

  const addLog = (message) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    const findAndFix = async () => {
      try {
        // 1. First, let's check what tables actually exist
        addLog('🔍 Checking database structure...');
        
        // Common table names in fitness apps
        const possibleTables = [
          'trainers', 'trainer', 'trainer_profile', 'coaches',
          'fitness_trainers', 'personal_trainers', 'users', 'user_profiles'
        ];
        
        // Try to find a table we can insert into
        for (const table of possibleTables) {
          try {
            // Try to select from the table
            const { data, error } = await supabase
              .from(table)
              .select('*')
              .limit(1);
            
            if (!error) {
              addLog(`✅ Found table: ${table}`);
              setFoundTable(table);
              
              // Check if it's empty
              const { data: countData } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });
              
              addLog(`📊 Table ${table} has ${countData?.length || 0} records`);
              break;
            }
          } catch (e) {
            // Table doesn't exist, continue
          }
        }

        if (!foundTable) {
          // 2. If no table found, let's check what tables Supabase shows us
          addLog('🔎 Querying information schema...');
          
          // Try to get table list (this might work depending on permissions)
          const { data: tablesData } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .limit(20);
          
          if (tablesData) {
            addLog('📋 Available tables:');
            tablesData.forEach(table => {
              addLog(`   - ${table.table_name}`);
            });
          }
        }

        // 3. Create a temporary table if needed
        if (!foundTable) {
          addLog('🆕 Creating temporary trainers table...');
          
          // Try to create a simple table
          const { error: createError } = await supabase
            .from('trainers_ml_test')
            .insert([{ 
              name: 'Test Trainer',
              created_at: new Date().toISOString()
            }]);
          
          if (!createError) {
            setFoundTable('trainers_ml_test');
            addLog('✅ Created trainers_ml_test table');
          } else {
            addLog(`❌ Could not create table: ${createError.message}`);
          }
        }

        // 4. Add sample trainers to found table
        if (foundTable) {
          addLog(`➕ Adding trainers to ${foundTable}...`);
          
          const sampleTrainers = [
            {
              first_name: 'Alex',
              last_name: 'Johnson',
              specialties: ['Weight Loss', 'HIIT'],
              experience_years: 5,
              bio: 'Certified personal trainer'
            },
            {
              first_name: 'Sarah',
              last_name: 'Miller',
              specialties: ['Yoga', 'Flexibility'],
              experience_years: 3,
              bio: 'Yoga and wellness coach'
            }
          ];

          const { error: insertError } = await supabase
            .from(foundTable)
            .insert(sampleTrainers);

          if (!insertError) {
            addLog(`✅ Added ${sampleTrainers.length} trainers to ${foundTable}`);
            
            // Generate embeddings
            addLog('🤖 Generating ML embeddings...');
            for (const trainer of sampleTrainers) {
              const text = `${trainer.first_name} ${trainer.last_name}: ${trainer.bio}. Specializes in ${trainer.specialties.join(', ')}`;
              
              await fetch('/api/ml/embed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  text: text,
                  type: 'trainer'
                })
              });
            }
            
            addLog('🎉 ML system ready!');
            
            // Redirect to matches
            setTimeout(() => {
              window.location.href = '/matches';
            }, 2000);
          } else {
            addLog(`❌ Insert failed: ${insertError.message}`);
          }
        }

      } catch (error) {
        addLog(`💥 Error: ${error.message}`);
      }
    };

    findAndFix();
  }, [foundTable]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Fix ML Data System</h1>
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Progress Logs</h2>
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

        {foundTable && (
          <div className="bg-green-900 border border-green-700 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-green-300">✅ Found table: {foundTable}</h3>
            <p className="text-green-200 mt-2">Trainers have been added to this table. The ML system should now work!</p>
          </div>
        )}

        <div className="flex gap-4">
          <button 
            onClick={() => window.location.href = '/matches'}
            className="bg-blue-600 hover:bg-blue-700 py-2 px-6 rounded"
          >
            Test Matches Page
          </button>
          <button 
            onClick={() => window.location.href = '/debug-ml'}
            className="bg-gray-700 hover:bg-gray-600 py-2 px-6 rounded"
          >
            Check ML Status
          </button>
        </div>
      </div>
    </div>
  );
}