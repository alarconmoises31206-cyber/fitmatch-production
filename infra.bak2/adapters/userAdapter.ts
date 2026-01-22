// infra/adapters/userAdapter.ts
import { createUser, updateUserProfile, getUserDisplayInfo } from "@/domain/services/userService";
import { UserPort } from "@/domain/protocols";
import { log } from "../observability/log";

interface SupabaseClient {
  from(table: string): any;
}

export class UserAdapter implements UserPort {
  constructor(private supabase: SupabaseClient) {}

  async saveUser(data: unknown): Promise<any> {
    const user = createUser(data)
    
    log.info('user.save', { userId: user.id })

    const { data: dbData, error } = await this.supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        wallet_balance: user.wallet_balance,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      log.error('user.save_error', { userId: user.id, error: error.message })
      throw error;
    }

    return dbData;
  }

  async findUser(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      log.warn('user.not_found', { userId: id })
      return null;
    }

    return getUserDisplayInfo(data)
  }

  async updateUser(data: unknown): Promise<any> {
    const profile = updateUserProfile(data)
    
    log.info('user.update', { userId: profile.id })

    const { data: dbData, error } = await this.supabase
      .from('users')
      .update({
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)
      .select()
      .single()

    if (error) {
      log.error('user.update_error', { userId: profile.id, error: error.message })
      throw error;
    }

    return dbData;
  }

  async listUsers(limit: number = 10, offset: number = 0): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      log.error('user.list_error', { error: error.message })
      throw error;
    }

    return data.map((user: any) => getUserDisplayInfo(user))
  }
}
