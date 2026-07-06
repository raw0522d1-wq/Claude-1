import type { Program } from '../types'

/**
 * Program library — built on proven, widely-adopted methods:
 * Push/Pull/Legs, 5x5 linear progression, the Arnold split,
 * 75-Hard-style discipline challenges, HIIT metcons and hybrid
 * lift+run training.
 */
export const PROGRAMS: Program[] = [
  {
    id: 'ppl',
    name: 'PUSH / PULL / LEGS',
    origin: 'The internet’s most-run hypertrophy split',
    tagline: 'Six days. Every muscle, twice a week. Non-negotiable growth.',
    weeks: 8,
    daysPerWeek: 6,
    level: 'Intermediate',
    aesthetics: ['greek-god', 'mass-monster'],
    premium: false,
    days: [
      {
        title: 'PUSH — Chest / Shoulders / Triceps',
        focus: 'resistance',
        exercises: [
          { name: 'Barbell Bench Press', sets: 4, reps: '6–8', rest: '2–3 min' },
          { name: 'Overhead Press', sets: 3, reps: '8–10', rest: '2 min' },
          { name: 'Incline Dumbbell Press', sets: 3, reps: '10–12', rest: '90 s' },
          { name: 'Lateral Raises', sets: 4, reps: '12–15', rest: '60 s' },
          { name: 'Cable Triceps Pushdown', sets: 3, reps: '10–12', rest: '60 s' },
          { name: 'Overhead Triceps Extension', sets: 3, reps: '12–15', rest: '60 s' },
        ],
      },
      {
        title: 'PULL — Back / Biceps / Rear Delts',
        focus: 'resistance',
        exercises: [
          { name: 'Deadlift', sets: 3, reps: '5', rest: '3 min' },
          { name: 'Weighted Pull-ups', sets: 4, reps: '6–10', rest: '2 min' },
          { name: 'Barbell Row', sets: 3, reps: '8–10', rest: '2 min' },
          { name: 'Face Pulls', sets: 3, reps: '15–20', rest: '60 s' },
          { name: 'Barbell Curl', sets: 3, reps: '8–12', rest: '60 s' },
          { name: 'Hammer Curl', sets: 3, reps: '10–12', rest: '60 s' },
        ],
      },
      {
        title: 'LEGS — Quads / Hams / Calves',
        focus: 'resistance',
        exercises: [
          { name: 'Barbell Back Squat', sets: 4, reps: '6–8', rest: '3 min' },
          { name: 'Romanian Deadlift', sets: 3, reps: '8–10', rest: '2 min' },
          { name: 'Leg Press', sets: 3, reps: '10–12', rest: '90 s' },
          { name: 'Leg Curl', sets: 3, reps: '10–12', rest: '60 s' },
          { name: 'Standing Calf Raise', sets: 4, reps: '12–15', rest: '60 s' },
          { name: 'Hanging Leg Raise', sets: 3, reps: '12–15', rest: '60 s' },
        ],
      },
    ],
  },
  {
    id: 'five-by-five',
    name: 'IRON 5×5',
    origin: 'Classic 5×5 linear-progression strength',
    tagline: 'Three lifts. Five sets of five. Add weight every session.',
    weeks: 12,
    daysPerWeek: 3,
    level: 'Beginner',
    aesthetics: ['mass-monster', 'warrior'],
    premium: false,
    days: [
      {
        title: 'WORKOUT A — Squat / Bench / Row',
        focus: 'resistance',
        exercises: [
          { name: 'Barbell Back Squat', sets: 5, reps: '5', rest: '3–5 min' },
          { name: 'Barbell Bench Press', sets: 5, reps: '5', rest: '3–5 min' },
          { name: 'Barbell Row', sets: 5, reps: '5', rest: '3 min' },
          { name: 'Plank', sets: 3, reps: '60 s', rest: '60 s' },
        ],
      },
      {
        title: 'WORKOUT B — Squat / Press / Deadlift',
        focus: 'resistance',
        exercises: [
          { name: 'Barbell Back Squat', sets: 5, reps: '5', rest: '3–5 min' },
          { name: 'Overhead Press', sets: 5, reps: '5', rest: '3–5 min' },
          { name: 'Deadlift', sets: 1, reps: '5', rest: '—' },
          { name: 'Hanging Knee Raise', sets: 3, reps: '10–15', rest: '60 s' },
        ],
      },
    ],
  },
  {
    id: 'arnold-split',
    name: 'GOLDEN ERA SPLIT',
    origin: 'The Arnold-style high-volume split',
    tagline: 'Chest & back supersets, big arms, old-school volume.',
    weeks: 10,
    daysPerWeek: 6,
    level: 'Advanced',
    aesthetics: ['greek-god', 'mass-monster'],
    premium: true,
    days: [
      {
        title: 'CHEST & BACK',
        focus: 'resistance',
        exercises: [
          { name: 'Bench Press (superset w/ Pull-ups)', sets: 4, reps: '8–10', rest: '90 s' },
          { name: 'Incline Barbell Press', sets: 4, reps: '8–10', rest: '90 s' },
          { name: 'Dumbbell Pullover', sets: 3, reps: '10–12', rest: '60 s' },
          { name: 'T-Bar Row', sets: 4, reps: '8–10', rest: '90 s' },
          { name: 'Cable Fly', sets: 3, reps: '12–15', rest: '60 s' },
        ],
      },
      {
        title: 'SHOULDERS & ARMS',
        focus: 'resistance',
        exercises: [
          { name: 'Seated Dumbbell Press', sets: 4, reps: '8–10', rest: '90 s' },
          { name: 'Lateral Raise', sets: 4, reps: '12–15', rest: '60 s' },
          { name: 'Barbell Curl (superset w/ Skullcrushers)', sets: 4, reps: '8–10', rest: '90 s' },
          { name: 'Incline Dumbbell Curl', sets: 3, reps: '10–12', rest: '60 s' },
          { name: 'Close-Grip Bench Press', sets: 3, reps: '8–10', rest: '90 s' },
        ],
      },
      {
        title: 'LEGS & CORE',
        focus: 'resistance',
        exercises: [
          { name: 'Barbell Back Squat', sets: 5, reps: '8–10', rest: '2–3 min' },
          { name: 'Lunges', sets: 3, reps: '12/leg', rest: '90 s' },
          { name: 'Leg Curl', sets: 4, reps: '10–12', rest: '60 s' },
          { name: 'Standing Calf Raise', sets: 5, reps: '15', rest: '45 s' },
          { name: 'Weighted Sit-ups', sets: 4, reps: '15–20', rest: '60 s' },
        ],
      },
    ],
  },
  {
    id: 'gauntlet',
    name: 'THE GAUNTLET',
    origin: '75-day hard-discipline challenge protocol',
    tagline: 'Two workouts a day. No cheat meals. No excuses. 75 days.',
    weeks: 11,
    daysPerWeek: 7,
    level: 'Advanced',
    aesthetics: ['warrior', 'shredded'],
    premium: true,
    days: [
      {
        title: 'DAILY STANDARD — Session 1 (Indoor)',
        focus: 'hybrid',
        exercises: [
          { name: 'Full-body resistance circuit', sets: 4, reps: '45 min total', rest: 'as needed' },
          { name: 'Follow your diet — zero cheat meals', sets: 1, reps: 'all day', rest: '—' },
          { name: 'Drink 1 gallon of water', sets: 1, reps: 'all day', rest: '—' },
          { name: 'Read 10 pages (non-fiction)', sets: 1, reps: '10 pages', rest: '—' },
        ],
      },
      {
        title: 'DAILY STANDARD — Session 2 (Outdoor)',
        focus: 'aerobic',
        exercises: [
          { name: 'Outdoor walk / run / ruck', sets: 1, reps: '45 min', rest: '—' },
          { name: 'Progress photo (your check-in counts)', sets: 1, reps: '1 photo', rest: '—' },
          { name: 'Mobility cooldown', sets: 1, reps: '10 min', rest: '—' },
        ],
      },
    ],
  },
  {
    id: 'hiit-shred',
    name: 'SHRED PROTOCOL',
    origin: 'HIIT + metabolic resistance training',
    tagline: 'Torch fat, keep muscle. 40 minutes of controlled violence.',
    weeks: 6,
    daysPerWeek: 5,
    level: 'Intermediate',
    aesthetics: ['shredded', 'athlete'],
    premium: true,
    days: [
      {
        title: 'METCON A — Full Body Burn',
        focus: 'anaerobic',
        exercises: [
          { name: 'Kettlebell Swings', sets: 5, reps: '20', rest: '30 s' },
          { name: 'Burpees', sets: 5, reps: '12', rest: '30 s' },
          { name: 'Goblet Squat', sets: 4, reps: '15', rest: '45 s' },
          { name: 'Push-up to Renegade Row', sets: 4, reps: '10', rest: '45 s' },
          { name: 'Assault Bike Sprints', sets: 8, reps: '20 s on / 40 s off', rest: 'built-in' },
        ],
      },
      {
        title: 'METCON B — Sprint & Carry',
        focus: 'anaerobic',
        exercises: [
          { name: 'Hill / Treadmill Sprints', sets: 8, reps: '15 s all-out', rest: '75 s' },
          { name: "Farmer's Carry", sets: 4, reps: '40 m heavy', rest: '90 s' },
          { name: 'Box Jumps', sets: 4, reps: '8', rest: '60 s' },
          { name: 'Battle Ropes', sets: 4, reps: '30 s', rest: '30 s' },
          { name: 'Hanging Leg Raise', sets: 3, reps: '12–15', rest: '60 s' },
        ],
      },
      {
        title: 'STEADY BURN — Zone 2 + Core',
        focus: 'aerobic',
        exercises: [
          { name: 'Incline Walk / Easy Run (Zone 2)', sets: 1, reps: '35 min', rest: '—' },
          { name: 'Ab Wheel Rollout', sets: 3, reps: '10–12', rest: '60 s' },
          { name: 'Side Plank', sets: 3, reps: '45 s/side', rest: '45 s' },
        ],
      },
    ],
  },
  {
    id: 'hybrid',
    name: 'HYBRID ENGINE',
    origin: 'The viral lift-heavy / run-far method',
    tagline: 'Deadlift in the morning. 10K pace by night. Be both.',
    weeks: 12,
    daysPerWeek: 5,
    level: 'Intermediate',
    aesthetics: ['athlete', 'warrior'],
    premium: true,
    days: [
      {
        title: 'STRENGTH — Lower Power',
        focus: 'resistance',
        exercises: [
          { name: 'Trap Bar Deadlift', sets: 4, reps: '5', rest: '3 min' },
          { name: 'Front Squat', sets: 3, reps: '6–8', rest: '2 min' },
          { name: 'Bulgarian Split Squat', sets: 3, reps: '8/leg', rest: '90 s' },
          { name: 'Nordic Curl / Leg Curl', sets: 3, reps: '6–10', rest: '90 s' },
        ],
      },
      {
        title: 'ENGINE — Tempo Run',
        focus: 'aerobic',
        exercises: [
          { name: 'Warm-up jog + drills', sets: 1, reps: '10 min', rest: '—' },
          { name: 'Tempo run (comfortably hard)', sets: 1, reps: '25 min', rest: '—' },
          { name: 'Cooldown + calf stretch', sets: 1, reps: '10 min', rest: '—' },
        ],
      },
      {
        title: 'STRENGTH — Upper Power',
        focus: 'resistance',
        exercises: [
          { name: 'Weighted Pull-ups', sets: 4, reps: '5–6', rest: '2–3 min' },
          { name: 'Incline Bench Press', sets: 4, reps: '6–8', rest: '2 min' },
          { name: 'One-Arm Dumbbell Row', sets: 3, reps: '8–10', rest: '90 s' },
          { name: 'Dips', sets: 3, reps: '8–12', rest: '90 s' },
          { name: 'Farmer’s Carry', sets: 3, reps: '40 m', rest: '90 s' },
        ],
      },
      {
        title: 'ENGINE — Intervals',
        focus: 'anaerobic',
        exercises: [
          { name: '400 m repeats @ 5K effort', sets: 6, reps: '400 m', rest: '90 s jog' },
          { name: 'Strides', sets: 4, reps: '80 m', rest: 'walk back' },
          { name: 'Hip mobility flow', sets: 1, reps: '10 min', rest: '—' },
        ],
      },
      {
        title: 'LONG EASY — Zone 2 Base',
        focus: 'aerobic',
        exercises: [
          { name: 'Long easy run / ruck (conversational)', sets: 1, reps: '60–75 min', rest: '—' },
          { name: 'Full-body stretch', sets: 1, reps: '15 min', rest: '—' },
        ],
      },
    ],
  },
]

export function getProgram(id: string): Program {
  return PROGRAMS.find((p) => p.id === id) ?? PROGRAMS[0]
}

export function programsForAesthetic(aestheticId: string): Program[] {
  const matched = PROGRAMS.filter((p) => p.aesthetics.includes(aestheticId))
  const rest = PROGRAMS.filter((p) => !p.aesthetics.includes(aestheticId))
  return [...matched, ...rest]
}
