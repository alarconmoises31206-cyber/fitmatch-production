// domain/example/async-contract.types.ts
// Contract interface for async operations
// Domain defines the interface, infrastructure implements it
export interface DataRepository {
  getUserById(id: string): Promise<{ id: string; name: string }>
  saveUser(user: { id: string; name: string }): Promise<void>
  findUsersByCriteria(criteria: any): Promise<Array<{ id: string; name: string }>>
}
// Pure domain service that depends on interface
export class UserService {
  constructor(private repository: DataRepository) {}
  // Pure business logic - no async, no I/O
  validateUserName(name: string): { isValid: boolean; error?: string } {
    if (!name || name.trim().length === 0) {
      return { isValid: false, error: 'Name cannot be empty' }
    }
    if (name.length > 100) {
      return { isValid: false, error: 'Name too long' }
    }
    return { isValid: true }
  }
  // Business logic that uses repository (injected, not imported)
  async processUser(id: string): Promise<{ success: boolean; message: string }> {
    const user = await this.repository.getUserById(id)
    // Pure business logic
    const validation = this.validateUserName(user.name)
    if (!validation.isValid) {
      return { success: false, message: validation.error! }
    }
    await this.repository.saveUser(user)
    return { success: true, message: 'User processed successfully' }
  }
}

