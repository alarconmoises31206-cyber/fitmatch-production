import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: React.ReactNode,
}

export default function Layout({ children }: LayoutProps) {
  const router: any = useRouter()
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                FitMatch
              </Link>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link
                  href="/"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    router.pathname === '/'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/matches"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    router.pathname === '/matches'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Find Trainers
                </Link>
                <Link
                  href="/trainer-dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    router.pathname === '/trainer-dashboard'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  For Trainers
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              {user ? (
                <button
                  onClick={signOut}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Sign Out
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/auth/login"
                    className={`text-sm font-medium ${
                      router.pathname === '/auth/login'
                        ? 'text-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Sign In
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link
                    href="/auth/register"
                    className={`text-sm font-medium ${
                      router.pathname === '/auth/register'
                        ? 'text-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Phase 74.9 - Global System Boundary Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              <span className="font-medium">System Evaluation Mode</span> •
              This interface evaluates match recommendation algorithms.
              Trainer tools, payment systems, and production workflows are out of scope.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Elements marked with [Demo], [Core], or [Future] indicate implementation status.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}


