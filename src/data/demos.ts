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
export const AVAILABLE_DEMOS: string[] = []

export function demoUrlFor(exerciseName: string): string | null {
  let slug = exerciseSlug(exerciseName)
  slug = ALIASES[slug] ?? slug
  return AVAILABLE_DEMOS.includes(slug) ? `demos/${slug}.mp4` : null
}
