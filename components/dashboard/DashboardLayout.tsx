import { ReactNode } from 'react';
import Link from 'next/link';

export default function DashboardLayout({ children, role }: any) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/" className="text-xl font-bold text-blue-600">FitMatch</Link>
          <div className="flex gap-4">
            <Link href="/dashboard/client" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
            <Link href="/matches" className="text-gray-700 hover:text-blue-600">Matches</Link>
            <Link href="/messages" className="text-gray-700 hover:text-blue-600">Messages</Link>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-4">{children}</main>
    </div>
  );
}