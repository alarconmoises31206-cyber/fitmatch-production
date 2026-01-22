import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function TrainerMatchesPage() {
  const router = useRouter();
  
  // Mock data for clients (for trainer view)
  const mockClients = [
    { id: 'client1', name: 'Alex Johnson', goals: 'Weight loss & strength', compatibility: 92 },
    { id: 'client2', name: 'Sarah Miller', goals: 'Marathon training', compatibility: 88 },
    { id: 'client3', name: 'Mike Chen', goals: 'Rehabilitation', compatibility: 85 },
    { id: 'client4', name: 'Jessica Brown', goals: 'Yoga & flexibility', compatibility: 82 },
    { id: 'client5', name: 'David Wilson', goals: 'Bodybuilding', compatibility: 79 },
  ];

  const handleSendMessage = (client: any) => {
    // Save conversation to localStorage
    const conversations = JSON.parse(localStorage.getItem('fitmatch_conversations') || '[]');
    const conversationId = 'conv_' + Date.now() + '_' + client.id;
    const newConversation = {
      id: conversationId,
      otherPerson: {
        name: client.name,
        role: 'client',
        id: client.id,
        goals: client.goals
      },
      lastMessage: `Hi ${client.name.split(' ')[0]}! I'd like to discuss your fitness goals.`,
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
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/trainer-dashboard" className="text-xl font-bold text-gray-900">
                  FitMatch Trainer
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/trainer-dashboard" className="border-transparent text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/trainer/matches" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Matches
                </Link>
                <Link href="/messages" className="border-transparent text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Messages
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Your Client Matches</h1>
          <p className="mt-3 text-lg text-gray-600">
            Clients who match well with your training style and expertise
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockClients.map(client => (
            <div key={client.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{client.name}</h3>
                    <p className="text-gray-600">{client.goals}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{client.compatibility}%</div>
                    <div className="text-xs text-gray-500">Match Score</div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Compatibility</span>
                    <span className="text-sm font-medium text-gray-900">{client.compatibility}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${client.compatibility}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleSendMessage(client)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Message Client
                  </button>
                  <button
                    onClick={() => alert(`Schedule consultation with ${client.name}`)}
                    className="w-full bg-white border border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                  >
                    Schedule Consultation
                  </button>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-blue-600 text-sm font-medium">
                    Potential Client
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {mockClients.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🤝</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No client matches yet</h3>
            <p className="text-gray-600 mb-6">
              Clients will appear here as they complete their questionnaires and match with your profile
            </p>
          </div>
        )}

        <div className="mt-10 p-6 bg-blue-50 rounded-xl border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How client matching works</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Clients complete questionnaires about their fitness goals and preferences</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Our algorithm matches them with trainers based on compatibility</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Higher compatibility scores indicate better alignment with your expertise</span>
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
