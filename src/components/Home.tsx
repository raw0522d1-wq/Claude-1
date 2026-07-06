import { getAesthetic } from '../data/aesthetics'
import { getProgram } from '../data/programs'
import { TIP_CATEGORIES, weeklyTips } from '../data/tips'
import { levelFor } from '../data/milestones'
import { useStore } from '../store'

interface Props {
  onStartWorkout: () => void
  onOpenPaywall: () => void
}

export function Home({ onStartWorkout, onOpenPaywall }: Props) {
  const { state, stats } = useStore()
  const profile = state.profile!
  const aesthetic = getAesthetic(profile.aestheticId)
  const program = getProgram(profile.programId)
  const level = levelFor(stats.totalXp)
  const tips = weeklyTips(stats.weeksIn)
  const dayIndex = stats.totalWorkouts % program.days.length
  const today = program.days[dayIndex]
  const locked = program.premium && !profile.premium

  return (
    <div className="screen fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <p className="kicker">{level.current.name}</p>
          <h1 style={{ fontSize: 28 }}>{profile.name}</h1>
        </div>
        {profile.premium ? (
          <span className="chip gold">★ PREMIUM</span>
        ) : (
          <button
            className="chip accent"
            style={{ cursor: 'pointer', border: '1px solid rgba(255,90,31,0.4)', background: 'var(--accent-dim)', fontFamily: 'inherit' }}
            onClick={onOpenPaywall}
          >
            Go Premium →
          </button>
        )}
      </div>

      <div className="hero">
        <p className="kicker">
          {aesthetic.icon} {aesthetic.name} · Week {stats.weeksIn + 1}
        </p>
        <h2 style={{ margin: '8px 0 2px' }}>{today.title}</h2>
        <p className="muted small" style={{ marginBottom: 14 }}>
          {program.name} — {today.exercises.length} movements ·{' '}
          {today.focus.toUpperCase()}
        </p>
        {locked ? (
          <button className="btn btn-primary" onClick={onOpenPaywall}>
            🔒 Unlock {program.name} with Premium
          </button>
        ) : (
          <button className="btn btn-primary" onClick={onStartWorkout}>
            📸 Check In & Start
          </button>
        )}
      </div>

      <div className="grid-3" style={{ marginTop: 14 }}>
        <div className="stat">
          <div className="value accent">{stats.currentStreak}</div>
          <div className="label">Day Streak</div>
        </div>
        <div className="stat">
          <div className="value">{stats.totalWorkouts}</div>
          <div className="label">Workouts</div>
        </div>
        <div className="stat">
          <div className="value">{stats.totalXp.toLocaleString()}</div>
          <div className="label">XP</div>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span className="small muted">
            Level progress {level.next ? `→ ${level.next.name}` : '· MAX'}
          </span>
          <span className="small muted">{Math.round(level.progress * 100)}%</span>
        </div>
        <div className="bar">
          <div style={{ width: `${level.progress * 100}%` }} />
        </div>
      </div>

      <div className="section-head">
        <h2>This Week&apos;s Protocol</h2>
        <span className="small muted">Week {stats.weeksIn + 1}</span>
      </div>
      <p className="muted small" style={{ marginBottom: 12 }}>
        Five fresh tips every week — diet, stretching, aerobic, anaerobic and
        resistance. Small edges, compounded.
      </p>
      {tips.map((tip) => {
        const cat = TIP_CATEGORIES.find((c) => c.key === tip.category)!
        return (
          <div key={tip.category} className="card tip-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 15 }}>{tip.title}</h3>
              <span className="chip">
                {cat.icon} {cat.label}
              </span>
            </div>
            <p className="muted small" style={{ marginTop: 8 }}>
              {tip.body}
            </p>
          </div>
        )
      })}
    </div>
  )
}
