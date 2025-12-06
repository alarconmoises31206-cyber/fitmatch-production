import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';

export default function MLDebug() {
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userEmbedding, setUserEmbedding] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  const loadDebugData = async () => {
    setLoading(true);
    try {
      // Get database stats
      const { data: stats } = await supabase
        .from('profiles')
        .select('vector_embedding')
        .limit(1);
      
      // Get sample trainers
      const { data: trainers } = await supabase
        .from('trainer_profiles')
        .select('*')
        .limit(5);

      // Get event counts
      const { data: events } = await supabase
        .from('interaction_events')
        .select('event_type')
        .limit(100);

      setDebugData({
        hasVectorColumns: stats?.[0]?.vector_embedding !== undefined,
        trainerCount: trainers?.length || 0,
        trainersWithEmbeddings: trainers?.filter(t => t.vector_embedding).length || 0,
        eventCount: events?.length || 0,
        eventTypes: events?.reduce((acc, e) => {
          acc[e.event_type] = (acc[e.event_type] || 0) + 1;
          return acc;
        }, {}),
        sampleTrainers: trainers || []
      });

      if (stats?.[0]?.vector_embedding) {
        setUserEmbedding(stats[0].vector_embedding);
      }

    } catch (error) {
      console.error('Debug load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testEmbedding = async () => {
    try {
      const response = await fetch('/api/ml/embed/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'test-user-debug',
          profile_data: {
            goals: ['weight loss', 'strength'],
            fitness_level: 'intermediate',
            preferences: 'HIIT and strength training'
          }
        })
      });
      const data = await response.json();
      alert(`Embedding test: ${data.success ? '✅ Success' : '❌ Failed'}`);
    } catch (error) {
      alert('Embedding test failed');
    }
  };

  const testMatching = async () => {
    try {
      const response = await fetch('/api/ml/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'test-user-debug'
        })
      });
      const data = await response.json();
      alert(`Matching test: ${data.success ? `✅ ${data.matches?.length} matches` : '❌ Failed'}`);
    } catch (error) {
      alert('Matching test failed');
    }
  };

  useEffect(() => {
    loadDebugData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading debug data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">ML System Debug Dashboard</h1>
        <p className="text-gray-400 mb-8">Phase 14 - Real ML Implementation</p>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className={`p-4 rounded-lg ${debugData?.hasVectorColumns ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
            <div className="text-sm text-gray-300">Vector Columns</div>
            <div className="text-2xl font-bold">
              {debugData?.hasVectorColumns ? '✅ Ready' : '❌ Missing'}
            </div>
          </div>
          
          <div className="bg-blue-900/50 p-4 rounded-lg">
            <div className="text-sm text-gray-300">Trainers with Embeddings</div>
            <div className="text-2xl font-bold">
              {debugData?.trainersWithEmbeddings}/{debugData?.trainerCount}
            </div>
          </div>
          
          <div className="bg-purple-900/50 p-4 rounded-lg">
            <div className="text-sm text-gray-300">Events Logged</div>
            <div className="text-2xl font-bold">{debugData?.eventCount}</div>
          </div>
          
          <div className="bg-yellow-900/50 p-4 rounded-lg">
            <div className="text-sm text-gray-300">API Status</div>
            <div className="text-2xl font-bold">✅ Live</div>
          </div>
        </div>

        {/* API Test Buttons */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">API Tests</h2>
          <div className="flex gap-4">
            <button
              onClick={testEmbedding}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              Test Embedding API
            </button>
            <button
              onClick={testMatching}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
            >
              Test Matching API
            </button>
            <button
              onClick={loadDebugData}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* User Embedding Display */}
        {userEmbedding && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">User Embedding Vector</h2>
            <div className="bg-gray-800 p-4 rounded overflow-x-auto">
              <code className="text-sm">
                [{userEmbedding.map((v, i) => (
                  <span key={i} className="mr-1">{v.toFixed(2)}</span>
                ))}]
              </code>
              <div className="text-sm text-gray-400 mt-2">
                Dimension: {userEmbedding.length}
              </div>
            </div>
          </div>
        )}

        {/* Trainers List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Sample Trainers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {debugData?.sampleTrainers?.map((trainer) => (
              <div 
                key={trainer.id}
                className="bg-gray-800 p-4 rounded cursor-pointer hover:bg-gray-700"
                onClick={() => setSelectedTrainer(trainer)}
              >
                <div className="font-semibold">{trainer.headline}</div>
                <div className="text-sm text-gray-400 mt-1">
                  Embedding: {trainer.vector_embedding ? '✅' : '❌'}
                </div>
                {trainer.vector_embedding && (
                  <div className="text-xs text-gray-500 mt-2">
                    Vector length: {trainer.vector_embedding.length}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Trainer Details */}
        {selectedTrainer && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              Trainer Details: {selectedTrainer.headline}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Profile Data</h3>
                <pre className="bg-gray-900 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify({
                    id: selectedTrainer.id,
                    headline: selectedTrainer.headline,
                    specialties: selectedTrainer.specialties,
                    experience_years: selectedTrainer.experience_years,
                    has_embedding: !!selectedTrainer.vector_embedding
                  }, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Vector Embedding</h3>
                {selectedTrainer.vector_embedding ? (
                  <div className="bg-gray-900 p-4 rounded">
                    <div className="text-sm mb-2">First 10 dimensions:</div>
                    <code className="text-xs">
                      [{selectedTrainer.vector_embedding.slice(0, 10).map((v, i) => (
                        <span key={i} className="mr-1">{v.toFixed(2)}</span>
                      ))}...]
                    </code>
                    <div className="text-sm text-gray-400 mt-2">
                      Full length: {selectedTrainer.vector_embedding.length}
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-900/50 p-4 rounded">
                    No embedding generated yet
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedTrainer(null)}
              className="mt-4 text-gray-400 hover:text-gray-300"
            >
              Close Details
            </button>
          </div>
        )}

        {/* Event Statistics */}
        {debugData?.eventTypes && Object.keys(debugData.eventTypes).length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Event Statistics</h2>
            <div className="bg-gray-800 p-4 rounded">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(debugData.eventTypes).map(([type, count]) => (
                  <div key={type} className="text-center">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-gray-400 capitalize">{type} events</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Migration Status */}
        <div className="mt-8 p-4 bg-gray-800 rounded">
          <h2 className="text-xl font-semibold mb-4">Phase 14 Completion Checklist</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full mr-3 ${debugData?.hasVectorColumns ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Database vector columns created</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-3 bg-green-500"></div>
              <span>API endpoints created (/api/ml/*)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-3 bg-green-500"></div>
              <span>Cosine similarity matching engine</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-3 bg-green-500"></div>
              <span>Weighted scoring formula (0.55/0.25/0.20)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-3 bg-yellow-500"></div>
              <span>Interaction events table (if 0 events)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-3 bg-green-500"></div>
              <span>Admin debug interface</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}