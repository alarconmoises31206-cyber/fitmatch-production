import { useEffect, useState } from 'react';

export default function TestMLNow() {
  const [status, setStatus] = useState('Testing ML system...');

  useEffect(() => {
    const testML = async () => {
      try {
        // Test embedding
        const embedRes = await fetch('/api/ml/embed');
        const embedData = await embedRes.json();
        console.log('✅ Embedding:', embedData);

        // Test matching
        const matchRes = await fetch('/api/ml/match', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({user_id: 'test'})
        });
        const matchData = await matchRes.json();
        console.log('✅ Matching:', matchData);

        setStatus('ML System Working! Check console for details.');
      } catch (error) {
        setStatus(`Error: ${error.message}`);
      }
    };

    testML();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">ML System Test</h1>
        <p>{status}</p>
      </div>
    </div>
  );
}