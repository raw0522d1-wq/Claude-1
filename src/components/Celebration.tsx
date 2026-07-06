interface Props {
  weeklyStreak: number
  weekIndex: number
  onClose: () => void
}

const PIECES = Array.from({ length: 28 }, (_, i) => i)
const COLORS = ['#ff5a1f', '#ff8a3d', '#ffc94d', '#3ddc84', '#eceff4']

/** Full-screen congratulations shown when the weekly target is hit. */
export function Celebration({ weeklyStreak, weekIndex, onClose }: Props) {
  return (
    <div className="celebrate" onClick={onClose}>
      {PIECES.map((i) => (
        <span
          key={i}
          className="confetti"
          style={{
            left: `${(i * 37) % 100}%`,
            background: COLORS[i % COLORS.length],
            animationDelay: `${(i % 10) * 0.12}s`,
            animationDuration: `${2.2 + (i % 5) * 0.35}s`,
          }}
        />
      ))}
      <div className="celebrate-card fade-in" onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 62, lineHeight: 1 }}>🔥</div>
        <p className="kicker" style={{ margin: '14px 0 6px' }}>
          Week {weekIndex + 1} target crushed
        </p>
        <h1 style={{ fontSize: 38 }}>
          {weeklyStreak}-WEEK
          <br />
          STREAK
        </h1>
        <p className="muted small" style={{ margin: '12px 0 20px' }}>
          Every scheduled session, done and photo-proven. This is what the
          standard looks like. Keep the chain alive.
        </p>
        <button className="btn btn-primary" onClick={onClose}>
          Keep Forging
        </button>
      </div>
    </div>
  )
}
