import React from 'react';
﻿// components/phase62/ClaimLanding.tsx
import React, { useState, useEffect } from 'react';
import { copyOptimizer } from '../../lib/copy-optimization';

interface ClaimLandingProps {
  claimToken: string;
  trainerName: string;
  clientName?: string; // Name of client who contacted them
  matchScore?: number; // Compatibility score with client
  hasExistingMatches?: boolean;
  claimSource?: string,
}

const ClaimLanding: React.FC<ClaimLandingProps> = ({
  claimToken,
  trainerName,
  clientName,
  matchScore = 85,
  hasExistingMatches = true,
  claimSource = 'email_link'
}) => {
  
  const [isLoading, setIsLoading] = useState(true)
  const [trainerData, setTrainerData] = useState<any>(null)
  const [copyVariants, setCopyVariants] = useState<{
    hero: any;
  tierComparison: any;
  earningsPreview: any,
  } | null>(null)

  // Simulate user ID for A/B testing (in production, use actual user ID)
  const userId: any= `claim_${claimToken}`;

  useEffect(() => {
  
    // Load copy variants for this user
    copyOptimizer.assignToTest(userId, 'claim_hero_headline')
    copyOptimizer.assignToTest(userId, 'tier_comparison_free')
    copyOptimizer.assignToTest(userId, 'tier_comparison_paid')
    
    setCopyVariants({
      hero: copyOptimizer.getClaimHeroCopy(userId),
      tierComparison: copyOptimizer.getTierComparisonCopy(userId),
  earningsPreview: copyOptimizer.getEarningsPreviewCopy(0, userId)
    })

    // Fetch trainer data
    const fetchTrainerData: any= async () => {
  
      try {
        // In production, this would be an API call
        const mockData: any= {
          name: trainerName,
          specialties: ['Strength Training', 'Nutrition'],
          experienceYears: 5,
          location: 'New York, NY',
          existingMatches: hasExistingMatches ? 3 : 0,
          clientMessages: clientName ? [clientName] : [],
          tokenEstimate: 250, // Estimated monthly earnings
          boostAvailable: true,
  boostExpiresIn: '72 hours'
        }
        
        setTrainerData(mockData)
      } catch (error) {
        console.error('Failed to fetch trainer data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrainerData()
  }, [claimToken, trainerName, userId])

  const handleStartClaim: any= () => {
  
    // Navigate to claim form
  console.log('Starting claim process for token:', claimToken)
    // In production: router.push(`/claim/${claimToken}/form`);
  }

  const handleLearnMore: any= (section: string) => {
    console.log('Learn more clicked:', section)
    // Smooth scroll or expand section
  }

  if (isLoading || !copyVariants) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading your claim page...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
              <span className="text-xl font-semibold text-gray-900">FitMatch</span>
            </div>
            <div className="text-sm text-gray-600">
              Secure claim page • {claimSource.replace('_', ' ')}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section - Answers: Why am I here? */}
        <section className="mb-12 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
            🎯 You're invited to join FitMatch
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {copyVariants.hero.headline}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {copyVariants.hero.subheadline}
          </p>

          {clientName && (
            <div className="inline-flex items-center px-6 py-4 bg-green-50 border border-green-200 rounded-xl mb-8">
              <div className="mr-4 text-3xl">👋</div>
              <div className="text-left">
                <div className="font-medium text-green-800">
                  {clientName} wants to work with you
                </div>
                <div className="text-sm text-green-600">
                  {matchScore}% compatibility match • Message waiting
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleStartClaim}
            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Claim Your Profile — It's Free
          </button>

          <div className="mt-6 text-sm text-gray-500">
            Takes 2 minutes • No credit card required
          </div>
        </section>

        {/* Immediate Benefits - Answers: What do I get right now? */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            What you get immediately
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Benefit 1: Client Access */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Access to Real Clients
              </h3>
              <p className="text-gray-600 mb-4">
                {hasExistingMatches 
                  ? `You already have ${trainerData?.existingMatches || 3} potential matches waiting`
                  : 'Start receiving matched clients immediately'
                }
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• AI-powered matching</li>
                <li>• Verified client profiles</li>
                <li>• Compatibility scoring</li>
              </ul>
            </div>

            {/* Benefit 2: Earnings Potential */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Start Earning Tokens
              </h3>
              <p className="text-gray-600 mb-4">
                Earn tokens for consultations, with estimated monthly potential:
              </p>
              <div className="text-2xl font-bold text-blue-600 mb-2">
                ${trainerData?.tokenEstimate || 250}+
              </div>
              <div className="text-sm text-gray-500">
                Based on similar trainers in {trainerData?.location?.split(',')[0] || 'your area'}
              </div>
            </div>

            {/* Benefit 3: Visibility Boost */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                New Trainer Boost
              </h3>
              <p className="text-gray-600 mb-4">
                Get priority visibility for your first {trainerData?.boostExpiresIn || '72 hours'}:
              </p>
              <div className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                ↑ 25% more matches
              </div>
              <div className="mt-3 text-sm text-gray-500">
                Appears with "New on FitMatch" badge
              </div>
            </div>
          </div>
        </section>

        {/* Tier Comparison - Answers: What happens if I don't upgrade? */}
        <section className="mb-12 bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Choose Your Plan
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Start free, upgrade anytime to earn more
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <div className="bg-white rounded-xl border-2 border-blue-200 p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Free Tier</h3>
                  <div className="text-3xl font-bold text-gray-900 mt-2">$0<span className="text-lg text-gray-500">/month</span></div>
                </div>
                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Recommended to start
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                {copyVariants.tierComparison.freeTier}
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  </div>
                  <span>10 matches per week</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  </div>
                  <span>Respond to 3 consultations/week</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  </div>
                  <span>Earn tokens (withdraw after upgrade)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  </div>
                  <span className="text-gray-500">Weekly limits apply</span>
                </div>
              </div>

              <button
                onClick={handleStartClaim}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Free
              </button>
            </div>

            {/* Paid Tier */}
            <div className="bg-white rounded-xl border-2 border-purple-300 p-6 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="px-4 py-1 bg-purple-600 text-white rounded-full text-sm font-medium">
                  Most Earning Potential
                </div>
              </div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Professional</h3>
                  <div className="text-3xl font-bold text-gray-900 mt-2">$29<span className="text-lg text-gray-500">/month</span></div>
                </div>
                <div className="text-sm text-gray-500 mt-1">billed monthly</div>
              </div>

              <p className="text-gray-600 mb-6">
                {copyVariants.tierComparison.paidTier}
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  </div>
                  <span>Unlimited matches</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  </div>
                  <span>Unlimited consultations</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  </div>
                  <span>Withdraw earnings anytime</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  </div>
                  <span>Priority support</span>
                </div>
              </div>

              <button
                onClick={() => handleLearnMore('paid-tier')}
                className="w-full py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                Learn About Professional
              </button>
              <div className="text-center mt-3 text-sm text-gray-500">
                You can upgrade anytime from your dashboard
              </div>
            </div>
          </div>
        </section>

        {/* Simple 3-Step Process */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Simple 3-Step Process
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Claim Profile</h3>
              <p className="text-gray-600">
                Verify your email and set up your trainer profile
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Free</h3>
              <p className="text-gray-600">
                Use the free tier to match with clients and earn tokens
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upgrade When Ready</h3>
              <p className="text-gray-600">
                Remove limits and withdraw earnings anytime
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to join {clientName ? `${clientName} and other ` : ''}clients on FitMatch?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Claim your profile now and get your new trainer boost immediately.
            </p>
            <button
              onClick={handleStartClaim}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
            >
              Claim Your Free Profile Now
            </button>
            <div className="mt-4 text-sm text-gray-500">
              No obligation • Cancel anytime • 2-minute setup
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p className="mb-2">FitMatch Trainer Platform • Secure Claim Process</p>
            <p className="text-gray-500">
              Questions? Contact support@fitmatch.com • 
              <a href="#" className="text-blue-600 hover:underline ml-2">Privacy Policy</a> • 
              <a href="#" className="text-blue-600 hover:underline ml-2">Terms of Service</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ClaimLanding;
