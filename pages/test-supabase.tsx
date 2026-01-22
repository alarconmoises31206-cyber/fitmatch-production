import { useEffect, useState } from 'react';

export default function TestSupabaseSimple() {
  const [status, setStatus] = useState('Testing...');
  const [response, setResponse] = useState<any>(null);

  useEffect(() => {
    async function test() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jllzubbtdbwlnnbqrkdw.supabase.co';
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsbHp1YmJ0ZGJ3bG5uYnFya2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MjA0MzAsImV4cCI6MjA3OTk5NjQzMH0.fboTKkbTZ1pot0FAcT1EDC5uNLToGcHLEp8jrUM4RrM';
        
        setStatus(`Testing connection to: ${supabaseUrl}`);
        
        // Try a simple health check
        const healthUrl = `${supabaseUrl}/rest/v1/`;
        const response = await fetch(healthUrl, {
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`
          }
        });
        
        const responseText = await response.text();
        setResponse({
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries([...response.headers]),
          body: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : '')
        });
        
        if (response.ok) {
          setStatus('Supabase URL is accessible!');
        } else {
          setStatus(`Supabase returned error: ${response.status} ${response.statusText}`);
        }
        
      } catch (err: any) {
        setStatus(`Error: ${err.message}`);
        setResponse({ error: err.toString() });
      }
    }
    
    test();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
        <div className="mb-4">
          <h2 className="font-semibold mb-2">Status:</h2>
          <div className="p-3 bg-blue-50 rounded font-mono">{status}</div>
        </div>
        {response && (
          <div className="mb-4">
            <h2 className="font-semibold mb-2">Response:</h2>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
        <div className="text-sm text-gray-600 mt-4">
          <p className="font-semibold">Next steps if connection fails:</p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>Check if Supabase project "jllzubbtdbwlnnbqrkdw" exists</li>
            <li>Check if project is not suspended or deleted</li>
            <li>Verify the anon key is correct in Supabase dashboard</li>
            <li>Check if authentication is enabled in the project</li>
            <li>Try creating a new Supabase project and updating the URL/key</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
