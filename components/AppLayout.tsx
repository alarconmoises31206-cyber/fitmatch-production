import React from 'react';
// /components/AppLayout.tsx
import React, { ReactNode } from 'react';
import { HeaderSpinCounter } from './index';

interface AppLayoutProps {
  children: ReactNode;
  showHeader?: boolean,
}

export default function AppLayout({ children, showHeader = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {showHeader && (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Logo */}
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-blue-600">FitMatch</div>
                <div className="hidden md:block text-sm text-gray-500">Premium Fitness Matching</div>
              </div>

              {/* Right: Navigation */}
              <div className="flex items-center gap-4">
                <HeaderSpinCounter />
                
                <nav className="hidden md:flex items-center gap-6">
                  <a href="/matches" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                    Matches
                  </a>
                  <a href="/trainer/dashboard" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                    For Trainers
                  </a>
                  <a href="/pricing" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                    Pricing
                  </a>
                </nav>

                {/* Profile */}
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                  U
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>

      {/* Simple Footer */}
      <footer className="border-t border-gray-200 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} FitMatch. Connect with top fitness trainers.</p>
        </div>
      </footer>
    </div>
  )
}