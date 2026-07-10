import type { Exercise, ProgramDay } from '../types'
import { exerciseSlug } from './demos'

export type WorkoutLocation = 'gym' | 'home'

/**
 * Home / non-gym substitutions: every gym-equipment movement maps to a
 * bodyweight or functional equivalent (backpack = improvised load).
 * Movements that already need no equipment pass through unchanged.
 */
const HOME_SWAPS: Record<string, Omit<Exercise, 'rest'> & { rest?: string }> = {
  'barbell-bench-press': { name: 'Push-ups (add backpack for load)', sets: 4, reps: '15–20' },
  'bench-press': { name: 'Push-ups (add backpack for load)', sets: 4, reps: '15–20' },
  'overhead-press': { name: 'Pike Push-ups', sets: 4, reps: '8–12' },
  'incline-bench-press': { name: 'Decline Push-ups (feet elevated)', sets: 4, reps: '12–15' },
  'incline-barbell-press': { name: 'Decline Push-ups (feet elevated)', sets: 4, reps: '12–15' },
  'incline-dumbbell-press': { name: 'Decline Push-ups (feet elevated)', sets: 4, reps: '12–15' },
  'lateral-raises': { name: 'Water-jug Lateral Raises', sets: 4, reps: '15' },
  'lateral-raise': { name: 'Water-jug Lateral Raises', sets: 4, reps: '15' },
  'cable-triceps-pushdown': { name: 'Chair Dips', sets: 3, reps: '12–15' },
  'overhead-triceps-extension': { name: 'Diamond Push-ups', sets: 3, reps: '10–15' },
  deadlift: { name: 'Single-leg RDL (loaded backpack)', sets: 3, reps: '10/leg' },
  'weighted-pull-ups': { name: 'Table Inverted Rows', sets: 4, reps: '10–15' },
  'barbell-row': { name: 'Backpack Bent-over Row', sets: 3, reps: '12–15' },
  't-bar-row': { name: 'Table Inverted Rows', sets: 4, reps: '10–12' },
  'one-arm-dumbbell-row': { name: 'One-arm Backpack Row', sets: 3, reps: '10–12/arm' },
  'face-pulls': { name: 'Prone Y-T-W Raises', sets: 3, reps: '15' },
  'barbell-curl': { name: 'Backpack Curls', sets: 3, reps: '12–15' },
  'hammer-curl': { name: 'Backpack Hammer Curls', sets: 3, reps: '12' },
  'incline-dumbbell-curl': { name: 'Slow-negative Backpack Curls', sets: 3, reps: '12' },
  'barbell-back-squat': { name: 'Tempo Squats (3s down)', sets: 4, reps: '15–20' },
  'front-squat': { name: 'Prisoner Squats (hands behind head)', sets: 4, reps: '15' },
  'romanian-deadlift': { name: 'Single-leg Hip Hinge', sets: 3, reps: '12/leg' },
  'leg-press': { name: 'Bulgarian Split Squat (rear foot on chair)', sets: 3, reps: '12/leg' },
  'leg-curl': { name: 'Sliding Leg Curls (towel on floor)', sets: 3, reps: '8–10' },
  'nordic-curl-leg-curl': { name: 'Nordic Curl Negatives (feet under couch)', sets: 3, reps: '6–8' },
  'standing-calf-raise': { name: 'Single-leg Calf Raises on a step', sets: 4, reps: '15/leg' },
  'hanging-leg-raise': { name: 'Lying Leg Raises', sets: 3, reps: '15–20' },
  'hanging-knee-raise': { name: 'Lying Knee Tucks', sets: 3, reps: '15–20' },
  'dumbbell-pullover': { name: 'Floor Backpack Pullover', sets: 3, reps: '12' },
  'cable-fly': { name: 'Wide-grip Push-ups (deep stretch)', sets: 3, reps: '12–15' },
  'seated-dumbbell-press': { name: 'Pike Push-ups', sets: 4, reps: '8–12' },
  'close-grip-bench-press': { name: 'Diamond Push-ups', sets: 3, reps: '12–15' },
  'weighted-sit-ups': { name: 'Sit-ups', sets: 4, reps: '20' },
  'kettlebell-swings': { name: 'Jump Squats (explosive)', sets: 5, reps: '15' },
  'goblet-squat': { name: 'Backpack Goblet Squat', sets: 4, reps: '15' },
  'assault-bike-sprints': { name: 'High-knee Sprints in place', sets: 8, reps: '20 s on / 40 s off' },
  'battle-ropes': { name: 'Mountain Climbers', sets: 4, reps: '30 s' },
  'box-jumps': { name: 'Jump Squats onto stairs / step', sets: 4, reps: '8' },
  'farmer-s-carry': { name: 'Loaded Backpack Suitcase Carry', sets: 4, reps: '40 m/side' },
  'ab-wheel-rollout': { name: 'Plank Walkouts', sets: 3, reps: '10' },
  'trap-bar-deadlift': { name: 'Backpack Deadlift + Glute Bridge', sets: 4, reps: '15' },
  'push-up-to-renegade-row': { name: 'Push-up to Plank Row (backpack)', sets: 4, reps: '10' },
}

export function homeVersion(ex: Exercise): Exercise {
  const swap = HOME_SWAPS[exerciseSlug(ex.name)]
  if (!swap) return ex
  return { name: swap.name, sets: swap.sets, reps: swap.reps, rest: swap.rest ?? ex.rest }
}

/** Resolve a program day's exercise list for the chosen training location. */
export function exercisesFor(day: ProgramDay, location: WorkoutLocation): Exercise[] {
  if (location === 'gym') return day.exercises
  return day.exercises.map(homeVersion)
}
