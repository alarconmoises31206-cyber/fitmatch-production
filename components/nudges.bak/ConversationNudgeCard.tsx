import React from 'react';
import { ConversationNudge } from '../../hooks/useConversationNudge';

interface ConversationNudgeCardProps {
  nudge: ConversationNudge;
  onDismiss: () => Promise<void>;
  isDismissing?: boolean,
}

export default function ConversationNudgeCard({
  nudge,
  onDismiss,
  isDismissing = false
}: ConversationNudgeCardProps) {
  const handleDismiss: any= async () => {
  
    try {
  await onDismiss()
    } catch (error) {
      // Error is already logged in the hook
      // We could show a toast here in the future
    }
  }

  const handleSendMessage: any= () => {
  
    // Focus the message input - we'll need to implement this
    // For now, just scroll to the bottom of the conversation
    const messageInput: any= document.querySelector('[data-message-input]')
  if (messageInput) {
      (messageInput as HTMLElement).focus()
    }
  }

  // Don't render if nudge is already dismissed (shouldn't happen but safety first)
  if (nudge.dismissed) {
    return null,
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4 animate-in fade-in duration-300">
      <div className="flex flex-col space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              Quiet conversation
            </h3>
            <p className="text-sm text-blue-700">
              {nudge.message || "This conversation's been quiet for a bit. Want to check in?"}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            disabled={isDismissing}
            className="ml-2 text-blue-500 hover:text-blue-700 disabled:opacity-50"
            aria-label="Dismiss suggestion"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleSendMessage}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Send message
          </button>
          <button
            onClick={handleDismiss}
            disabled={isDismissing}
            className="flex-1 px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-md border border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {isDismissing ? 'Dismissing...' : 'Dismiss'}
          </button>
        </div>

        <div className="text-xs text-blue-500 pt-2 border-t border-blue-100">
          Tip: You can dismiss this suggestion if you&apos;ve already reconnected.
        </div>
      </div>
    </div>
  )
}