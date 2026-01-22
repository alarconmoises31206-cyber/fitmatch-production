// pages/how-fitmatch-uses-ai.tsx
// PHASE 80: Public Transparency Artifact
// Required page explaining AI usage in plain language

import React from 'react';
import { Shield, Target, MessageSquare, Eye, Zap, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const TransparencyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={32} className="text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              How FitMatch Uses AI
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Transparency about our AI-assisted features and the boundaries we maintain
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Phase 80: Core Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Target size={24} className="text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Our AI Philosophy
              </h2>
              <p className="text-gray-700 mb-3">
                FitMatch uses artificial intelligence in a specific, limited way: to help you explore potential matches by analyzing similarities in written profiles.
              </p>
              <p className="text-gray-700">
                We believe AI should assist your decision-making, not replace it. That's why we've built clear boundaries around what our AI can and cannot do.
              </p>
            </div>
          </div>
        </div>

        {/* What AI IS Used For */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Zap size={24} className="text-green-600" />
            What AI is used for
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare size={20} className="text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Semantic Similarity</h3>
              </div>
              <p className="text-gray-700">
                Our AI analyzes the language used in open-ended profile responses (like goals or coaching philosophy) and calculates how similar the wording is.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Eye size={20} className="text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Exploration Aid</h3>
              </div>
              <p className="text-gray-700">
                The Compatibility Signal helps you notice profiles that describe things in similar ways. It's designed to support your exploration, not direct it.
              </p>
            </div>
          </div>
        </section>

        {/* What AI is NOT Used For - Phase 80 Critical Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <AlertTriangle size={24} className="text-amber-600" />
            What AI is NOT used for
          </h2>
          
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-2">❌ Not for recommendations</h3>
              <p className="text-gray-700">
                FitMatch does not use AI to recommend trainers or suggest who you should choose.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-2">❌ Not for predictions</h3>
              <p className="text-gray-700">
                Our AI cannot and does not predict success, match quality, or outcomes of working together.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-2">❌ Not for evaluation</h3>
              <p className="text-gray-700">
                The AI does not evaluate trainer skill, professionalism, experience, or value. It only looks at language similarity.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-2">❌ Not for ranking</h3>
              <p className="text-gray-700">
                Trainers are never ranked or sorted by AI scores. You control how you sort and filter results.
              </p>
            </div>
          </div>
        </section>

        {/* The Compatibility Signal Explained */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Understanding the Compatibility Signal
          </h2>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">What the number means:</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700 italic">
                  "A Compatibility Signal is a numeric summary of how similar two people's written descriptions are in limited areas. It does not evaluate quality, predict outcomes, or recommend decisions."
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">85-100</div>
                <p className="text-sm text-gray-600">Strong similarity in language used</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500 mb-2">40-84</div>
                <p className="text-sm text-gray-600">Some overlap in descriptions</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-500 mb-2">0-39</div>
                <p className="text-sm text-gray-600">Limited semantic similarity</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <p className="text-blue-800 font-medium">
                Remember: A higher number doesn't mean "better" — it only means the text was more similar.
              </p>
            </div>
          </div>
        </section>

        {/* User Control Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            You're in Control
          </h2>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">What you can do:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <span className="text-gray-700">Hide the Compatibility Signal if you prefer</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <span className="text-gray-700">Message any trainer regardless of their signal score</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <span className="text-gray-700">Sort and filter by your own criteria (price, experience, etc.)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <span className="text-gray-700">Make your own decisions after reviewing full profiles</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Why we built it this way:</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700 mb-3">
                    We believe you know yourself best. AI should provide helpful information, not make decisions for you.
                  </p>
                  <p className="text-gray-700">
                    The human connection between trainer and client is complex and personal. No algorithm can capture what makes a good match for you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Phase 80: Director's Note (Internal transparency) */}
        <div className="bg-gray-800 text-white p-6 rounded-lg mb-8">
          <div className="flex items-start gap-4">
            <Shield size={24} className="text-blue-300 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold mb-3">Our Commitment to Transparency</h3>
              <p className="text-gray-300 mb-3">
                Phase 80 of FitMatch's development specifically focuses on ensuring users understand what the Compatibility Signal is before they decide how much to trust it.
              </p>
              <p className="text-gray-300 italic">
                "Phase 80 locks the meaning of the Compatibility Signal. Any future change that alters how users interpret this signal constitutes a new phase and requires explicit review."
              </p>
            </div>
          </div>
        </div>

        {/* Navigation back */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-200">
          <Link
            href="/matches"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Matches
          </Link>
          
          <p className="text-sm text-gray-500">
            Last updated: Phase 80 • User-Facing Meaning & Trust Calibration
          </p>
        </div>
      </main>
    </div>
  );
};

export default TransparencyPage;
