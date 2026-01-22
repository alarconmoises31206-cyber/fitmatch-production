// domain/services/userService.ts
import { UserSchema } from "../schemas";
import { emitEvent } from "../events/emit";

export function createUser(data: unknown) {
  const user = UserSchema.parse(data)
  
  // EMIT DOMAIN EVENT: a new user has signed up
  emitEvent('user.signed_up', {
    userId: user.id,
    email: user.email,
    walletBalance: user.wallet_balance,
  }, {
    source: 'userService.createUser',
    userId: user.id,
  })

  return {
    ...user,
    displayEmail: user.email,
  }
}

export function updateUserProfile(data: unknown) {
  const profile = UserSchema.partial().parse(data)
  return {
    ...profile,
    updated_at: new Date().toISOString(),
  }
}

export function getUserDisplayInfo(user: unknown) {
  const validated = UserSchema.parse(user)
  return {
    id: validated.id,
    email: validated.email,
    displayEmail: validated.email,
    walletBalance: validated.wallet_balance,
  }
}
