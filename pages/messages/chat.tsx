import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ChatPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [conversation, setConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [status, setStatus] = useState('Loading conversation...');

  // Load conversation when id is available
  useEffect(() => {
    if (id) {
      console.log("Loading chat for ID:", id);
      loadConversation();
    }
  }, [id]);

  const loadConversation = () => {
    try {
      const conversations = JSON.parse(localStorage.getItem('fitmatch_conversations') || '[]');
      const found = conversations.find(c => c.id === id);
      
      if (found) {
        setConversation(found);
        setStatus(`Chat with ${found.otherPerson.name} • ${found.messages?.length || 0} messages`);
        console.log("Loaded conversation:", found);
      } else {
        setStatus('Chat not found. Try sending a new message.');
      }
    } catch (error) {
      setStatus('Error: ' + error.message);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !conversation) return;

    try {
      const conversations = JSON.parse(localStorage.getItem('fitmatch_conversations') || '[]');
      
      const updatedConversations = conversations.map(c => {
        if (c.id === id) {
          const messages = c.messages || [];
          return {
            ...c,
            lastMessage: newMessage,
            timestamp: new Date().toISOString(),
            messages: [
              ...messages,
              {
                id: 'msg_' + Date.now(),
                sender: 'user',
                content: newMessage,
                timestamp: new Date().toISOString()
              }
            ]
          };
        }
        return c;
      });

      localStorage.setItem('fitmatch_conversations', JSON.stringify(updatedConversations));
      
      const updatedConv = updatedConversations.find(c => c.id === id);
      setConversation(updatedConv);
      setNewMessage('');
      setStatus(`Message sent! • ${updatedConv.messages.length} total messages`);
      
    } catch (error) {
      setStatus('Send error: ' + error.message);
    }
  };

  if (!id) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">No chat selected</h1>
        <Link href="/messages" className="text-blue-500">Back to Messages</Link>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Chat</h1>
        <p className="text-gray-600 mt-2">{status}</p>
        <p className="text-gray-600 mt-1">Chat ID: {id}</p>
        <div className="mt-4 space-x-2">
          <button onClick={loadConversation} className="bg-blue-500 text-white px-4 py-2 rounded">
            Reload Chat
          </button>
          <Link href="/messages" className="text-blue-500">
            Back to Messages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/messages" className="mr-4 text-blue-500 hover:text-blue-700">
              ←
            </Link>
            <div>
              <h1 className="font-bold text-lg">{conversation.otherPerson.name}</h1>
              <p className="text-sm text-gray-600">{conversation.otherPerson.specialty || conversation.otherPerson.goals}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {conversation.messages?.length || 0} messages
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {status}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages && conversation.messages.length > 0 ? (
          conversation.messages.map((msg, index) => (
            <div 
              key={msg.id || index} 
              className={`max-w-xs md:max-w-md ${msg.sender === 'user' ? 'ml-auto' : ''}`}
            >
              <div className={`p-3 rounded-xl ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                <p>{msg.content}</p>
              </div>
              <div className={`text-xs text-gray-500 mt-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-12">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-lg">No messages yet</p>
            <p className="text-sm">Start the conversation with {conversation.otherPerson.name}</p>
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="bg-white border-t shadow-lg p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={`Message ${conversation.otherPerson.name}...`}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <div className="mt-3 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            Press Enter to send • Messages saved to browser
          </p>
          <button
            onClick={loadConversation}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            ↻ Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
