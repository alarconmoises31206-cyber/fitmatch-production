// infra/adapters/trainerAdapter.ts
import { 
  createTrainer, 
  updateTrainerSpecialization,
  calculateTrainerEarnings 
} from "@/domain/services/trainerService";
import { TrainerPort } from "@/domain/protocols";
import { log } from "../observability/log";

interface SupabaseClient {
  from(table: string): any;
}

export class TrainerAdapter implements TrainerPort {
  constructor(private supabase: SupabaseClient) {}

  async createTrainerProfile(data: unknown): Promise<any> {
    const trainer = createTrainer(data)
    
    log.info('trainer.create', { 
      userId: trainer.user_id, 
      trainerId: trainer.id 
    })

    const { data: dbData, error } = await this.supabase
      .from('trainers')
      .insert({
        id: trainer.id,
        user_id: trainer.user_id,
        specialization: trainer.specialization,
        rating: trainer.rating,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      log.error('trainer.create_error', { 
        userId: trainer.user_id, 
        error: error.message 
      })
      throw error;
    }

    return dbData;
  }

  async updateTrainerProfile(trainerId: string, data: unknown): Promise<any> {
    const update = updateTrainerSpecialization(data)
    
    log.info('trainer.update', { trainerId })

    const { data: dbData, error } = await this.supabase
      .from('trainers')
      .update({
        ...update,
        updated_at: new Date().toISOString(),
      })
      .eq('id', trainerId)
      .select()
      .single()

    if (error) {
      log.error('trainer.update_error', { trainerId, error: error.message })
      throw error;
    }

    return dbData;
  }

  async getTrainerById(trainerId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('trainers')
      .select('*')
      .eq('id', trainerId)
      .single()

    if (error || !data) {
      log.warn('trainer.not_found', { trainerId })
      return null;
    }

    return createTrainer(data)
  }

  async getTrainerByUserId(userId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('trainers')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      log.warn('trainer.user_not_found', { userId })
      return null;
    }

    return createTrainer(data)
  }

  async calculateEarnings(trainerId: string, startDate: string, endDate: string): Promise<number> {
    const { data: sessions, error } = await this.supabase
      .from('sessions')
      .select('*')
      .eq('trainer_id', trainerId)
      .eq('status', 'completed')
      .gte('scheduled_time', startDate)
      .lte('scheduled_time', endDate)

    if (error) {
      log.error('trainer.earnings_query_error', { trainerId, error: error.message })
      throw error;
    }

    const trainer = await this.getTrainerById(trainerId)
    if (!trainer) {
      throw new Error('Trainer not found')
    }

    return calculateTrainerEarnings(trainer, sessions.length)
  }

  async listTrainers(specialization?: string, limit: number = 10): Promise<any[]> {
    let query = this.supabase
      .from('trainers')
      .select('*')
      .order('rating', { ascending: false })
      .limit(limit)

    if (specialization) {
      query = query.eq('specialization', specialization)
    }

    const { data, error } = await query;

    if (error) {
      log.error('trainer.list_error', { error: error.message })
      throw error;
    }

    return data.map((trainer: any) => createTrainer(trainer))
  }
}
