import ClientQuestionnaire from '@/components/Questionnaire/ClientQuestionnaire';

export default function QuestionnairePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <ClientQuestionnaire />
      </div>
    </div>
  );
}