import { MILESTONES, levelFor } from '../data/milestones'
import { useStore } from '../store'

interface Props {
  onOpenPaywall: () => void
}

export function Progress({ onOpenPaywall }: Props) {
  const { state, stats, claimMilestone, resetAll } = useStore()
  const profile = state.profile!
  const level = levelFor(stats.totalXp)
  const photos = [...state.photos].reverse()
  const visiblePhotos = profile.premium ? photos : photos.slice(0, 6)

  const unlockedCount = MILESTONES.filter((m) => m.isMet(stats)).length

  return (
    <div className="screen fade-in">
      <p className="kicker">Progress</p>
      <h1 style={{ fontSize: 26, margin: '6px 0 14px' }}>The Receipts</h1>

      <div className="hero" style={{ textAlign: 'center' }}>
        <p className="kicker">Rank</p>
        <h1 style={{ fontSize: 40, margin: '4px 0 10px' }}>{level.current.name}</h1>
        <div className="bar" style={{ maxWidth: 260, margin: '0 auto 8px' }}>
          <div style={{ width: `${level.progress * 100}%` }} />
        </div>
        <p className="small muted">
          {stats.totalXp.toLocaleString()} XP
          {level.next ? ` · ${(level.next.minXp - stats.totalXp).toLocaleString()} to ${level.next.name}` : ' · MAX RANK'}
        </p>
      </div>

      <div className="grid-3" style={{ marginTop: 14 }}>
        <div className="stat">
          <div className="value accent">{stats.currentStreak}</div>
          <div className="label">Streak</div>
        </div>
        <div className="stat">
          <div className="value">🔥{stats.weeklyStreak}</div>
          <div className="label">Week Streak</div>
        </div>
        <div className="stat">
          <div className="value">{stats.totalWorkouts}</div>
          <div className="label">Workouts</div>
        </div>
      </div>
      <p className="small muted" style={{ marginTop: 10 }}>
        Week streak counts every week you hit your program&apos;s scheduled
        sessions ({stats.weekCount}/{stats.weekTarget} this week). One missed
        workout per week is forgiven by your mulligan — two breaks the chain.
      </p>

      <div className="section-head">
        <h2>Milestones</h2>
        <span className="small muted">
          {unlockedCount}/{MILESTONES.length} unlocked
        </span>
      </div>
      {MILESTONES.map((m) => {
        const unlocked = m.isMet(stats)
        const claimed = state.claimedMilestones.includes(m.id)
        return (
          <div key={m.id} className={`milestone ${unlocked ? 'unlocked' : ''}`}>
            <div className="m-ico">{m.rewardIcon}</div>
            <div>
              <h3 style={{ fontSize: 14 }}>{m.title}</h3>
              <p className="small muted" style={{ marginTop: 2 }}>
                {m.requirement}
              </p>
              <p className="small" style={{ color: 'var(--gold)', marginTop: 2 }}>
                🎁 {m.reward}
              </p>
            </div>
            <div className="m-claim">
              {claimed ? (
                <span className="chip gold">CLAIMED</span>
              ) : unlocked ? (
                <button onClick={() => claimMilestone(m.id)}>
                  CLAIM +{m.xp} XP
                </button>
              ) : (
                <span className="chip">🔒</span>
              )}
            </div>
          </div>
        )
      })}

      <div className="section-head">
        <h2>Photo Proof</h2>
        <span className="small muted">{photos.length} banked</span>
      </div>
      {photos.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 30 }}>📸</p>
          <p className="muted small" style={{ marginTop: 8 }}>
            Your check-in and check-out photos land here — a timeline of the
            transformation, session by session.
          </p>
        </div>
      ) : (
        <>
          <div className="photo-grid">
            {visiblePhotos.map((p) => (
              <div key={p.id} className="photo-frame">
                <img src={p.dataUrl} alt={`${p.kind === 'in' ? 'Check-in' : 'Check-out'} ${p.date}`} />
                <span className="tag">{p.kind === 'in' ? 'IN' : 'OUT'}</span>
                <span className="date">{p.date.slice(5)}</span>
              </div>
            ))}
          </div>
          {!profile.premium && photos.length > 6 && (
            <div className="card" style={{ textAlign: 'center', marginTop: 12 }}>
              <p className="muted small" style={{ marginBottom: 12 }}>
                🔒 {photos.length - 6} older photos in your transformation
                timeline — Premium keeps the full archive.
              </p>
              <button className="btn btn-primary" onClick={onOpenPaywall}>
                Unlock Full Timeline
              </button>
            </div>
          )}
        </>
      )}

      <hr className="divider" />
      <button
        className="btn btn-danger"
        onClick={() => {
          if (confirm('Wipe all data and start over? This cannot be undone.')) {
            resetAll()
          }
        }}
      >
        Reset Everything
      </button>
    </div>
  )
}
