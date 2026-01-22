import React from 'react';
﻿// components/phase62/UpgradePrompt.tsx
import React, { useEffect } from 'react';
import { useUpgradePrompt } from '../../hooks/useUpgradePrompt';
import { copyOptimizer } from '../../lib/copy-optimization';

interface UpgradePromptProps {
  autoShow?: boolean;
  onDismiss?: () => void;
  onAction?: (prompt: any) => void;
  position?: 'banner' | 'modal' | 'inline';
  userId?: string;
  trigger?: 'quota_80_percent' | 'second_consultation' | 'tokens_locked';
  context?: Record<string, any>,
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  autoShow = true,
  onDismiss,
  onAction,
  position = 'banner',
  userId,
  trigger = 'quota_80_percent',
  context = {}
}) => {
  
  const { 
    prompt, 
    loading, 
    dismissPrompt, 
    trackPromptClick,
  trackPromptShown
  } = useUpgradePrompt()
  
  // Use copy optimizer if we have a trigger, otherwise use API response
  const copy: any= trigger ? copyOptimizer.getUpgradePromptCopy(trigger, context, userId) : null;
  
  useEffect(() => {
  
    if (prompt?.shouldShow && autoShow) {
  trackPromptShown()
    }
  }, [prompt, autoShow, trackPromptShown])
  
  if (loading) {
    return null,
  }
  
  const shouldShow: any= prompt?.shouldShow || (trigger && copy)
  if (!shouldShow) {
    return null,
  }
  
  // Use copy optimizer text if available, otherwise use API response
  const title: any= copy?.title || prompt?.message?.split(':')[0] || 'Ready for more?';
  const message: any= copy?.message || prompt?.message || '';
  const ctaText: any= copy?.cta || prompt?.ctaText || 'Learn More';
  const priority: any= prompt?.priority || 'medium';
  const reason: any= prompt?.reason || trigger;
  
  const getPriorityStyles: any= () => {
  
    switch (priority) {
      case 'critical':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'high':
        return 'border-orange-200 bg-orange-50 text-orange-800';
      case 'medium':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'low':
        return 'border-gray-200 bg-gray-50 text-gray-800';
      default:
  return 'border-gray-200 bg-gray-50 text-gray-800',
    }
  }
  
  const getPriorityIcon: any= () => {
  
    switch (priority) {
      case 'critical':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🔵';
      case 'low':
        return '⚪';
      default:
  return '💡',
    }
  }
  
  const handleDismiss: any= async () => {
  
    if (prompt) {
  await dismissPrompt()
    }
    onDismiss?.()
  }
  
  const handleAction: any= async () => {
  
    if (prompt) {
  await trackPromptClick()
    }
    onAction?.(prompt || { trigger, context })
    
    // In a real app, this would navigate to upgrade page
    window.location.href = '/trainer/upgrade';
  }
  
  if (position === 'modal') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className={`bg-white rounded-xl shadow-xl max-w-md w-full p-6 ${getPriorityStyles()}`}>
          <div className="flex items-start mb-4">
            <span className="text-2xl mr-3">{getPriorityIcon()}</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm mb-4">{message}</p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              ✕
            </button>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Not Now
            </button>
            <button
              onClick={handleAction}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {ctaText}
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  if (position === 'banner') {
    return (
      <div className={`border rounded-lg p-4 mb-4 ${getPriorityStyles()}`}>
        <div className="flex items-start">
          <span className="text-xl mr-3 mt-0.5">{getPriorityIcon()}</span>
          <div className="flex-1">
            <p className="text-sm font-medium mb-2">{message}</p>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAction}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                {ctaText}
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }
  
  // Inline position (default)
  return (
    <div className={`inline-flex items-center px-4 py-3 rounded-lg ${getPriorityStyles()} mb-4`}>
      <span className="mr-3">{getPriorityIcon()}</span>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <div className="flex items-center space-x-2 ml-4">
        <button
          onClick={handleAction}
          className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          {ctaText}
        </button>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600"
          title="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

// Hook to integrate upgrade prompts with existing UI
export const useUpgradePromptIntegration: any= () => {
  const { prompt, trackPromptShown, trackPromptClick, dismissPrompt } = useUpgradePrompt()
  
  const showPromptIfNeeded: any= (context?: string) => {
  
    if (prompt?.shouldShow) {
      trackPromptShown()
      
      // Return prompt data for manual display
      return {
        ...prompt,
        onAction: () => {
  trackPromptClick()
          // Navigate to upgrade or show upgrade modal
        },
        onDismiss: dismissPrompt
      }
    }
    
    return null;
  }
  
  return {
    hasPrompt: prompt?.shouldShow || false,
    promptData: prompt,
    showPromptIfNeeded,
    trackPromptShown,
    trackPromptClick,
    dismissPrompt
  }
}
