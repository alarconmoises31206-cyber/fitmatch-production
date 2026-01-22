import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ConversationPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [conversation, setConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [status, setStatus] = useState('Loading...');

  // Load conversation
  useEffect(() => {
    if (id) {
      loadConversation();
    }
  }, [id]);

  const loadConversation = () => {
    try {
      const conversations = JSON.parse(localStorage.getItem('fitmatch_conversations') || '[]');
      const found = conversations.find(c => c.id === id);
      
      if (found) {
        setConversation(found);
        setStatus(`Loaded ${found.messages?.length || 0} messages`);
      } else {
        setStatus('Conversation not found');
      }
    } catch (error) {
      setStatus('Error loading: ' + error.message);
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
      setStatus(`Message sent! Total: ${updatedConv.messages.length}`);
      
    } catch (error) {
      setStatus('Error sending: ' + error.message);
    }
  };

  // Debug: log conversation data
  useEffect(() => {
    if (conversation) {
      console.log('Current conversation:', conversation);
    }
  }, [conversation]);

  if (!conversation) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Conversation</h1>
        <p className="text-gray-600 mb-4">{status}</p>
        <p className="text-gray-600 mb-4">ID: {id}</p>
        <button onClick={loadConversation} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
          Reload
        </button>
        <Link href="/messages" className="text-blue-500">
          Back to Messages
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/messages" className="mr-4 text-blue-500">← Back</Link>
            <div>
              <h1 className="font-bold">{conversation.otherPerson.name}</h1>
              <p className="text-sm text-gray-600">{conversation.otherPerson.specialty || conversation.otherPerson.goals}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {status}
          </div>
        </div>
      </div>

      {/* Messages - ACTUALLY DISPLAYED NOW */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages && conversation.messages.length > 0 ? (
          conversation.messages.map((msg, index) => (
            <div 
              key={msg.id || index} 
              className={`max-w-xs md:max-w-md ${msg.sender === 'user' ? 'ml-auto' : ''}`}
            >
              <div className={`p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                {msg.content}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="bg-white border-t p-4">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 border rounded-l-lg px-4 py-2"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg disabled:opacity-50"
          >
            Send
          </button>
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <div>Press Enter to send</div>
          <div>Messages: {conversation.messages?.length || 0}</div>
        </div>
      </div>
    </div>
  );
}