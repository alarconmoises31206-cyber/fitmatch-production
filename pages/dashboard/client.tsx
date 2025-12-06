import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase/client';
import Link from 'next/link';

export default function ClientDashboard() {
  const [user, setUser] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }
      setUser(session.user);

      // Load matches
      const { data: matchesData } = await supabase
        .from('client_top_matches')
        .select('*')
        .limit(5);

      // Load questionnaire status
      const { data: questionnaireData } = await supabase
        .from('client_questionnaire')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      setMatches(matchesData || []);
      setQuestionnaire(questionnaireData);
      setLoading(false);
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  const isQuestionnaireCompleted = questionnaire?.completed_at;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.email}!
          </h1>
          <p className="text-gray-600 mt-2">Client Dashboard</p>
        </div>

        {/* Questionnaire Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Questionnaire Status</h2>
          
          {isQuestionnaireCompleted ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center text-green-600 mb-2">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Completed</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Last updated: {questionnaire?.updated_at ? new Date(questionnaire.updated_at).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <Link 
                href="/questionnaire"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                Update Answers
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center text-orange-600 mb-2">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Not Started</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Complete your fitness profile to get personalized matches
                </p>
              </div>
              <Link 
                href="/questionnaire"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                Start Questionnaire
              </Link>
            </div>
          )}
        </div>

        {/* Top Matches */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Top Matches</h2>
            <Link href="/matches" className="text-blue-600 hover:text-blue-700 font-medium">
              View All Matches
            </Link>
          </div>
          
          {matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map((trainer) => (
                <div key={trainer.trainer_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {trainer.first_name?.[0]}{trainer.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{trainer.first_name} {trainer.last_name}</h3>
                      <p className="text-sm text-gray-500">{trainer.headline}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-600">
                      {Math.round(trainer.match_score)}% Match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No matches found yet</p>
              <Link 
                href="/questionnaire"
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block"
              >
                Take Questionnaire
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/questionnaire" className="block p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 text-center">
              <div className="text-2xl mb-2">📝</div>
              Update Questionnaire
            </Link>
            <Link href="/matches" className="block p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 text-center">
              <div className="text-2xl mb-2">👥</div>
              Browse Trainers
            </Link>
<Link href="/matches" className="block p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 text-center">
  <div className="text-2xl mb-2">⚡</div>
  Book Session
</Link>
          </div>
        </div>
      </div>
    </div>
  );
}