import { useState } from 'react'
import { PROGRAMS, getProgram } from '../data/programs'
import { demoUrlFor } from '../data/demos'
import { useStore } from '../store'
import { DemoModal } from './DemoModal'

interface Props {
  onStartWorkout: (dayIndex: number) => void
  onOpenPaywall: () => void
}

export function Train({ onStartWorkout, onOpenPaywall }: Props) {
  const { state, stats, updateProfile } = useStore()
  const profile = state.profile!
  const program = getProgram(profile.programId)
  const suggestedDay = stats.totalWorkouts % program.days.length
  const [openDay, setOpenDay] = useState<number>(suggestedDay)
  const [switching, setSwitching] = useState(false)
  const [demo, setDemo] = useState<{ name: string; url: string } | null>(null)
  const locked = program.premium && !profile.premium

  if (switching) {
    return (
      <div className="screen fade-in">
        <p className="kicker">Program Library</p>
        <h1 style={{ fontSize: 26, margin: '6px 0 14px' }}>Switch Program</h1>
        {PROGRAMS.map((p) => {
          const isLocked = p.premium && !profile.premium
          const isCurrent = p.id === profile.programId
          return (
            <div
              key={p.id}
              className={`card selectable ${isCurrent ? 'selected' : ''}`}
              onClick={() => {
                if (isLocked) {
                  onOpenPaywall()
                  return
                }
                updateProfile({ programId: p.id })
                setSwitching(false)
                setOpenDay(0)
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <h3>{p.name}</h3>
                {p.premium && <span className="pro-tag">{isLocked ? '🔒 PRO' : 'PRO'}</span>}
              </div>
              <p className="small muted" style={{ margin: '4px 0 8px' }}>{p.tagline}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="chip accent">{p.daysPerWeek} days/wk</span>
                <span className="chip">{p.weeks} weeks</span>
                <span className="chip">{p.level}</span>
              </div>
            </div>
          )
        })}
        <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={() => setSwitching(false)}>
          Back
        </button>
      </div>
    )
  }

  return (
    <div className="screen fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p className="kicker">Your Program</p>
          <h1 style={{ fontSize: 26, margin: '6px 0 2px' }}>{program.name}</h1>
          <p className="muted small">{program.origin}</p>
        </div>
        {program.premium && <span className="pro-tag">PRO</span>}
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '12px 0 4px' }}>
        <span className="chip accent">{program.daysPerWeek} days/wk</span>
        <span className="chip">{program.weeks} weeks</span>
        <span className="chip">{program.level}</span>
      </div>

      <button
        className="btn btn-ghost"
        style={{ margin: '14px 0 6px' }}
        onClick={() => setSwitching(true)}
      >
        Browse / Switch Programs
      </button>

      <div className="section-head">
        <h2>Training Days</h2>
        <span className="small muted">Up next: Day {suggestedDay + 1}</span>
      </div>

      {program.days.map((day, i) => (
        <div key={i} className="card">
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setOpenDay(openDay === i ? -1 : i)}
          >
            <div>
              <h3 style={{ fontSize: 15 }}>{day.title}</h3>
              <p className="small muted" style={{ marginTop: 3 }}>
                {day.exercises.length} movements · {day.focus.toUpperCase()}
                {i === suggestedDay ? ' · UP NEXT' : ''}
              </p>
            </div>
            <span className="muted">{openDay === i ? '−' : '+'}</span>
          </div>
          {openDay === i && (
            <div className="fade-in" style={{ marginTop: 12 }}>
              {day.exercises.map((ex, j) => {
                const demoUrl = demoUrlFor(ex.name)
                return (
                  <div key={j} className="ex-row" style={{ cursor: 'default' }}>
                    <div style={{ flex: 1 }}>
                      <div className="ex-name">{ex.name}</div>
                      <div className="ex-meta">
                        {ex.sets} × {ex.reps} · rest {ex.rest}
                      </div>
                    </div>
                    {demoUrl && (
                      <button
                        className="demo-btn"
                        onClick={() => setDemo({ name: ex.name, url: demoUrl })}
                      >
                        ▶ Demo
                      </button>
                    )}
                  </div>
                )
              })}
              {locked ? (
                <button className="btn btn-primary" onClick={onOpenPaywall}>
                  🔒 Unlock with Premium
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => onStartWorkout(i)}>
                  📸 Check In & Start This Day
                </button>
              )}
            </div>
          )}
        </div>
      ))}
      {demo && (
        <DemoModal exerciseName={demo.name} url={demo.url} onClose={() => setDemo(null)} />
      )}
    </div>
  )
}
