import { useRouter } from 'next/router';

export default function MessagesIndex() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-2xl text-white mb-4">Your Messages</h1>
      <p className="text-gray-400 mb-6">Go to matches to message trainers.</p>
      <button
        onClick={() => router.push('/matches')}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Go to Matches
      </button>
    </div>
  );
}
