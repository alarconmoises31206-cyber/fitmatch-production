import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase/client';
import Link from 'next/link'; // Added Link import

// TEMPORARY BYPASS - REMOVE LATER
const TEMP_USER_ID = 'temp-ml-test-user-' + Date.now();

interface Trainer {
  trainer_id: string;
  first_name: string;
  last_name: string;
  headline: string;
  specialties: string[];
  match_score: number;
  experience_years: number;
  bio?: string;
  cluster?: string;
  similarity_score?: number;
}

interface UserProfile {
  id: string;
  fitness_goal?: string;
  experience_level?: string;
  workout_frequency?: string;
  bio?: string;
}

interface UserCredits {
  spins_remaining: number;
}

export default function Matches() {
  const router = useRouter();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Fetch user's spin credits
  const fetchUserCredits = async (userId: string) => {
    try {
      console.log("Fetching credits for user:", userId);
      const { data, error } = await supabase
        .from("user_credits")
        .select("spins_remaining")
        .eq("user_id", userId)
        .single();
      
      if (error) {
        // User might not have a record yet - that's OK
        if (error.code === "PGRST116") {
          console.log("No credits record found, creating one with free spin");
          // Give them their first free spin
          const { data: newCredits } = await supabase
            .from("user_credits")
            .insert({
              user_id: userId,
              spins_remaining: 1, // First free spin
              last_purchased_at: new Date().toISOString(),
            })
            .select()
            .single();
          
          setUserCredits(newCredits);
          return;
        }
        throw error;
      }
      
      console.log("Found credits:", data);
      setUserCredits(data);
    } catch (error) {
      console.error("Error fetching credits:", error);
    } finally {
      setLoadingCredits(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log('No authenticated user, using temp ID:', TEMP_USER_ID);
        // Create a minimal user profile for ML testing
        const tempProfile = {
          id: TEMP_USER_ID,
          fitness_goal: 'weight_loss',
          experience_level: 'beginner',
          workout_frequency: '3_times_week',
          bio: 'Temporary user for ML testing'
        };
        setUserProfile(tempProfile);
        fetchUserCredits(TEMP_USER_ID); // Also fetch credits for temp user
        return tempProfile;
      }
      
      console.log('Authenticated user:', user.id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setError('Could not load user profile');
        return null;
      }
      
      setUserProfile(profile);
      fetchUserCredits(user.id); // Fetch credits for real user
      return profile;
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      setError('Failed to load user data');
      return null;
    }
  };

  // ... REST OF YOUR EXISTING CODE ...
  // I need to see the rest to continue properly
