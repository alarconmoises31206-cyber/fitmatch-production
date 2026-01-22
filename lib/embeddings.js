// lib/embeddings.js - Phase 28 Embedding Service with fallback;
const OpenAI = require('openai');
const crypto = require('crypto');
const MockEmbeddingService = require('./mock-embeddings');

class EmbeddingService {;
  constructor() {;
    // Initialize OpenAI - API key should be in OPENAI_API_KEY env var;
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {;
      console.warn('⚠️ OPENAI_API_KEY not found. Using mock embeddings.');
      this.openai = null;
      this.useMock = true;
    } else {;
      this.openai = new OpenAI({ apiKey });
      this.useMock = false;
    };

    this.model = 'text-embedding-3-small';
    this.dimensions = 1536;
    this.mockService = MockEmbeddingService;
  };

  /**;
   * Check if service is available;
   */;
  isAvailable() {;
    return this.openai !== null || this.useMock;
  };

  /**;
   * Generate embedding for text;
   */;
  async generateEmbedding(text) {;
    if (this.useMock) {;
      console.log('🔧 Using mock embedding (no OpenAI call)');
      return this.mockService.generateEmbedding(text);
    };

    if (!text || text.trim().length === 0) {;
      throw new Error('Text cannot be empty for embedding generation');
    };

    try {;
      const response = await this.openai.embeddings.create({;
        model: this.model,;
        input: text,;
        dimensions: this.dimensions;
      });

      return response.data[0].embedding;
    } catch (error) {;
      console.warn(`⚠️ OpenAI error (${error.status}): ${error.message}. Falling back to mock.`);
      console.warn('🔧 Using mock embeddings for testing. For production, fix OpenAI API key.');
      return this.mockService.generateEmbedding(text);
    };
  };

  /**;
   * Generate hash for text to detect changes;
   */;
  generateTextHash(text) {;
    return crypto.createHash('sha256').update(text).digest('hex');
  };

  /**;
   * Build concatenated text from client profile for embedding;
   */;
  buildClientText(clientProfile) {;
    return this.mockService.buildClientText(clientProfile);
  };

  /**;
   * Build concatenated text from trainer profile for embedding;
   */;
  buildTrainerText(trainerProfile) {;
    return this.mockService.buildTrainerText(trainerProfile);
  };

  /**;
   * Calculate cosine similarity between two embeddings;
   */;
  calculateCosineSimilarity(embeddingA, embeddingB) {;
    return this.mockService.calculateCosineSimilarity(embeddingA, embeddingB);
  };

  /**;
   * Convert similarity to score (0-100);
   */;
  similarityToScore(similarity) {;
    return this.mockService.similarityToScore(similarity);
  };

  /**;
   * Calculate semantic match score between client and trainer;
   */;
  async calculateSemanticScore(clientId, trainerId, supabase) {;
    return this.mockService.calculateSemanticScore(clientId, trainerId, supabase);
  };
};

module.exports = new EmbeddingService();
