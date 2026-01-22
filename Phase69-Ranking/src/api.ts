import express, { Request, Response } from 'express';
import { RankingEngine } from './rankingEngine';
import { ClientData, TrainerCandidate, HardFilterRule, WeightClass, RankingResponse } from './types';

// Mock data storage (in production, this would be database calls)
const mockHardFilterRules: HardFilterRule[] = [
  {
    id: 'hf1',
    field: 'certification',
    operator: 'equals',
    value: 'certified',
    weightClass: 'exclusion',
    failureReason: 'Trainer not certified'
  },
  {
    id: 'hf2',
    field: 'availability',
    operator: 'equals',
    value: true,
    weightClass: 'exclusion',
    failureReason: 'Trainer not available'
  }
];

const mockWeightClasses: WeightClass[] = [
  {
    type: 'primary',
    weight: 1.0,
    questionIds: ['q1', 'q2', 'q3']
  },
  {
    type: 'secondary',
    weight: 0.5,
    questionIds: ['q4', 'q5', 'q6']
  }
];

export function createRankingAPI() {
  const router = express.Router();
  
  // POST /api/match/rank
  router.post('/rank', async (req: Request, res: Response) => {
    try {
      const { clientId } = req.body;
      
      if (!clientId) {
        return res.status(400).json({
          error: 'Missing required field: clientId'
        });
      }
      
      console.log(`Processing ranking request for client: ${clientId}`);
      
      // In production: Fetch client data from database
      const clientData: ClientData = await fetchClientData(clientId);
      
      // In production: Fetch all trainers from database
      const allTrainers: TrainerCandidate[] = await fetchAllTrainers();
      
      // Create ranking engine
      const rankingEngine = new RankingEngine(
        clientData,
        allTrainers,
        mockHardFilterRules,
        mockWeightClasses
      );
      
      // Perform ranking
      const result = rankingEngine.rankTrainers();
      
      // Format response
      const response: RankingResponse = {
        rankedTrainers: result.rankedTrainers,
        metadata: result.metadata
      };
      
      res.json(response);
      
    } catch (error) {
      console.error('Error in ranking endpoint:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  return router;
}

// Mock database functions (replace with actual database calls)
async function fetchClientData(clientId: string): Promise<ClientData> {
  // This is a mock - replace with actual database query
  return {
    clientId,
    questionnaireResponses: {
      q1: 'Client response 1',
      q2: 'Client response 2',
      q3: 'Client response 3'
    },
    questionEmbeddings: {
      q1: [0.1, 0.2, 0.3, 0.4],
      q2: [0.5, 0.6, 0.7, 0.8],
      q3: [0.9, 1.0, 1.1, 1.2]
    }
  };
}

async function fetchAllTrainers(): Promise<TrainerCandidate[]> {
  // This is a mock - replace with actual database query
  return [
    {
      trainerId: 'trainer-001',
      questionnaireResponses: {
        q1: 'Trainer response 1',
        q2: 'Trainer response 2',
        q3: 'Trainer response 3',
        certification: 'certified',
        availability: true
      },
      questionEmbeddings: {
        q1: [0.15, 0.25, 0.35, 0.45],
        q2: [0.55, 0.65, 0.75, 0.85],
        q3: [0.95, 1.05, 1.15, 1.25]
      },
      availability: true,
      requiredResponses: ['q1', 'q2', 'q3']
    },
    {
      trainerId: 'trainer-002',
      questionnaireResponses: {
        q1: 'Different response 1',
        q2: 'Different response 2',
        q3: 'Different response 3',
        certification: 'certified',
        availability: true
      },
      questionEmbeddings: {
        q1: [0.8, 0.7, 0.6, 0.5],
        q2: [0.4, 0.3, 0.2, 0.1],
        q3: [0.9, 0.8, 0.7, 0.6]
      },
      availability: true,
      requiredResponses: ['q1', 'q2', 'q3']
    }
  ];
}
