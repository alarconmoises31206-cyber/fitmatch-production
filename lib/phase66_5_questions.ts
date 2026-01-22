// lib/phase66_5_questions.ts
// Phase 66.5: Question & Signal Design Foundation
// Defines the intentional question sets for structured matching

// ============================================
// ROLE SEPARATION (66.5.1)
// ============================================
export type UserRole = 'client' | 'trainer';

// ============================================
// CLIENT QUESTION SET (66.5.2)
// ============================================
export const CLIENT_QUESTIONS = {
  PRIMARY_GOAL: {
    id: 'client_primary_goal',
    text: 'What are you hoping to get help with right now?',
    signal: 'Outcome orientation, urgency, domain',
    comparisonType: 'soft_similarity' as const,
    comparedAgainst: 'trainer_approach'
  },
  PAST_FRICTION: {
    id: 'client_past_friction',
    text: 'What hasn\'t worked for you in the past?',
    signal: 'Avoidances, red flags, trainer fit risks',
    comparisonType: 'hard_filter' as const,
    comparedAgainst: 'trainer_boundaries'
  },
  INTERACTION_STYLE: {
    id: 'client_interaction_style',
    text: 'How do you prefer to be supported or coached?',
    signal: 'Communication style, tone compatibility',
    comparisonType: 'soft_similarity' as const,
    comparedAgainst: 'trainer_communication_style'
  },
  CONSTRAINTS: {
    id: 'client_constraints',
    text: 'Are there any limits or boundaries a trainer should respect?',
    signal: 'Safety, ethical alignment, hard filters',
    comparisonType: 'hard_filter' as const,
    comparedAgainst: 'trainer_boundaries'
  },
  READINESS: {
    id: 'client_readiness',
    text: 'What level of commitment are you bringing right now?',
    signal: 'Intensity matching, trainer expectations',
    comparisonType: 'soft_similarity' as const,
    comparedAgainst: 'trainer_best_fit_clients'
  }
} as const;

export type ClientQuestionId = keyof typeof CLIENT_QUESTIONS;

// ============================================
// TRAINER QUESTION SET (66.5.3)
// ============================================
export const TRAINER_QUESTIONS = {
  APPROACH: {
    id: 'trainer_approach',
    text: 'How do you typically help clients?',
    signal: 'Methodology, intervention style',
    comparisonType: 'soft_similarity' as const,
    comparedAgainst: 'client_primary_goal'
  },
  BEST_FIT_CLIENTS: {
    id: 'trainer_best_fit_clients',
    text: 'What kinds of clients do you work best with?',
    signal: 'Client compatibility, target audience',
    comparisonType: 'soft_similarity' as const,
    comparedAgainst: 'client_readiness'
  },
  BOUNDARIES: {
    id: 'trainer_boundaries',
    text: 'What types of situations or requests do you avoid?',
    signal: 'Hard exclusions, safety alignment',
    comparisonType: 'hard_filter' as const,
    comparedAgainst: ['client_past_friction', 'client_constraints']
  },
  COMMUNICATION_STYLE: {
    id: 'trainer_communication_style',
    text: 'How would clients describe your communication style?',
    signal: 'Tone matching, friction avoidance',
    comparisonType: 'soft_similarity' as const,
    comparedAgainst: 'client_interaction_style'
  },
  CONSULTATION_PHILOSOPHY: {
    id: 'trainer_consultation_philosophy',
    text: 'What should a client expect from a paid consultation with you?',
    signal: 'Value clarity, expectation setting',
    comparisonType: 'secondary_signal' as const,
    comparedAgainst: 'client_expectations'
  }
} as const;

export type TrainerQuestionId = keyof typeof TRAINER_QUESTIONS;

// ============================================
// COMPARISON MAP (66.5.4)
// ============================================
export const COMPARISON_MAP = {
  // Client Question -> Compared Against Trainer Question
  client_primary_goal: 'trainer_approach',
  client_past_friction: 'trainer_boundaries',
  client_interaction_style: 'trainer_communication_style',
  client_constraints: 'trainer_boundaries',
  client_readiness: 'trainer_best_fit_clients',
  
  // Trainer Question -> Compared Against Client Question  
  trainer_approach: 'client_primary_goal',
  trainer_best_fit_clients: 'client_readiness',
  trainer_boundaries: ['client_past_friction', 'client_constraints'],
  trainer_communication_style: 'client_interaction_style',
  trainer_consultation_philosophy: 'client_expectations'
} as const;

// ============================================
// WEIGHTING PHILOSOPHY (66.5.5)
// ============================================
export const WEIGHT_CLASSES = {
  HARD_FILTERS: {
    description: 'Safety, boundaries, deal-breakers - match excluded if violated',
    questions: ['client_past_friction', 'client_constraints', 'trainer_boundaries']
  },
  PRIMARY_SIGNALS: {
    description: 'Goal ↔ Approach, Style ↔ Style',
    questions: ['client_primary_goal', 'trainer_approach', 'client_interaction_style', 'trainer_communication_style']
  },
  SECONDARY_SIGNALS: {
    description: 'Readiness ↔ Best-fit, Expectations ↔ Philosophy',
    questions: ['client_readiness', 'trainer_best_fit_clients', 'trainer_consultation_philosophy']
  }
} as const;

// ============================================
// TYPE GUARDS AND UTILITIES
// ============================================
export function isClientQuestionId(id: string): id is ClientQuestionId {
  return id in CLIENT_QUESTIONS;
}

export function isTrainerQuestionId(id: string): id is TrainerQuestionId {
  return id in TRAINER_QUESTIONS;
}

export function getQuestionText(questionId: string): string {
  if (isClientQuestionId(questionId)) {
    return CLIENT_QUESTIONS[questionId].text;
  }
  if (isTrainerQuestionId(questionId)) {
    return TRAINER_QUESTIONS[questionId].text;
  }
  return 'Unknown question';
}

// ============================================
// EXPLAINABILITY CONTRACT (66.5.6)
// ============================================
export function generateMatchExplanation(
  matchedQuestions: Array<{clientQuestion: string, trainerQuestion: string, similarity: number}>
): string {
  const explanations: string[] = [];
  
  if (matchedQuestions.some(m => 
    m.clientQuestion === 'client_primary_goal' && 
    m.trainerQuestion === 'trainer_approach')) {
    explanations.push('Your goal aligns with their approach');
  }
  
  if (matchedQuestions.some(m => 
    m.clientQuestion === 'client_interaction_style' && 
    m.trainerQuestion === 'trainer_communication_style')) {
    explanations.push('Your preferred style matches their communication');
  }
  
  if (matchedQuestions.every(m => 
    !['client_past_friction', 'client_constraints'].includes(m.clientQuestion) ||
    m.trainerQuestion !== 'trainer_boundaries')) {
    explanations.push('No stated boundaries were violated');
  }
  
  return `This trainer matched highly because:\n${explanations.map(e => `• ${e}`).join('\n')}`;
}
