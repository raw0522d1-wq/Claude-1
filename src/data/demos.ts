/**
 * Animated exercise demos — 5-second stylized loops (bold-ink comic-book
 * animation) generated with Higgsfield and stored in `public/demos/`.
 *
 * `AVAILABLE_DEMOS` lists the clips that exist on disk. To add more, generate
 * a clip with the prompt template in `scripts/demo-prompts.json`, drop the
 * mp4 in `public/demos/<slug>.mp4`, and add the slug here.
 */

export function exerciseSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Near-duplicate movements share one clip. */
const ALIASES: Record<string, string> = {
  'bench-press': 'barbell-bench-press',
  'lateral-raise': 'lateral-raises',
  'incline-barbell-press': 'incline-bench-press',
  'incline-dumbbell-press': 'incline-bench-press',
  'hanging-knee-raise': 'hanging-leg-raise',
  'hill-treadmill-sprints': 'sprints',
  '400-m-repeats-5k-effort': 'sprints',
  'tempo-run': 'running',
  'long-easy-run-ruck': 'running',
  'outdoor-walk-run-ruck': 'running',
  'incline-walk-easy-run': 'running',
  'warm-up-jog-drills': 'running',
  strides: 'sprints',
  'cooldown-calf-stretch': 'full-body-stretch',
  'mobility-cooldown': 'full-body-stretch',
  'hip-mobility-flow': 'full-body-stretch',
}

/** Slugs with a generated clip in public/demos/. Update as clips land. */
export const AVAILABLE_DEMOS: string[] = [
  'ab-wheel-rollout',
  'assault-bike-sprints',
  'barbell-back-squat',
  'barbell-bench-press',
  'barbell-curl',
  'barbell-row',
  'battle-ropes',
  'box-jumps',
  'bulgarian-split-squat',
  'burpees',
  'cable-fly',
  'cable-triceps-pushdown',
  'close-grip-bench-press',
  'deadlift',
  'dips',
  'dumbbell-pullover',
  'face-pulls',
  'farmer-s-carry',
  'front-squat',
  'full-body-resistance-circuit',
  'full-body-stretch',
  'goblet-squat',
  'hammer-curl',
  'hanging-leg-raise',
  'incline-bench-press',
  'incline-dumbbell-curl',
  'kettlebell-swings',
  'leg-curl',
  'leg-press',
  'lateral-raises',
  'lunges',
  'nordic-curl-leg-curl',
  'one-arm-dumbbell-row',
  'overhead-press',
  'overhead-triceps-extension',
  'plank',
  'push-up-to-renegade-row',
  'romanian-deadlift',
  'running',
  'seated-dumbbell-press',
  'side-plank',
  'sprints',
  'standing-calf-raise',
  't-bar-row',
  'trap-bar-deadlift',
  'weighted-pull-ups',
  'weighted-sit-ups',
]

export function demoUrlFor(exerciseName: string): string | null {
  let slug = exerciseSlug(exerciseName)
  slug = ALIASES[slug] ?? slug
  return AVAILABLE_DEMOS.includes(slug) ? `demos/${slug}.mp4` : null
}
