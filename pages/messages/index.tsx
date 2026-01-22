import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('client');

  useEffect(() => {
    // Load conversations from localStorage
    const savedConversations = JSON.parse(localStorage.getItem('fitmatch_conversations') || '[]');
    setConversations(savedConversations);
    
    // Load role preference
    const savedRole = localStorage.getItem('userRole') || 'client';
    setRole(savedRole);
    
    setLoading(false);
  }, []);

  const filteredConversations = conversations.filter(conv => 
    role === 'client' ? conv.otherPerson?.role === 'trainer' : conv.otherPerson?.role === 'client'
  );

  const handleNewMessage = () => {
    console.log('handleNewMessage called. Role:', role);
    console.log('Current localStorage userRole:', localStorage.getItem('userRole'));
    
    if (role === 'client') {
      console.log('Navigating to /matches');
      router.push('/matches');
    } else {
      console.log('Navigating to /trainer/matches');
      router.push('/trainer/matches');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-12">
          <div className="text-lg">Loading messages...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-gray-900">
                  FitMatch
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/" className="border-transparent text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Home
                </Link>
                <Link href="/profile" className="border-transparent text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Profile
                </Link>
                <Link href="/messages" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Messages
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">View as:</span>
                <div className="flex border rounded overflow-hidden">
                  <button
                    className={`px-3 py-1 text-sm ${role === 'client' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                    onClick={() => {
                      setRole('client');
                      localStorage.setItem('userRole', 'client');
                    }}
                  >
                    Client
                  </button>
                  <button
                    className={`px-3 py-1 text-sm ${role === 'trainer' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
                    onClick={() => {
                      setRole('trainer');
                      localStorage.setItem('userRole', 'trainer');
                    }}
                  >
                    Trainer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="mt-2 text-gray-600">
              {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''} with your {role === 'client' ? 'trainers' : 'clients'}
            </p>
          </div>
          <button
            onClick={handleNewMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + New Message
          </button>
        </div>

        {filteredConversations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 text-5xl mb-4">💬</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-600 mb-6">
              {role === 'client' 
                ? 'Start a conversation with a trainer from your matches.' 
                : 'Start a conversation with a client from your matches.'}
            </p>
            <button
              onClick={handleNewMessage}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {role === 'client' ? 'Find Trainers' : 'Find Clients'}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y">
              {filteredConversations.map(conversation => (
                <div
                  key={conversation.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/messages/conversation?id=${conversation.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{conversation.otherPerson?.name || 'Unknown'}</h3>
                      <p className="text-gray-600 mt-1">{conversation.lastMessage || 'No messages yet'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">
                        {conversation.timestamp ? new Date(conversation.timestamp).toLocaleDateString() : 'Unknown date'}
                      </span>
                      <div className="mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          conversation.otherPerson?.role === 'trainer' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {conversation.otherPerson?.role === 'trainer' ? 'Trainer' : 'Client'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {conversation.unread && (
                    <div className="mt-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        New messages
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> Conversations are saved in your browser's localStorage. 
            {filteredConversations.length > 0 && ` You have ${filteredConversations.length} saved conversation${filteredConversations.length !== 1 ? 's' : ''}.`}
          </p>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            <strong>System Evaluation Mode</strong> • This interface evaluates match recommendation algorithms. 
            Trainer tools, payment systems, and production workflows are out of scope.
          </p>
        </div>
      </main>
    </div>
  );
}


