import { useState } from 'react';

export default function TestMLFinal() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const testML = async () => {
    setLoading(true);
    try {
      // Test the ML endpoint
      const response = await fetch('/api/ml/match', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: 'final-test'})
      });
      
      const data = await response.json();
      setResults(data);
      
      console.log('ML Test Results:', data);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Final ML System Test</h1>
        
        <button
          onClick={testML}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test ML System'}
        </button>
        
        {results && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-3">Results:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Success:</span>
                <span className={results.success ? 'text-green-600 font-bold' : 'text-red-600'}>{results.success ? '✅ Yes' : '❌ No'}</span>
              </div>
              <div className="flex justify-between">
                <span>Using ML:</span>
                <span className={results.using_ml ? 'text-green-600 font-bold' : 'text-red-600'}>{results.using_ml ? '✅ Yes' : '❌ No'}</span>
              </div>
              <div className="flex justify-between">
                <span>Matches Found:</span>
                <span className="font-bold">{results.matches?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Data Source:</span>
                <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">{results.data_source}</span>
              </div>
              <div className="flex justify-between">
                <span>Note:</span>
                <span className="text-blue-600">{results.note}</span>
              </div>
            </div>
            
            {results.using_ml && (
              <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded border border-green-200">
                <p className="text-green-700 font-semibold">🎉 PHASE 14 COMPLETE!</p>
                <p className="text-green-600 text-sm">ML matching system is working!</p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6">
          <a 
            href="/matches"
            className="block text-center bg-blue-100 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-200"
          >
            Go to Matches Page
          </a>
        </div>
      </div>
    </div>
  );
}