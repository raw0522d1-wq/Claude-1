import type { Aesthetic } from '../types'

export const AESTHETICS: Aesthetic[] = [
  {
    id: 'greek-god',
    name: 'Greek God',
    icon: '🏛️',
    headline: 'Sculpted. Proportioned. Timeless.',
    description:
      'The golden-era look — broad shoulders, tight waist, dense lean muscle. Built with progressive overload and a disciplined lean-bulk.',
    goal: 'lean-bulk',
    traits: ['V-taper', 'Capped delts', 'Visible abs year-round'],
  },
  {
    id: 'shredded',
    name: 'Shredded',
    icon: '🔪',
    headline: 'Razor-cut definition. Zero excuses.',
    description:
      'Sub-12% body fat with etched detail. High-output training, ruthless calorie control, and conditioning that burns fat while holding muscle.',
    goal: 'cut',
    traits: ['Etched abs', 'Vascularity', 'Stage-ready lines'],
  },
  {
    id: 'mass-monster',
    name: 'Mass Monster',
    icon: '🦍',
    headline: 'Take up space. Move heavy iron.',
    description:
      'Maximum size and raw strength. Heavy compound lifts, high-volume hypertrophy blocks, and a calorie surplus that feeds growth.',
    goal: 'bulk',
    traits: ['Dense mass', 'Big 3 strength', 'Thick back & legs'],
  },
  {
    id: 'athlete',
    name: 'Hybrid Athlete',
    icon: '⚡',
    headline: 'Fast. Strong. Built to perform.',
    description:
      'The viral hybrid standard — lift heavy and run far. Explosive power, engine for days, and a physique that does what it looks like it can do.',
    goal: 'recomp',
    traits: ['Explosive power', 'Elite conditioning', 'Functional muscle'],
  },
  {
    id: 'warrior',
    name: 'Warrior',
    icon: '⚔️',
    headline: 'Discipline is the aesthetic.',
    description:
      'Forged through hard rules and daily standards. Lean, hard, capable — built on the mental-toughness protocols that took over the internet.',
    goal: 'recomp',
    traits: ['Iron discipline', 'Lean & hard', 'Unbreakable habits'],
  },
]

export function getAesthetic(id: string): Aesthetic {
  return AESTHETICS.find((a) => a.id === id) ?? AESTHETICS[0]
}
