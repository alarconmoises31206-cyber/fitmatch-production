// application/ports/matchPort.ts
export interface MatchPort {
  /**
   * Update match status
   */
  updateStatus(matchId: string, status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'completed'): Promise<{ success: boolean }>;
  
  /**
   * Notify trainers about a new match opportunity
   */
  notifyTrainers(matchId: string, trainerIds: string[]): Promise<{ success: boolean; notifiedCount: number }>;
  
  /**
   * Get match details
   */
  getMatchDetails(matchId: string): Promise<{ 
    clientId: string; 
    trainerId?: string;
    requestedDate: Date;
    status: string;
  } | null>;
  
  /**
   * Set match expiration timer
   */
  setExpirationTimer(matchId: string, expiresInMinutes: number): Promise<{ success: boolean; timerId?: string }>;
}

// Default implementation that throws if not properly injected
export const matchPort: MatchPort = {
  updateStatus: async () => {
    throw new Error('MatchPort.updateStatus not implemented - ensure dependency injection')
  },
  notifyTrainers: async () => {
    throw new Error('MatchPort.notifyTrainers not implemented - ensure dependency injection')
  },
  getMatchDetails: async () => {
    throw new Error('MatchPort.getMatchDetails not implemented - ensure dependency injection')
  },
  setExpirationTimer: async () => {
    throw new Error('MatchPort.setExpirationTimer not implemented - ensure dependency injection')
  }
}
