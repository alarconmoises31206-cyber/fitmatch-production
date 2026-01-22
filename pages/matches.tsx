import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

// Mock data for trainers (for client view)
const mockTrainers = [
  { id: 'trainer1', name: 'Alexandra Chen', specialty: 'Olympic Weightlifting Coach', compatibility: 96 },
  { id: 'trainer2', name: 'Marcus Thompson', specialty: 'Functional Movement Specialist', compatibility: 94 },
  { id: 'trainer3', name: 'Isabella Rodriguez', specialty: 'Yoga & Mindfulness Therapist', compatibility: 92 },
  { id: 'trainer4', name: 'David Park', specialty: 'MMA & HIIT Conditioning Coach', compatibility: 91 },
  { id: 'trainer5', name: 'Sophia Williams', specialty: 'Prenatal & Postnatal Specialist', compatibility: 90 },
];

export default function MatchesPage() {
  const router = useRouter();
  const [matches] = useState(mockTrainers);

  const handleSendMessage = (trainer: any) => {
    // Save conversation to localStorage
    const conversations = JSON.parse(localStorage.getItem('fitmatch_conversations') || '[]');
    const conversationId = 'conv_' + Date.now() + '_' + trainer.id;
    const newConversation = {
      id: conversationId,
      otherPerson: {
        name: trainer.name,
        role: 'trainer',
        id: trainer.id,
        specialty: trainer.specialty
      },
      lastMessage: `Hi ${trainer.name.split(' ')[0]}! I saw your profile and would like to learn more about your training.`,
      timestamp: new Date().toISOString(),
      unread: false
    };
    
    conversations.push(newConversation);
    localStorage.setItem('fitmatch_conversations', JSON.stringify(conversations));
    
    // Navigate to the conversation
    router.push(`/messages/conversation?id=${conversationId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Your Trainer Matches</h1>
          <p className="mt-3 text-lg text-gray-600">
            Based on your questionnaire responses, we've found these compatible trainers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map(trainer => (
            <div key={trainer.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{trainer.name}</h3>
                    <p className="text-gray-600">{trainer.specialty}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{trainer.compatibility}%</div>
                    <div className="text-xs text-gray-500">Match Score</div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Compatibility</span>
                    <span className="text-sm font-medium text-gray-900">{trainer.compatibility}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${trainer.compatibility}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleSendMessage(trainer)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Message Trainer
                  </button>
                  <button
                    onClick={() => alert(`Schedule consultation with ${trainer.name}`)}
                    className="w-full bg-white border border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                  >
                    Schedule Consultation
                  </button>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-blue-600 text-sm font-medium">
                    Certified Trainer
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {matches.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🤝</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No matches yet</h3>
            <p className="text-gray-600 mb-6">
              Complete the questionnaire to get matched with compatible trainers
            </p>
            <Link
              href="/questionnaire"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Start Questionnaire
            </Link>
          </div>
        )}

        <div className="mt-10 p-6 bg-blue-50 rounded-xl border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How matching works</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>We analyze your fitness goals, preferences, and experience level</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Trainers are ranked based on compatibility with your profile</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Higher match scores indicate better alignment with your needs</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            <strong>System Evaluation Mode</strong> • This interface evaluates match recommendation algorithms. 
            Trainer tools, payment systems, and production workflows are out of scope.
          </p>
        </div>
      </main>
    </div>
  );
}

