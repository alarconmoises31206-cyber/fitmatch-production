import { useRouter } from 'next/router';

export default function MessagePage() {
  const router = useRouter();
  const { trainerId } = router.query;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button 
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white mb-4"
          >
            ← Back to Matches
          </button>
          <h1 className="text-3xl font-bold text-white">
            Messaging Trainer {trainerId}
          </h1>
          <p className="text-gray-400 mt-2">
            This is a test message page. 1 spin was deducted from your account.
          </p>
        </div>
        
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-6">💬</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Messaging System
            </h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              This would be a real messaging interface. For Phase 16 testing, 
              we're verifying that spin deduction works when accessing this page.
            </p>
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <div className="text-sm text-gray-400">Spin Transaction</div>
              <div className="font-medium text-white">
                ✅ 1 spin deducted for messaging trainer {trainerId}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Check the billing_events table in your database
              </div>
            </div>
            <button
              onClick={() => router.push("/matches")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700"
            >
              Return to Matches
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}