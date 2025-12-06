import TrainerProfileCard from '../components/TrainerProfileCard';

export default function TestTrainerCard() {
  const testTrainer = {
    id: '784349f3-67a4-420e-8f6f-8767e8e8f370',
    full_name: 'Alex Morgan',
    headline: 'Strength Coach • Hypertrophy Specialist',
    specialties: ['Strength', 'Hypertrophy', 'Sports Performance'],
    pricing_tier: 'premium' as const,
    years_experience: 8,
    compatibility_score: 88
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Testing Trainer Profile Card</h1>
      <div className="max-w-md">
        <TrainerProfileCard trainer={testTrainer} />
      </div>
    </div>
  );
}
