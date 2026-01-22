import Link from 'next/link';

export default function TrainerClientsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/trainer-dashboard" className="text-xl font-bold text-gray-900">
                FitMatch Trainer
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/trainer-dashboard" className="text-gray-700 hover:text-gray-900">Dashboard</Link>
              <Link href="/trainer/clients" className="text-blue-600 font-medium">Clients</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">My Clients</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <div className="text-gray-400 text-5xl mb-4">👥</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">View your matched clients</h3>
            <p className="text-gray-600 mb-6">
              Go to the matches page to see clients who match with you
            </p>
            <Link
              href="/matches"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Matches
            </Link>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> The trainer client management interface is in development.
            Trainers will be able to view and manage their matched clients here.
          </p>
        </div>
      </main>
    </div>
  );
}
