import type { Tip } from '../types'

export const TIP_CATEGORIES: { key: Tip['category']; label: string; icon: string }[] = [
  { key: 'diet', label: 'Diet', icon: '🥩' },
  { key: 'stretching', label: 'Stretching', icon: '🧘' },
  { key: 'aerobic', label: 'Aerobic', icon: '🏃' },
  { key: 'anaerobic', label: 'Anaerobic', icon: '💥' },
  { key: 'resistance', label: 'Resistance', icon: '🏋️' },
]

/** Rotating weekly tips — one per category, keyed off weeks since start. */
export const TIPS: Record<Tip['category'], Tip[]> = {
  diet: [
    {
      category: 'diet',
      title: 'Protein anchors every plate',
      body: 'Build each meal around a palm-to-two-palm portion of protein first. It protects muscle in a deficit, drives growth in a surplus, and keeps you full either way.',
    },
    {
      category: 'diet',
      title: 'Track for 7 days, then relax',
      body: 'You can’t manage what you never measured. Log everything for one honest week to calibrate your eyes — then portion by feel with real accuracy.',
    },
    {
      category: 'diet',
      title: 'The grocery-cart rule',
      body: 'Abs are built in the cart, not the kitchen. If it doesn’t enter the house, willpower at 10 pm is never tested. Shop the perimeter: meat, eggs, produce, dairy.',
    },
    {
      category: 'diet',
      title: 'Pre-log your weekend',
      body: 'Most physiques are lost Friday–Sunday. Decide your meals before the weekend starts and bank a few hundred calories earlier in the day for social events.',
    },
    {
      category: 'diet',
      title: 'Salt, water, electrolytes',
      body: 'Training hard with clean food often means under-salted. If you feel flat, headachy, or weak mid-session, add electrolytes — performance jumps immediately.',
    },
  ],
  stretching: [
    {
      category: 'stretching',
      title: 'Stretch what you trained',
      body: 'Finish every session with 5 minutes on the muscles you just worked, 30–45 seconds per hold. Flexibility gains come from consistency, not marathon sessions.',
    },
    {
      category: 'stretching',
      title: 'Hips are the masculine posture fix',
      body: 'Sitting shortens hip flexors and steals your squat depth and stance. Couch stretch, 2 minutes per side, daily. Your deadlift and your posture both improve.',
    },
    {
      category: 'stretching',
      title: 'Dynamic before, static after',
      body: 'Before training: leg swings, arm circles, walking lunges — movement prep. Static holds belong after, when muscles are warm and can actually lengthen.',
    },
    {
      category: 'stretching',
      title: 'Thoracic mobility = bigger lifts',
      body: 'A stiff upper back caps your bench arch and overhead press. Foam-roll the T-spine and do open-books before push day — instant range, safer shoulders.',
    },
    {
      category: 'stretching',
      title: 'The 90-second morning flow',
      body: 'World’s greatest stretch, one per side, plus a deep squat hold. 90 seconds after waking sets your joints for the day and costs you nothing.',
    },
  ],
  aerobic: [
    {
      category: 'aerobic',
      title: 'Zone 2 is the base of the pyramid',
      body: '2–3 weekly sessions at a pace where you can talk builds the engine that powers recovery between sets, faster fat loss, and a stronger heart.',
    },
    {
      category: 'aerobic',
      title: 'Walk 8–10k steps, daily',
      body: 'Steps are the stealth fat-loss tool — hundreds of calories burned without touching recovery. Take calls walking. Park far. Stack it invisibly.',
    },
    {
      category: 'aerobic',
      title: 'Cardio after lifting, not before',
      body: 'Lift fresh, then do your cardio. Reversing the order costs you strength output — and strength is what keeps muscle while you lean out.',
    },
    {
      category: 'aerobic',
      title: 'The incline treadmill cheat code',
      body: '12% incline, 3 mph, 30 minutes — low impact, high burn, no interference with leg day. The viral protocol works because it’s repeatable.',
    },
    {
      category: 'aerobic',
      title: 'Nasal breathing gauge',
      body: 'If you can keep nasal-only breathing, you’re in the aerobic zone. The moment your mouth opens, you’ve crossed into harder territory. Use it as a live meter.',
    },
  ],
  anaerobic: [
    {
      category: 'anaerobic',
      title: 'Sprints: the biggest bang per minute',
      body: '6–8 × 15-second all-out sprints with full recovery torch fat, spike growth hormone, and build legs. Once a week is enough. Warm up thoroughly.',
    },
    {
      category: 'anaerobic',
      title: 'Earn the intensity',
      body: 'HIIT works because it’s hard — twice a week max. More than that and you’re stealing recovery from lifting. Intensity is a scalpel, not a hammer.',
    },
    {
      category: 'anaerobic',
      title: 'Full recovery between efforts',
      body: 'True anaerobic power needs 1:4 work-to-rest. If your 8th sprint looks like your 1st, you rested right. If it looks like a jog, you turned it into cardio.',
    },
    {
      category: 'anaerobic',
      title: 'Finish with a finisher',
      body: 'End lifts with 4 minutes of kettlebell swings or bike sprints (20 s on / 10 s off). Conditioning improves, session total stays tight, discipline compounds.',
    },
    {
      category: 'anaerobic',
      title: 'Hill sprints protect your hamstrings',
      body: 'Want sprint benefits with lower injury risk? Run hills. The incline shortens ground contact and forces mechanics that protect hamstrings.',
    },
  ],
  resistance: [
    {
      category: 'resistance',
      title: 'Progressive overload or nothing',
      body: 'Add a rep, add 2.5 kg, or slow the negative — every week, something must progress. Log your lifts; a program without progression is just exercise.',
    },
    {
      category: 'resistance',
      title: 'Own the last 3 reps',
      body: 'Growth lives in the reps you want to quit. Take working sets 1–3 reps shy of failure — close enough to hurt, controlled enough to repeat.',
    },
    {
      category: 'resistance',
      title: 'Compound first, always',
      body: 'Squat, hinge, press, pull — spend your freshest energy on the lifts that build the frame. Isolation work is dessert, not dinner.',
    },
    {
      category: 'resistance',
      title: 'Full range beats heavy half-reps',
      body: 'Deep stretch under load is a primary growth signal. Drop the weight 10%, touch full range, and watch stubborn muscles finally move.',
    },
    {
      category: 'resistance',
      title: 'Deload before you break',
      body: 'Every 6–8 weeks, take a week at 60% volume. Joints recover, bar speed returns, and you come back stronger. Deloads are an investment, not a retreat.',
    },
  ],
}

export function weeklyTips(weeksIn: number): Tip[] {
  return TIP_CATEGORIES.map(({ key }) => {
    const list = TIPS[key]
    return list[((weeksIn % list.length) + list.length) % list.length]
  })
}
