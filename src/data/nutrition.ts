import type { GoalMode, UserProfile } from '../types'

export interface MacroPlan {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  goal: GoalMode
  goalLabel: string
}

const GOAL_ADJUST: Record<GoalMode, { delta: number; label: string }> = {
  cut: { delta: -500, label: 'Aggressive Cut · −500 kcal' },
  recomp: { delta: -100, label: 'Recomposition · ~maintenance' },
  'lean-bulk': { delta: 250, label: 'Lean Bulk · +250 kcal' },
  bulk: { delta: 500, label: 'Mass Bulk · +500 kcal' },
}

/** Mifflin-St Jeor BMR → TDEE → goal-adjusted macros (1g protein / lb, 25% fat). */
export function calcMacros(p: UserProfile, goal: GoalMode): MacroPlan {
  const s = p.sex === 'male' ? 5 : -161
  const bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + s
  const tdee = bmr * p.activity
  const calories = Math.max(1200, Math.round((tdee + GOAL_ADJUST[goal].delta) / 10) * 10)
  const proteinG = Math.round(p.weightKg * 2.2)
  const fatG = Math.round((calories * 0.25) / 9)
  const carbsG = Math.max(0, Math.round((calories - proteinG * 4 - fatG * 9) / 4))
  return { calories, proteinG, carbsG, fatG, goal, goalLabel: GOAL_ADJUST[goal].label }
}

export interface Meal {
  name: string
  items: string[]
  kcal: number
  protein: number
}

export interface DayMealPlan {
  title: string
  meals: Meal[]
}

const CUT_PLAN: DayMealPlan = {
  title: 'Shred Day — high protein, high volume, low regret',
  meals: [
    {
      name: 'Breakfast',
      items: ['4 egg whites + 2 whole eggs scramble', 'Spinach & peppers', '1 slice ezekiel toast', 'Black coffee'],
      kcal: 420,
      protein: 34,
    },
    {
      name: 'Lunch',
      items: ['200 g grilled chicken breast', 'Big mixed salad, light vinaigrette', '150 g jasmine rice'],
      kcal: 560,
      protein: 52,
    },
    {
      name: 'Pre-workout',
      items: ['Greek yogurt (0%) + berries', '10 g honey'],
      kcal: 220,
      protein: 22,
    },
    {
      name: 'Dinner',
      items: ['200 g lean steak or white fish', 'Roasted broccoli & asparagus', 'Small sweet potato'],
      kcal: 540,
      protein: 48,
    },
    {
      name: 'Night protein',
      items: ['Casein or whey shake in water'],
      kcal: 130,
      protein: 25,
    },
  ],
}

const RECOMP_PLAN: DayMealPlan = {
  title: 'Recomp Day — fuel performance, stay lean',
  meals: [
    {
      name: 'Breakfast',
      items: ['3 whole eggs + 2 whites', 'Oatmeal (60 g) with banana', 'Black coffee'],
      kcal: 610,
      protein: 34,
    },
    {
      name: 'Lunch',
      items: ['200 g chicken thigh or salmon', '200 g rice or quinoa', 'Avocado ¼ + greens'],
      kcal: 720,
      protein: 48,
    },
    {
      name: 'Pre/Post workout',
      items: ['Whey shake', 'Rice cakes with honey (post)'],
      kcal: 320,
      protein: 28,
    },
    {
      name: 'Dinner',
      items: ['200 g lean beef', 'Potatoes or pasta (150 g dry)', 'Large mixed vegetables'],
      kcal: 680,
      protein: 46,
    },
  ],
}

const BULK_PLAN: DayMealPlan = {
  title: 'Growth Day — surplus with clean, dense calories',
  meals: [
    {
      name: 'Breakfast',
      items: ['4 whole eggs', 'Oatmeal (80 g) + whole milk + peanut butter', 'Banana'],
      kcal: 820,
      protein: 42,
    },
    {
      name: 'Lunch',
      items: ['250 g chicken or beef', '250 g rice', 'Olive oil drizzle + veg'],
      kcal: 850,
      protein: 55,
    },
    {
      name: 'Post-workout',
      items: ['Whey shake with whole milk', 'Bagel with jam'],
      kcal: 520,
      protein: 38,
    },
    {
      name: 'Dinner',
      items: ['250 g salmon or steak', 'Pasta or potatoes (200 g dry)', 'Roasted vegetables'],
      kcal: 830,
      protein: 52,
    },
    {
      name: 'Before bed',
      items: ['Greek yogurt + granola + honey'],
      kcal: 340,
      protein: 22,
    },
  ],
}

export function mealPlanFor(goal: GoalMode): DayMealPlan {
  if (goal === 'cut') return CUT_PLAN
  if (goal === 'bulk' || goal === 'lean-bulk') return BULK_PLAN
  return RECOMP_PLAN
}

export const NUTRITION_RULES = [
  'Protein at every meal — aim for 1 g per pound of body weight daily.',
  'Water first: 3–4 L per day. Thirst masquerades as hunger.',
  '80/20 rule: 80% whole single-ingredient foods, 20% flexibility.',
  'Eat carbs around training — before for fuel, after for recovery.',
  'Sleep 7–9 h. Under-sleeping raises hunger hormones and kills recovery.',
]
