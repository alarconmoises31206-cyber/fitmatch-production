import DashboardContent from '../components/dashboard/DashboardContent';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

interface ClientProfile {
  user_id: string;
  goals_raw?: string;
  preferences_raw?: string;
  fitness_level?: string;
  updated_at: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  async function loadProfile() {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }

    try {
      const storageKey = 'client_profile_' + user.id;
      const savedData = localStorage.getItem(storageKey);

      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setProfile(parsedData);
      } else {
        // No profile data found
        setProfile(null);
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <DashboardContent role="client">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Client Profile</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p>Please sign in to view your profile.</p>
          </div>
        </div>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent role="client">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Client Profile</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          
          <div className="mb-4">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.id}</p>
          </div>

          {profile ? (
            <>
              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-medium mb-3">Questionnaire Data</h3>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700">Fitness Goals</h4>
                  <div className="mt-1 p-3 bg-gray-50 rounded border">
                    {profile.goals_raw || <span className="text-gray-400">Not specified</span>}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-700">Preferences</h4>
                  <div className="mt-1 p-3 bg-gray-50 rounded border">
                    {profile.preferences_raw || <span className="text-gray-400">Not specified</span>}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-700">Fitness Level</h4>
                  <div className="mt-1 p-3 bg-gray-50 rounded border">
                    {profile.fitness_level || <span className="text-gray-400">Not selected</span>}
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  <p>Last updated: {new Date(profile.updated_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600">
                  <em>Data is loaded from your browser's local storage.</em>
                </p>
              </div>
            </>
          ) : (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="font-medium text-yellow-800">No Profile Data Found</h3>
              <p className="mt-1 text-yellow-700">
                You haven't completed the questionnaire yet. Click "Start Questionnaire" on the homepage to create your profile.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardContent>
  );
}
