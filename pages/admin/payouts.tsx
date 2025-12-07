import { PayoutDashboard } from '@/components/admin/PayoutDashboard';

interface AdminPayoutsPageProps {
  adminToken: string;
}

export default function AdminPayoutsPage({ adminToken }: AdminPayoutsPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <PayoutDashboard adminToken={adminToken} />
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  // Pass the admin token from environment to the frontend
  // SECURITY NOTE: In production, this should be more secure
  // For now, we're passing it for testing
  return {
    props: {
      adminToken: process.env.ADMIN_SECRET_TOKEN || '',
    },
  };
}
