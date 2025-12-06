// /pages/api/ml/match.ts - CORRECT COLUMNS
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Create supabase client directly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Fetch active trainers - ONLY COLUMNS THAT EXIST
    const { data: trainers, error } = await supabase
      .from('trainer_profiles')
      .select(`
        id,
        headline,
        bio,
        specialties,
        experience_years,
        hourly_rate,
        vector_embedding,
        verified_status,
        subscription_status
      `)
      .eq('subscription_status', 'active')
      .limit(20);

    if (error) {
      console.error('Error fetching trainers:', error);
      return res.status(500).json({ error: 'Database error: ' + error.message });
    }

    console.log('Found trainers:', trainers?.length || 0);
    if (trainers && trainers.length > 0) {
      console.log('Sample trainer:', {
        id: trainers[0].id,
        headline: trainers[0].headline,
        verified_status: trainers[0].verified_status
      });
    }
    
    // Mock user embedding (from Phase 16)
    const userEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];

    // Calculate scores and return full trainer objects
    const trainersWithScores = trainers?.map(trainer => {
      const similarity = trainer.vector_embedding 
        ? cosineSimilarity(userEmbedding, trainer.vector_embedding)
        : Math.random() * 0.3 + 0.1;

      // Extract first and last name from headline
      const nameParts = trainer.headline ? trainer.headline.split(' - ')[0]?.split(' ') || [] : [];
      const first_name = nameParts[0] || 'Trainer';
      const last_name = nameParts.slice(1).join(' ') || '';

      return {
        id: trainer.id,
        trainer_id: trainer.id,
        first_name,
        last_name,
        headline: trainer.headline,
        bio: trainer.bio,
        specialties: trainer.specialties || [],
        experience_years: trainer.experience_years,
        hourly_rate: trainer.hourly_rate,
        verified_status: trainer.verified_status || 'unverified',
        subscription_status: trainer.subscription_status,
        score: similarity
      };
    }) || [];

    // Sort by score descending
    trainersWithScores.sort((a, b) => b.score - a.score);

    // DEBUG: Log what we're returning
    console.log('=== MATCHES API DEBUG ===');
    console.log('Number of trainers:', trainersWithScores.length);
    if (trainersWithScores.length > 0) {
      console.log('First trainer FULL DATA:', JSON.stringify(trainersWithScores[0], null, 2));
    }

        return res.status(200).json({ 
      success: true, 
      results: trainersWithScores 
    });

  } catch (error) {
    console.error('Error in match API:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

