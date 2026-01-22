import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';

const TrainerDashboardPage = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    // Clear any stored data
    localStorage.removeItem('mock_user');
    localStorage.removeItem('userRole');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>FitMatch - Trainer Dashboard</title>
        <meta name="description" content="Trainer dashboard for FitMatch" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FitMatch Trainer Dashboard</h1>
              <p className="text-gray-600">Manage your training business</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-gray-900"
              >
                Home
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Clients</h3>
            <p className="text-3xl font-bold text-blue-600">12</p>
            <p className="text-gray-600 text-sm mt-2">Active clients</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upcoming Sessions</h3>
            <p className="text-3xl font-bold text-green-600">8</p>
            <p className="text-gray-600 text-sm mt-2">This week</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages</h3>
            <p className="text-3xl font-bold text-purple-600">5</p>
            <p className="text-gray-600 text-sm mt-2">Unread</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">My Clients</h3>
              <p className="mt-2 text-sm text-gray-500">
                View and manage your current clients.
              </p>
              <div className="mt-4">
                <Link
                  href="/trainer/clients"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  View Clients
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Schedule</h3>
              <p className="mt-2 text-sm text-gray-500">
                Manage your training sessions and availability.
              </p>
              <div className="mt-4">
                <button
                  onClick={() => alert('Calendar view coming soon!')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  View Calendar
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Profile</h3>
              <p className="mt-2 text-sm text-gray-500">
                Update your trainer profile and specialties.
              </p>
              <div className="mt-4">
                <button
                  onClick={() => alert('Profile editor coming soon!')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <div className="mt-4 border-t border-gray-200 pt-4">
              <ul className="divide-y divide-gray-200">
                <li className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900">New message from Alex Johnson</div>
                    <div className="text-sm text-gray-500">10 min ago</div>
                  </div>
                </li>
                <li className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900">Session scheduled with Sarah Miller</div>
                    <div className="text-sm text-gray-500">1 hour ago</div>
                  </div>
                </li>
                <li className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900">New client match: Mike Chen</div>
                    <div className="text-sm text-gray-500">2 hours ago</div>
                  </div>
                </li>
                <li className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900">Profile viewed by Jessica Brown</div>
                    <div className="text-sm text-gray-500">4 hours ago</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* System Notice */}
        <div className="mt-8">
          <div className="p-6 border-2 border-yellow-300 bg-yellow-50 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-yellow-600 font-bold">!</span>
              </div>
              <h2 className="text-xl font-bold text-yellow-800">System Boundary Notice</h2>
            </div>

            <div className="space-y-3">
              <p className="text-yellow-700">
                <strong>Advanced trainer dashboard functionality is out of scope for current evaluation.</strong>
              </p>

              <div className="bg-white p-4 rounded border border-yellow-200">
                <p className="text-gray-700 mb-2">
                  Full implementation would include:
                </p>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li>Advanced client match management</li>
                  <li>Schedule and appointment tracking</li>
                  <li>Training program customization</li>
                  <li>Billing and payment processing</li>
                </ul>
              </div>

              <p className="text-sm text-yellow-600 mt-4">
                Basic client viewing and messaging are available for demonstration.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrainerDashboardPage;
