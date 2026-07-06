export type Sex = 'male' | 'female'

export interface UserProfile {
  name: string
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  /** activity multiplier for TDEE */
  activity: number
  aestheticId: string
  programId: string
  premium: boolean
  /** ISO date the journey started */
  startDate: string
}

export interface Exercise {
  name: string
  sets: number
  reps: string
  rest: string
}

export interface ProgramDay {
  title: string
  focus: 'resistance' | 'aerobic' | 'anaerobic' | 'recovery' | 'hybrid'
  exercises: Exercise[]
}

export interface Program {
  id: string
  name: string
  origin: string
  tagline: string
  weeks: number
  daysPerWeek: number
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  aesthetics: string[]
  premium: boolean
  days: ProgramDay[]
}

export type GoalMode = 'cut' | 'recomp' | 'lean-bulk' | 'bulk'

export interface Aesthetic {
  id: string
  name: string
  icon: string
  headline: string
  description: string
  goal: GoalMode
  traits: string[]
}

export interface PhotoRecord {
  id: string
  date: string
  kind: 'in' | 'out'
  dataUrl: string
}

export interface WorkoutLog {
  id: string
  date: string
  programId: string
  dayIndex: number
  checkInPhotoId: string
  checkOutPhotoId: string | null
  startedAt: number
  finishedAt: number | null
  completedExercises: number
  totalExercises: number
  xp: number
}

export interface ActiveSession {
  programId: string
  dayIndex: number
  checkInPhotoId: string
  startedAt: number
  doneExercises: number[]
}

export interface Milestone {
  id: string
  title: string
  requirement: string
  reward: string
  rewardIcon: string
  xp: number
  isMet: (stats: ProgressStats) => boolean
}

export interface ProgressStats {
  totalWorkouts: number
  currentStreak: number
  bestStreak: number
  totalPhotos: number
  totalXp: number
  weeksIn: number
  /** unique workout days logged this week */
  weekCount: number
  /** scheduled workouts per week for the active program */
  weekTarget: number
  /** weekly target hit outright this week */
  weekTargetMet: boolean
  /** consecutive weeks hitting the target (one mulligan per week) */
  weeklyStreak: number
  /** last completed week only counted thanks to the mulligan */
  mulliganSavedLastWeek: boolean
}

export interface Tip {
  category: 'diet' | 'stretching' | 'aerobic' | 'anaerobic' | 'resistance'
  title: string
  body: string
}

export interface AppState {
  profile: UserProfile | null
  logs: WorkoutLog[]
  photos: PhotoRecord[]
  claimedMilestones: string[]
  session: ActiveSession | null
}
