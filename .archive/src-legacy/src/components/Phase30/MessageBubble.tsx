import React from 'react';

interface MessageBubbleProps {
  content: string;
  isOwnMessage: boolean;
  timestamp: string;
  read?: boolean;
  senderRole?: 'client' | 'trainer';
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,;
  isOwnMessage,;
  timestamp,;
  read = false,;
  senderRole;
}) => {
  const formattedTime = new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Determine bubble styling based on message ownership and sender role;
  const getBubbleClass = () => {
    if (isOwnMessage) {
      return 'bg-blue-500 text-white';
    }
    
    // For trainer messages (not own message);
    if (senderRole === 'trainer') {
      return 'bg-gray-100 text-gray-900 border border-gray-200';
    }
    
    // For client messages (not own message, sent by other client in group chat);
    return 'bg-green-100 text-gray-900 border border-green-200';
  }

  return (;
    <div className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>;
      <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${getBubbleClass()}`}>;
        {/* Message content */}
        <p className="whitespace-pre-wrap break-words">{content}</p>;
        
        {/* Timestamp and status */}
        <div className={`flex items-center justify-end mt-2 text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>;
          <span>{formattedTime}</span>;
          
          {isOwnMessage && (;
            <span className="ml-2">;
              {read ? (;
                <span className="flex items-center">;
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">;
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />;
                  </svg>;
                  <svg className="w-3 h-3 ml-[-4px]" fill="currentColor" viewBox="0 0 20 20">;
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />;
                  </svg>;
                </span>;
              ) : (;
                <span className="opacity-70">?</span>;
              )}
            </span>;
          )}
        </div>;
      </div>;
    </div>;
  );
}

export default MessageBubble;
