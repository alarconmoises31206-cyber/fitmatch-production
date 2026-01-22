import { ReactNode } from 'react';

export default function DashboardContent({ children, role }: any) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="text-sm text-gray-500">
            {role === 'client' ? 'Client Dashboard' : 'Trainer Dashboard'}
          </div>
        </div>
      </div>
      <main className="max-w-7xl mx-auto p-4">{children}</main>
    </div>
  )
}
