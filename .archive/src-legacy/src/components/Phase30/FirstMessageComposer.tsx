import { MatchResult } from '@/types/match';
import React, { useEffect, useState } from 'react';

interface FirstMessageComposerProps {
  match: MatchResult;
  trainerName: string;
  onSend: (message: string) => Promise<void>;
  onCancel: () => void;
  isSending?: boolean;
}

const FirstMessageComposer: React.FC<FirstMessageComposerProps> = ({
  match,
  trainerName,
  onSend,
  onCancel,
  isSending = false
}) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Generate the scaffold message based on match explanation
  const generateScaffold = () => {
    // Access compatibilityScore instead of score
    const compatibilityScore = match.compatibilityScore || 95;
    const tier = match.tier === 'full-fitmatch' ? 'Full FitMatch' : 'Free Spin';
    
    // Use breakdown data to generate personalized message
    const bestMatchAspect = Object.entries(match.breakdown || {})
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0]
      .replace('_', ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const trainerFirstName = trainerName.split(' ')[0];

    return `Hi ${trainerFirstName},

FitMatch suggested we might be a ${compatibilityScore}% match (${tier} tier). 

I noticed we have a strong connection in ${bestMatchAspect.toLowerCase()} (${match.breakdown?.[bestMatchAspect.toLowerCase().replace(' ', '_') as keyof typeof match.breakdown] || compatibilityScore}%).

I'm interested in learning more about your training approach and availability. 

Would you be open to a brief chat to see if we might work well together?`;
  }

  // Initialize with scaffold
  useEffect(() => {
    setMessage(generateScaffold());
  }, [match, trainerName]);

  const handleSend = async () => {
    if (!message.trim()) {
      setError('Message cannot be empty');
      return;
    }

    setError(null);

    try {
      await onSend(message);
      // Success handled by parent
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Start Conversation</h2>
          <p className="text-gray-600 mt-1">
            Send your first message to <span className="font-semibold">{trainerName}</span>
          </p>
        </div>

        {/* Context */}
        <div className="p-6 bg-blue-50 border-b border-blue-100">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h1m0 0h-1m1 0v4m-4-7.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-blue-900">Why this match exists</h3>
              <p className="text-blue-700 text-sm mt-1">
                FitMatch score: <span className="font-semibold">{match.compatibilityScore}%</span> • {match.tier === 'full-fitmatch' ? 'High' : 'Good'} confidence
              </p>
              {match.breakdown && (
                <div className="text-blue-600 text-sm mt-2">
                  <p className="font-medium mb-1">Compatibility breakdown:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(match.breakdown).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span>{key.replace('_', ' ')}:</span>
                        <span className="font-semibold">{value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message Editor */}
        <div className="p-6">
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Your message (feel free to edit)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Write your message here..."
            />
          </div>

          {/* Tips */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-gray-900 mb-2">?? Tips for a great first message</h4>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>• Mention specific interests from your match details</li>
              <li>• Ask about their coaching style or experience</li>
              <li>• Keep it friendly and professional</li>
              <li>• Avoid sharing contact information (monitored by FitMatch)</li>
            </ul>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSending}
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isSending || !message.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FirstMessageComposer;
