export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function daysBetween(aISO: string, bISO: string): number {
  const a = new Date(aISO + 'T00:00:00')
  const b = new Date(bISO + 'T00:00:00')
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

export function weeksSince(startISO: string): number {
  return Math.max(0, Math.floor(daysBetween(startISO, todayISO()) / 7))
}

/** Current streak of consecutive days (ending today or yesterday) with a workout. */
export function calcStreaks(dates: string[]): { current: number; best: number } {
  const unique = Array.from(new Set(dates)).sort()
  if (unique.length === 0) return { current: 0, best: 0 }

  let best = 1
  let run = 1
  for (let i = 1; i < unique.length; i++) {
    if (daysBetween(unique[i - 1], unique[i]) === 1) {
      run++
      best = Math.max(best, run)
    } else {
      run = 1
    }
  }

  const last = unique[unique.length - 1]
  const gap = daysBetween(last, todayISO())
  const current = gap <= 1 ? run : 0
  return { current, best }
}
