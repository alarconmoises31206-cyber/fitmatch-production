import { useState } from 'react';

export default function TestML() {
  const [status, setStatus] = useState('Ready to test...');
  const [results, setResults] = useState(null);

  const testEmbedding = async () => {
    setStatus('Testing embedding service...');
    try {
      const response = await fetch('/api/ml/embed');
      const data = await response.json();
      setResults(data);
      setStatus('Embedding test successful!');
    } catch (error) {
      setStatus('Embedding test failed: ' + error.message);
    }
  };

  const testMatching = async () => {
    setStatus('Testing matching service...');
    try {
      const response = await fetch('/api/ml/match');
      const data = await response.json();
      setResults(data);
      setStatus('Matching test successful!');
    } catch (error) {
      setStatus('Matching test failed: ' + error.message);
    }
  };

  const testFullFlow = async () => {
    setStatus('Testing full ML flow...');
    try {
      // Test embedding
      const embedResponse = await fetch('/api/ml/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'I want to lose weight and build beginner cardio',
          type: 'user',
          id: '1'
        })
      });
      const embedData = await embedResponse.json();

      // Test matching
      const matchResponse = await fetch('/api/ml/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: '1' })
      });
      const matchData = await matchResponse.json();

      setResults({ embedding: embedData, matching: matchData });
      setStatus('Full ML flow test successful!');
    } catch (error) {
      setStatus('Full test failed: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">ML System Test</h1>
        
        <div className="space-y-4 mb-8">
          <button 
            onClick={testEmbedding}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Test Embedding Service
          </button>
          
          <button 
            onClick={testMatching}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-4"
          >
            Test Matching Service
          </button>
          
          <button 
            onClick={testFullFlow}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 ml-4"
          >
            Test Full ML Flow
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Status: {status}</h2>
          
          {results && (
            <div>
              <h3 className="font-semibold mb-2">Results:</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-8 bg-yellow-50 p-4 rounded border border-yellow-200">
          <h3 className="font-semibold text-yellow-800">Next Steps:</h3>
          <ol className="list-decimal list-inside mt-2 text-yellow-700">
            <li>Test each service individually using the buttons above</li>
            <li>Visit your matches page to see ML in action</li>
            <li>Check browser console for any errors</li>
          </ol>
        </div>
      </div>
    </div>
  );
}