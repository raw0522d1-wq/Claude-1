import type { Milestone } from '../types'

export const MILESTONES: Milestone[] = [
  {
    id: 'first-blood',
    title: 'FIRST BLOOD',
    requirement: 'Complete your first check-in → check-out workout',
    reward: 'Founder badge + 150 XP',
    rewardIcon: '🩸',
    xp: 150,
    isMet: (s) => s.totalWorkouts >= 1,
  },
  {
    id: 'week-one',
    title: 'SHOWED UP',
    requirement: 'Hit a 3-day workout streak',
    reward: 'Rest-Day Pass token',
    rewardIcon: '🎟️',
    xp: 200,
    isMet: (s) => s.bestStreak >= 3,
  },
  {
    id: 'iron-five',
    title: 'IRON FIVE',
    requirement: 'Complete 5 workouts',
    reward: 'Cheat-Meal token — earned, not stolen',
    rewardIcon: '🍔',
    xp: 250,
    isMet: (s) => s.totalWorkouts >= 5,
  },
  {
    id: 'streak-seven',
    title: 'UNBROKEN',
    requirement: '7-day workout streak',
    reward: 'UNBROKEN title on your dashboard',
    rewardIcon: '⛓️',
    xp: 400,
    isMet: (s) => s.bestStreak >= 7,
  },
  {
    id: 'double-digits',
    title: 'DOUBLE DIGITS',
    requirement: 'Complete 10 workouts',
    reward: 'Cheat-Meal token + 10% off partner merch (add your code)',
    rewardIcon: '🔟',
    xp: 500,
    isMet: (s) => s.totalWorkouts >= 10,
  },
  {
    id: 'proof-stack',
    title: 'PROOF STACK',
    requirement: 'Bank 20 check-in/check-out photos',
    reward: 'Transformation timeline unlocked',
    rewardIcon: '📸',
    xp: 300,
    isMet: (s) => s.totalPhotos >= 20,
  },
  {
    id: 'quarter-century',
    title: 'QUARTER CENTURY',
    requirement: 'Complete 25 workouts',
    reward: 'VETERAN badge + massage / recovery-day token',
    rewardIcon: '🥈',
    xp: 750,
    isMet: (s) => s.totalWorkouts >= 25,
  },
  {
    id: 'month-of-iron',
    title: 'MONTH OF IRON',
    requirement: 'Stay on program for 4 weeks',
    reward: 'New progress-photo comparison card',
    rewardIcon: '🗓️',
    xp: 600,
    isMet: (s) => s.weeksIn >= 4,
  },
  {
    id: 'fifty',
    title: 'THE FIFTY',
    requirement: 'Complete 50 workouts',
    reward: 'GOLD tier — flex it',
    rewardIcon: '🥇',
    xp: 1500,
    isMet: (s) => s.totalWorkouts >= 50,
  },
  {
    id: 'century',
    title: 'CENTURION',
    requirement: 'Complete 100 workouts',
    reward: 'CENTURION title — permanent',
    rewardIcon: '🏆',
    xp: 3000,
    isMet: (s) => s.totalWorkouts >= 100,
  },
]

export const LEVELS = [
  { name: 'RECRUIT', minXp: 0 },
  { name: 'CONTENDER', minXp: 500 },
  { name: 'DISCIPLINED', minXp: 1500 },
  { name: 'FORGED', minXp: 3500 },
  { name: 'ELITE', minXp: 7000 },
  { name: 'TITAN', minXp: 12000 },
  { name: 'LEGEND', minXp: 20000 },
]

export function levelFor(xp: number) {
  let idx = 0
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].minXp) idx = i
  }
  const current = LEVELS[idx]
  const next = LEVELS[idx + 1] ?? null
  const progress = next
    ? Math.min(1, (xp - current.minXp) / (next.minXp - current.minXp))
    : 1
  return { index: idx, current, next, progress }
}
