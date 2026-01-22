import React, { useState } from 'react';
import { MatchResult } from '@/types/match';

interface FirstMessageComposerProps {
  match: MatchResult;
  trainerName: string;
  onSend: (message: string) => Promise<void>;
  onCancel: () => void;
  isSending: boolean;
}

const FirstMessageComposer: React.FC<FirstMessageComposerProps> = ({
  match,
  trainerName,
  onSend,
  onCancel,
  isSending
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      await onSend(message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4">Message {trainerName}</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            className="w-full h-32 p-3 border rounded mb-4"
            disabled={isSending}
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 border rounded hover:bg-gray-50"
              disabled={isSending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={isSending || !message.trim()}
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FirstMessageComposer;
