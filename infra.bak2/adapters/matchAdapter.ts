// infra/adapters/matchAdapter.ts
import { 
  createMatch, 
  updateMatchStatus,
  calculateMatchScore 
} from "@/domain/services/matchService";
import { MatchPort } from "@/domain/protocols";
import { log } from "../observability/log";

interface SupabaseClient {
  from(table: string): any;
}

export class MatchAdapter implements MatchPort {
  constructor(private supabase: SupabaseClient) {}

  async createNewMatch(data: unknown): Promise<any> {
    const match = createMatch(data)
    
    log.info('match.create', { 
      userId: match.user_id, 
      trainerId: match.trainer_id 
    })

    const { data: dbData, error } = await this.supabase
      .from('matches')
      .insert({
        id: match.id,
        user_id: match.user_id,
        trainer_id: match.trainer_id,
        status: match.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      log.error('match.create_error', { 
        userId: match.user_id, 
        error: error.message 
      })
      throw error;
    }

    return dbData;
  }

  async updateMatch(matchId: string, data: unknown): Promise<any> {
    const currentMatch = await this.getMatchById(matchId)
    if (!currentMatch) {
      throw new Error('Match not found')
    }

    const updatedMatch = updateMatchStatus(currentMatch, (data as any).status)
    
    log.info('match.update_status', { 
      matchId, 
      oldStatus: currentMatch.status, 
      newStatus: updatedMatch.status 
    })

    const { data: dbData, error } = await this.supabase
      .from('matches')
      .update({
        status: updatedMatch.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', matchId)
      .select()
      .single()

    if (error) {
      log.error('match.update_error', { matchId, error: error.message })
      throw error;
    }

    return dbData;
  }

  async getMatchById(matchId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single()

    if (error || !data) {
      log.warn('match.not_found', { matchId })
      return null;
    }

    return data;
  }

  async findMatchesForUser(userId: string, limit: number = 10): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('matches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      log.error('match.list_error', { userId, error: error.message })
      throw error;
    }

    return data.map((match: any) => createMatch(match))
  }

  async findMatchesForTrainer(trainerId: string, limit: number = 10): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('matches')
      .select('*')
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      log.error('match.trainer_list_error', { trainerId, error: error.message })
      throw error;
    }

    return data.map((match: any) => createMatch(match))
  }
}
