'use client'

import { useState } from 'react'

interface SubscriptionGateProps {
  children: React.ReactNode
  requiredTier?: 'free' | 'premium'
}

export default function SubscriptionGate({ children, requiredTier = 'premium' }: SubscriptionGateProps) {
  const [isSubscribed, setIsSubscribed] = useState(false)

  // For now, always show locked state for premium features
  // In production, this would check user's subscription status
  if (requiredTier === 'premium' && !isSubscribed) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔒</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Premium Feature</h3>
        <p className="text-gray-300 mb-4">
          Upgrade to premium to unlock this feature and more!
        </p>
        <button
          onClick={() => setIsSubscribed(true)}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          Upgrade Now
        </button>
      </div>
    )
  }

  return <>{children}</>
}