import { daysBetween, todayISO } from './dates'

export interface WeeklyStats {
  /** current week index since journey start (0-based) */
  weekIndex: number
  /** unique workout days logged this week */
  count: number
  /** program's scheduled workouts per week */
  target: number
  /** target hit outright this week */
  met: boolean
  /**
   * consecutive weeks hitting the target, mulligan-aware — one missed
   * workout per week is forgiven. Includes the current week once met.
   */
  weeklyStreak: number
  /** last completed week only survived because of the mulligan */
  mulliganSavedLastWeek: boolean
  /** workouts still needed this week (after which the celebration fires) */
  remaining: number
}

export function calcWeekly(
  workoutDates: string[],
  startISO: string,
  target: number,
): WeeklyStats {
  const currentWeek = Math.max(0, Math.floor(daysBetween(startISO, todayISO()) / 7))

  const byWeek = new Map<number, Set<string>>()
  for (const d of workoutDates) {
    const w = Math.floor(daysBetween(startISO, d) / 7)
    if (w < 0) continue
    if (!byWeek.has(w)) byWeek.set(w, new Set())
    byWeek.get(w)!.add(d)
  }
  const countOf = (w: number) => byWeek.get(w)?.size ?? 0

  // The mulligan: a week still counts if exactly one scheduled workout was missed.
  const metOutright = (w: number) => countOf(w) >= target
  const metWithMulligan = (w: number) => countOf(w) >= Math.max(1, target - 1)

  let streak = 0
  for (let w = currentWeek - 1; w >= 0 && metWithMulligan(w); w--) streak++

  const count = countOf(currentWeek)
  const met = count >= target
  if (met) streak += 1

  return {
    weekIndex: currentWeek,
    count,
    target,
    met,
    weeklyStreak: streak,
    mulliganSavedLastWeek:
      currentWeek > 0 &&
      !metOutright(currentWeek - 1) &&
      metWithMulligan(currentWeek - 1),
    remaining: Math.max(0, target - count),
  }
}
