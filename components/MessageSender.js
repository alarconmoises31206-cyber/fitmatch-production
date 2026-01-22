import React, { useState } from 'react';
import { supabase } from '../lib/supabase'; // Adjust import path as needed

const MessageSender = ({ consultationId, currentUserId }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      setSending(true);
      setError('');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          consultation_id: consultationId,
          message_content: message 
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Clear message input on success
      setMessage('');
      
      // Trigger any callback or refresh messages list
      if (window.onMessageSent) {
        window.onMessageSent(data.data);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const beginPaidConsultation = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/messages/begin-paid', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ consultation_id: consultationId })
      });

      if (!response.ok) {
        throw new Error('Failed to begin paid consultation');
      }

      // Refresh or show success message
      alert('Paid consultation started! You can now send messages.');
      
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="message-sender">
      {error && (
        <div className="error-message">
          {error}
          {error.includes('LOCKED') && (
            <button onClick={beginPaidConsultation}>
              Purchase Tokens & Start Paid Consultation
            </button>
          )}
        </div>
      )}
      
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
        rows={3}
        disabled={sending}
      />
      
      <button 
        onClick={sendMessage} 
        disabled={sending || !message.trim()}
      >
        {sending ? 'Sending...' : 'Send Message'}
      </button>
    </div>
  );
};

export default MessageSender;
