// domain/protocols.ts
// Stable function signatures for ports & adapters architecture

// ==================== USER DOMAIN ====================
export interface UserPort {
  saveUser(data: unknown): Promise<any>;
  findUser(id: string): Promise<any | null>;
  updateUser(data: unknown): Promise<any>;
  listUsers(limit?: number, offset?: number): Promise<any[]>;
}

// ==================== TRAINER DOMAIN ====================
export interface TrainerPort {
  createTrainerProfile(data: unknown): Promise<any>;
  updateTrainerProfile(trainerId: string, data: unknown): Promise<any>;
  getTrainerById(trainerId: string): Promise<any | null>;
  getTrainerByUserId(userId: string): Promise<any | null>;
  calculateEarnings(trainerId: string, startDate: string, endDate: string): Promise<number>;
  listTrainers(specialization?: string, limit?: number): Promise<any[]>;
}

// ==================== MATCH DOMAIN ====================
export interface MatchPort {
  createNewMatch(data: unknown): Promise<any>;
  updateMatch(matchId: string, data: unknown): Promise<any>;
  getMatchById(matchId: string): Promise<any | null>;
  findMatchesForUser(userId: string, limit?: number): Promise<any[]>;
  findMatchesForTrainer(trainerId: string, limit?: number): Promise<any[]>;
}

// ==================== PAYMENT DOMAIN ====================
export interface PaymentPort {
  createCheckoutSession(data: unknown): Promise<string>;
  processWebhook(event: any): Promise<any>;
  getPaymentStatus(paymentId: string): Promise<any | null>;
}

// ==================== COMPOSITE PORTS ====================
export interface AppPorts {
  user: UserPort;
  trainer: TrainerPort;
  match: MatchPort;
  payment: PaymentPort;
}