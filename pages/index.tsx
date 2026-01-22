import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>FitMatch - Find Your Perfect Fitness Trainer Match</title>
        <meta name="description" content="Find certified fitness trainers using our intelligent matching algorithm" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Welcome to FitMatch
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Find your perfect fitness trainer match using our intelligent algorithm.
          </p>
        </div>

        {/* Main content cards */}
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Find Trainers</h3>
              <p className="mt-2 text-sm text-gray-500">
                Complete our questionnaire to get matched with certified fitness trainers.
              </p>
              <div className="mt-4">
                <Link
                  href="/questionnaire"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Start Questionnaire
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">For Trainers</h3>
              <p className="mt-2 text-sm text-gray-500">
                Access the trainer dashboard to manage your profile and clients.
              </p>
              <div className="mt-4">
                <Link
                  href="/trainer-dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Trainer Dashboard
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">How It Works</h3>
              <ul className="mt-2 text-sm text-gray-500 list-disc pl-5 space-y-1">
                <li>Complete our matching questionnaire</li>
                <li>Get paired with compatible trainers</li>
                <li>Schedule introductory sessions</li>
                <li>Begin your fitness journey</li>
              </ul>
            </div>
          </div>
        </div>

        {/* System notice */}
        <div className="mt-12">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>System Evaluation Mode</strong> • This interface evaluates match recommendation algorithms. Trainer tools, payment systems, and production workflows are out of scope.
                  <br />
                  Elements marked with [Demo], [Core], or [Future] indicate implementation status.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home
