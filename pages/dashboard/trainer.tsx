import DashboardLayout from '../../components/dashboard/DashboardLayout';
import TrainerDashboardMain from '../../components/dashboard/TrainerDashboardMain';

export default function TrainerDashboard() {
  return (
    <DashboardLayout role="trainer">
      <TrainerDashboardMain />
    </DashboardLayout>
  );
}