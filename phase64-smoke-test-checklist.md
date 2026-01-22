# Phase 64.5 Role-Switch Smoke Test Checklist

## Objective
Verify that a user can log in as client and trainer, perform core actions, and understand the system.

## Steps

### 1. Log in as client
- Navigate to /auth/login
- Use test client credentials
- Verify redirect to client dashboard or matches page

### 2. View client profile
- Click on "Profile" link (or navigate to /profile)
- Confirm profile page shows:
  - Name/avatar
  - Goals
  - Constraints (budget, availability)
  - Match preferences
- Click "Edit" -> should redirect to /questionnaire

### 3. Message a trainer
- Go to matches page (/matches)
- Select a match card, click "Start Conversation"
- In conversation page, verify:
  - Consultation state visible (FREE/LOCKED/PAID/ENDED)
  - Rate when locked
  - Token balance (if client)
- Send a message

### 4. Log out and log in as trainer
- Log out, then log in with trainer credentials
- Verify trainer dashboard or profile editor accessible

### 5. Edit trainer profile
- Navigate to /trainer/profile
- Edit bio, specialties, pricing, availability
- Save changes
- Verify changes persisted (refresh page)

### 6. Reply to client message
- Go to messages page (/messages)
- Open the conversation with the client
- Verify consultation state and gating behavior
- Send a reply

### 7. End consultation (trainer)
- In conversation, trigger end consultation (if applicable)
- Verify consultation state changes to ENDED
- Verify system message appears

### 8. Log out and log back in as client
- Verify client sees consultation ended state
- Verify cannot send further messages (if gated)

## Success Criteria
- All steps can be performed without errors
- UI clearly shows consultation state and explains matches
- No confusion about roles or system behavior
