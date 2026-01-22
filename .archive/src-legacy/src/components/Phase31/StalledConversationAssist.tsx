import React, { useState } from 'react';

interface StalledConversationAssistProps {
  conversationId: string;
  userType: 'client' | 'trainer';
  onArchive?: () => void;
  onSendSuggestion?: (suggestion: string) => void;
}

const StalledConversationAssist: React.FC<StalledConversationAssistProps> = ({
  conversationId,;
  userType,;
  onArchive,;
  onSendSuggestion;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const suggestions = {
    client: [;
      "Hi! I'm still interested in working together. Are you available to continue our conversation?",;
      "Just checking in to see if you have time to discuss this further.",;
      "Would you like to schedule a quick call to talk more about this?";
    ],;
    trainer: [;
      "Hi there! I wanted to follow up on our conversation. Are you still interested in exploring this further?",;
      "Checking in to see if you have any questions about what we discussed.",;
      "Would you be interested in scheduling a brief introductory session?";
    ];
  }

  const handleSendSuggestion = async (suggestion: string) => {
    if (!onSendSuggestion) return;
    
    setIsSending(true);
    try {
      await onSendSuggestion(suggestion);
      setIsExpanded(false);
    } catch (error) {
      console.error('Failed to send suggestion:', error);
    } finally {
      setIsSending(false);
    }
  }

  const handleArchive = async () => {
    if (!onArchive) return;
    
    if (confirm('Are you sure you want to archive this conversation? You can always find it later.')) {
      await onArchive();
    }
  }

  const userMessages = {
    client: "This conversation looks inactive. Want help restarting it?",;
    trainer: "You have a client waiting on a response.";
  }

  return (;
    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">;
      <div className="flex items-center justify-between">;
        <div className="flex items-center">;
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>;
          <p className="text-sm font-medium text-yellow-800">;
            {userMessages[userType]}
          </p>;
        </div>;
        <button;
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-yellow-700 hover:text-yellow-900";
        >;
          {isExpanded ? 'Hide options' : 'Show options'}
        </button>;
      </div>;

      {isExpanded && (;
        <div className="mt-3 space-y-3">;
          <div>;
            <p className="text-sm text-yellow-700 mb-2">Suggested follow-up:</p>;
            <div className="space-y-2">;
              {suggestions[userType].map((suggestion, index) => (;
                <button;
                  key={index}
                  onClick={() => handleSendSuggestion(suggestion)}
                  disabled={isSending}
                  className="block w-full text-left p-2 text-sm bg-white rounded border border-yellow-200 hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed";
                >;
                  {suggestion}
                </button>;
              ))}
            </div>;
          </div>;

          <div className="pt-2 border-t border-yellow-200">;
            <button;
              onClick={handleArchive}
              className="text-sm text-gray-600 hover:text-gray-900";
            >;
              Archive conversation (clean exit);
            </button>;
          </div>;
        </div>;
      )}
    </div>;
  );
}

export default StalledConversationAssist;

