// embedding.service.ts - Phase 79 AI-Assisted Compatibility Engine
// Embedding Generation Layer
// IMPORTANT: This is an interpretive lens, not a recommender system

import { createClient } from '@supabase/supabase-js';

export interface EmbeddingRecord {
  field_id: string;
  entity_id: string; // client_id or trainer_id
  entity_type: 'client' | 'trainer';
  embedding: number[];
  model_version: string;
  text_hash: string; // SHA256 of source text for change detection
  created_at: string;
}

export class EmbeddingService {
  private supabase;
  private modelVersion = 'text-embedding-3-small';
  private dimensions = 1536;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Canonical Input Contract - Phase 79 Section 1
   * Determines if a field is eligible for embedding generation
   */
  isFieldEligibleForEmbedding(fieldId: string, mode: 'client' | 'trainer'): boolean {
    // Hard-coded based on Phase 79 Section 1 requirements
    const eligibleFields = {
      client: [
        'personalMotivation',
        'medicalConditions', // Only if consented & surfaced post-match
        'communicationStyle' // If free-text, check truth-map
      ],
      trainer: [
        'bio',
        // 'trainingPhilosophy' - if separate field exists
        // 'specialties_description' - free text, not tags
        // 'communicationStyleNotes' - if field exists
      ]
    };

    return eligibleFields[mode].includes(fieldId);
  }

  /**
   * Generate embedding for text using OpenAI API
   * Versioned for future model changes (Phase 79 Section 2)
   */
  async generateEmbedding(text: string): Promise<{
    embedding: number[];
    model_version: string;
    text_hash: string;
  }> {
    if (!text || text.trim().length === 0) {
      throw new Error('Cannot generate embedding for empty text');
    }

    // In a real implementation, this would call OpenAI API
    // For now, returning mock structure
    const crypto = await import('crypto');
    const textHash = crypto.createHash('sha256').update(text).digest('hex');
    
    // Mock embedding - replace with actual OpenAI call
    const mockEmbedding = Array(this.dimensions).fill(0).map(() => Math.random());
    
    return {
      embedding: mockEmbedding,
      model_version: this.modelVersion,
      text_hash: textHash
    };
  }

  /**
   * Store embedding in database (Phase 79 Section 2)
   * Embeddings are never mutated, only regenerated
   */
  async storeEmbedding(record: Omit<EmbeddingRecord, 'created_at'>): Promise<void> {
    const { data, error } = await this.supabase
      .from('embeddings')
      .insert([{ ...record, created_at: new Date().toISOString() }]);

    if (error) {
      throw new Error(Failed to store embedding: \);
    }
  }

  /**
   * Check if embedding needs regeneration
   * Compares text hash to detect changes
   */
  async needsRegeneration(
    entityType: 'client' | 'trainer',
    entityId: string,
    fieldId: string,
    currentTextHash: string
  ): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('embeddings')
      .select('text_hash')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('field_id', fieldId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return true; // No existing embedding, needs generation
    }

    const latestHash = data[0].text_hash;
    return latestHash !== currentTextHash;
  }

  /**
   * Get embeddings for an entity
   */
  async getEntityEmbeddings(
    entityType: 'client' | 'trainer',
    entityId: string
  ): Promise<EmbeddingRecord[]> {
    const { data, error } = await this.supabase
      .from('embeddings')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(Failed to fetch embeddings: \);
    }

    return data || [];
  }
}
