import React from 'react';
﻿// components/external-trainers/ExternalContactModal.tsx
import React, { useState, useEffect } from 'react';

interface ExternalContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => Promise<{ success: boolean, error?: string }>;
  trainerName: string;
  isExternal: boolean;
  existingMessage?: string;
  characterLimit?: number;
}

const ExternalContactModal: React.FC<ExternalContactModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  trainerName,
  isExternal,
  existingMessage = '',
  characterLimit = 500
}) => {
  
  const [message, setMessage] = useState(existingMessage)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMessage(existingMessage)
      setError(null)
  setSuccess(false)
    }
  }, [isOpen, existingMessage])

  const handleSubmit: any= async () => {
  
    if (!message.trim()) {
      setError('Please enter a message')
  return,
    }

    if (message.length > characterLimit) {
      setError(`Message exceeds ${characterLimit} character limit`)
      return;
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result: any= await onSubmit(message)
      
      if (result.success) {
        setSuccess(true)
        // Close modal after 2 seconds on success
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setError(result.error || 'Failed to send message')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose: any= () => {
  
    if (!isSubmitting) {
  onClose()
    }
  }

  if (!isOpen) return null;

  const characterCount: any= message.length;
  const isNearLimit: any= characterCount > characterLimit * 0.8;
  const isOverLimit: any= characterCount > characterLimit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">
            Contact {trainerName}
          </h2>
          {isExternal && (
            <p className="text-sm text-orange-600 mt-1">
              ⚠️ This trainer is not yet on FitMatch. You can send one introductory message only.
            </p>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="text-green-500 text-4xl mb-4">✓</div>
              <h3 className="text-lg font-semibold mb-2">Message Sent!</h3>
              <p className="text-gray-600">
                {isExternal 
                  ? 'Your message has been sent. The trainer must join FitMatch to reply.'
                  : 'Your message has been sent to the trainer.'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message {isExternal && '(500 character limit)'}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Write your message to ${trainerName}...`}
                  maxLength={characterLimit}
                  disabled={isSubmitting}
                />
                <div className="flex justify-between mt-1">
                  <div className="text-xs text-gray-500">
                    {isExternal ? (
                      <>
                        No attachments or off-platform links allowed. 
                        {isExternal && ' Trainer must join FitMatch to reply.'}
                      </>
                    ) : 'Your message will be delivered through the FitMatch platform.'}
                  </div>
                  <div className={`text-xs ${
                    isOverLimit ? 'text-red-600' : 
                    isNearLimit ? 'text-orange-600' : 'text-gray-500'
                  }`}>
                    {characterCount}/{characterLimit}
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {isExternal && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <h4 className="text-sm font-medium text-orange-800 mb-1">Important Limitations:</h4>
                  <ul className="text-xs text-orange-700 list-disc list-inside space-y-1">
                    <li>This is your only message to this trainer</li>
                    <li>No email addresses, phone numbers, or social media links</li>
                    <li>No attachments or file sharing</li>
                    <li>Trainer must claim their profile to reply</li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg flex justify-between">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {success ? 'Close' : 'Cancel'}
          </button>
          
          {!success && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !message.trim() || isOverLimit}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                isExternal
                  ? 'bg-orange-500 text-white hover:bg-orange-600 disabled:bg-orange-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300'
              }`}
            >
              {isSubmitting ? 'Sending...' : isExternal ? 'Send Introductory Message' : 'Send Message'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExternalContactModal;
