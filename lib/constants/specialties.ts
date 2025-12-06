// Official FitMatch Specialty List v1.0
export const FITNESS_SPECIALTIES = [
  // Strength & Conditioning
  'General Strength Training',
  'Powerlifting',
  'Weightlifting (Olympic)',
  'Hypertrophy / Bodybuilding',
  
  // Athletic Performance
  'Speed & Agility',
  'Sports Performance',
  'MMA / Combat Sports',
  'Boxing',
  'Wrestling',
  'Jiu-Jitsu',
  
  // Health & Longevity
  'Functional Fitness',
  'Mobility / Flexibility',
  'Injury Prevention',
  'Post-Rehab Training',
  'Senior Fitness',
  
  // Body Transformation
  'Fat Loss',
  'Lean Muscle Gain',
  'Physique Coaching',
  
  // Lifestyle & Wellness
  'Beginner Fitness',
  'Habit Building',
  'Stress Reduction',
  'Yoga',
  'Pilates'
] as const;

export type FitnessSpecialty = typeof FITNESS_SPECIALTIES[number];
