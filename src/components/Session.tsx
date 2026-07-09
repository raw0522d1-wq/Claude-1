import { useEffect, useMemo, useState } from 'react'
import { getProgram } from '../data/programs'
import { demoUrlFor } from '../data/demos'
import { useStore } from '../store'
import { PhotoCapture } from './PhotoCapture'
import { Celebration } from './Celebration'
import { DemoModal } from './DemoModal'
import type { WorkoutLog } from '../types'

interface Props {
  /** day chosen before check-in (only used when no session is active yet) */
  pendingDayIndex: number
  onExit: () => void
}

function fmtDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

export function Session({ pendingDayIndex, onExit }: Props) {
  const { state, stats, startSession, toggleExercise, finishSession, abandonSession } = useStore()
  const profile = state.profile!
  const session = state.session
  const programId = session?.programId ?? profile.programId
  const dayIndex = session?.dayIndex ?? pendingDayIndex
  const program = getProgram(programId)
  const day = program.days[Math.min(dayIndex, program.days.length - 1)]

  const [now, setNow] = useState(Date.now())
  const [checkingOut, setCheckingOut] = useState(false)
  const [summary, setSummary] = useState<WorkoutLog | null>(null)
  const [celebrated, setCelebrated] = useState(false)
  const [demo, setDemo] = useState<{ name: string; url: string } | null>(null)

  useEffect(() => {
    if (!session) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [session])

  const doneCount = session?.doneExercises.length ?? 0
  const progress = day.exercises.length
    ? doneCount / day.exercises.length
    : 0

  const checkInPhoto = useMemo(
    () => state.photos.find((p) => p.id === session?.checkInPhotoId) ?? null,
    [state.photos, session],
  )

  // ---------- post-workout summary ----------
  if (summary) {
    const outPhoto = state.photos.find((p) => p.id === summary.checkOutPhotoId)
    // This workout was the one that hit the weekly target — celebrate.
    const justHitTarget =
      stats.weekTargetMet && stats.weekCount === stats.weekTarget
    if (justHitTarget && !celebrated) {
      return (
        <Celebration
          weeklyStreak={stats.weeklyStreak}
          weekIndex={stats.weeksIn}
          onClose={() => setCelebrated(true)}
        />
      )
    }
    return (
      <div className="screen fade-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p className="kicker" style={{ textAlign: 'center' }}>Workout Banked</p>
        <h1 style={{ textAlign: 'center', margin: '8px 0 18px' }}>+{summary.xp} XP</h1>
        <div className="grid-2" style={{ maxWidth: 300, margin: '0 auto 18px' }}>
          {checkInPhoto && (
            <div className="photo-frame">
              <img src={checkInPhoto.dataUrl} alt="Check-in" />
              <span className="tag">IN</span>
            </div>
          )}
          {outPhoto && (
            <div className="photo-frame">
              <img src={outPhoto.dataUrl} alt="Check-out" />
              <span className="tag">OUT</span>
            </div>
          )}
        </div>
        <div className="grid-3" style={{ marginBottom: 20 }}>
          <div className="stat">
            <div className="value">{fmtDuration((summary.finishedAt ?? 0) - summary.startedAt)}</div>
            <div className="label">Duration</div>
          </div>
          <div className="stat">
            <div className="value">
              {summary.completedExercises}/{summary.totalExercises}
            </div>
            <div className="label">Movements</div>
          </div>
          <div className="stat">
            <div className="value accent">+{summary.xp}</div>
            <div className="label">XP Earned</div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={onExit}>
          Done — Back to Base
        </button>
      </div>
    )
  }

  // ---------- check-in gate ----------
  if (!session) {
    return (
      <div className="screen fade-in">
        <p className="kicker">Session Gate</p>
        <h1 style={{ fontSize: 26, margin: '6px 0 2px' }}>{day.title}</h1>
        <p className="muted small" style={{ marginBottom: 18 }}>
          {program.name} · {day.exercises.length} movements
        </p>
        <PhotoCapture
          kind="in"
          onCapture={(dataUrl) => startSession(programId, dayIndex, dataUrl)}
        />
        <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={onExit}>
          Not now
        </button>
      </div>
    )
  }

  // ---------- check-out gate ----------
  if (checkingOut) {
    return (
      <div className="screen fade-in">
        <p className="kicker">Finish Line</p>
        <h1 style={{ fontSize: 26, margin: '6px 0 2px' }}>Prove It</h1>
        <p className="muted small" style={{ marginBottom: 18 }}>
          {doneCount}/{day.exercises.length} movements done ·{' '}
          {fmtDuration(now - session.startedAt)} elapsed
        </p>
        <PhotoCapture
          kind="out"
          onCapture={(dataUrl) => {
            const log = finishSession(dataUrl, day.exercises.length)
            setSummary(log)
          }}
        />
        <button
          className="btn btn-ghost"
          style={{ marginTop: 14 }}
          onClick={() => setCheckingOut(false)}
        >
          Back to workout
        </button>
      </div>
    )
  }

  // ---------- live session ----------
  return (
    <div className="screen fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p className="kicker">● Live Session</p>
          <h2 style={{ margin: '6px 0 2px' }}>{day.title}</h2>
        </div>
        {checkInPhoto && (
          <div className="photo-frame" style={{ width: 52, aspectRatio: '1' }}>
            <img src={checkInPhoto.dataUrl} alt="Check-in" />
          </div>
        )}
      </div>

      <div className="timer" style={{ margin: '18px 0 6px' }}>
        {fmtDuration(now - session.startedAt)}
      </div>
      <div className="bar" style={{ marginBottom: 4 }}>
        <div style={{ width: `${progress * 100}%` }} />
      </div>
      <p className="small muted" style={{ textAlign: 'center', marginBottom: 18 }}>
        {doneCount} of {day.exercises.length} movements complete
      </p>

      {day.exercises.map((ex, i) => {
        const done = session.doneExercises.includes(i)
        const demoUrl = demoUrlFor(ex.name)
        return (
          <div
            key={i}
            className={`ex-row ${done ? 'done' : ''}`}
            onClick={() => toggleExercise(i)}
          >
            <div className="ex-check">{done ? '✓' : ''}</div>
            <div style={{ flex: 1 }}>
              <div className="ex-name">{ex.name}</div>
              <div className="ex-meta">
                {ex.sets} × {ex.reps} · rest {ex.rest}
              </div>
            </div>
            {demoUrl && (
              <button
                className="demo-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  setDemo({ name: ex.name, url: demoUrl })
                }}
              >
                ▶ Demo
              </button>
            )}
          </div>
        )
      })}
      {demo && (
        <DemoModal exerciseName={demo.name} url={demo.url} onClose={() => setDemo(null)} />
      )}

      <button
        className="btn btn-primary"
        style={{ marginTop: 12 }}
        onClick={() => setCheckingOut(true)}
      >
        📸 Check Out & Complete
      </button>
      <button
        className="btn btn-danger"
        style={{ marginTop: 10 }}
        onClick={() => {
          if (confirm('Abandon this session? No XP will be earned.')) {
            abandonSession()
            onExit()
          }
        }}
      >
        Abandon Session
      </button>
    </div>
  )
}
