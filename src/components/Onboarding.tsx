import { useState } from 'react'
import { AESTHETICS } from '../data/aesthetics'
import { programsForAesthetic } from '../data/programs'
import { todayISO } from '../lib/dates'
import { ftInToCm, lbsToKg } from '../lib/units'
import { useStore } from '../store'
import type { Sex, UnitSystem, UserProfile } from '../types'
import { APP_NAME, APP_TAGLINE } from '../config'

const ACTIVITY_OPTIONS = [
  { value: 1.2, label: 'Desk life — little exercise' },
  { value: 1.375, label: 'Light — 1–3 sessions / week' },
  { value: 1.55, label: 'Moderate — 3–5 sessions / week' },
  { value: 1.725, label: 'Hard — 6–7 sessions / week' },
  { value: 1.9, label: 'Savage — physical job + training' },
]

export function Onboarding() {
  const { setProfile } = useStore()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [sex, setSex] = useState<Sex>('male')
  const [age, setAge] = useState(28)
  const [units, setUnits] = useState<UnitSystem>('imperial')
  // metric inputs
  const [heightCm, setHeightCm] = useState(180)
  const [weightKg, setWeightKg] = useState(82)
  // imperial inputs
  const [heightFt, setHeightFt] = useState(5)
  const [heightIn, setHeightIn] = useState(11)
  const [weightLbs, setWeightLbs] = useState(180)
  const [activity, setActivity] = useState(1.55)
  const [aestheticId, setAestheticId] = useState<string | null>(null)
  const [programId, setProgramId] = useState<string | null>(null)

  // canonical metric values regardless of the chosen input system
  const finalHeightCm = units === 'imperial' ? ftInToCm(heightFt, heightIn) : heightCm
  const finalWeightKg = units === 'imperial' ? lbsToKg(weightLbs) : weightKg

  function finish() {
    if (!aestheticId || !programId) return
    const profile: UserProfile = {
      name: name.trim() || 'Athlete',
      sex,
      age,
      units,
      heightCm: finalHeightCm,
      weightKg: finalWeightKg,
      activity,
      aestheticId,
      programId,
      premium: false,
      startDate: todayISO(),
    }
    setProfile(profile)
  }

  return (
    <div className="screen fade-in" style={{ paddingBottom: 32 }}>
      {step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '82vh', justifyContent: 'center' }}>
          <p className="kicker">No shortcuts. Just proof.</p>
          <h1 style={{ fontSize: 56, margin: '10px 0 8px' }}>{APP_NAME}</h1>
          <p className="muted" style={{ fontSize: 17, marginBottom: 8 }}>
            {APP_TAGLINE}
          </p>
          <p className="muted small" style={{ marginBottom: 36 }}>
            Pick the physique you want. Run proven programs. Fuel with precision.
            Check in with a photo before every session — check out with one after.
            Earn your milestones.
          </p>
          <button className="btn btn-primary" onClick={() => setStep(1)}>
            Begin The Work
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="fade-in">
          <p className="kicker">Step 1 / 3</p>
          <h2 style={{ margin: '8px 0 4px' }}>Your Baseline</h2>
          <p className="muted small" style={{ marginBottom: 20 }}>
            We use this to calculate your exact calories and macros.
          </p>

          <label className="field">
            <span>Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What do we call you?"
            />
          </label>

          <div className="field">
            <span
              style={{
                display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 7,
              }}
            >
              Measurement System
            </span>
            <div className="seg">
              <button
                type="button"
                className={units === 'imperial' ? 'on' : ''}
                onClick={() => setUnits('imperial')}
              >
                Imperial (ft · lbs)
              </button>
              <button
                type="button"
                className={units === 'metric' ? 'on' : ''}
                onClick={() => setUnits('metric')}
              >
                Metric (cm · kg)
              </button>
            </div>
          </div>

          <div className="grid-2">
            <label className="field">
              <span>Sex</span>
              <select value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
            <label className="field">
              <span>Age</span>
              <input
                type="number"
                inputMode="numeric"
                value={age}
                min={14}
                max={90}
                onChange={(e) => setAge(Number(e.target.value) || 0)}
              />
            </label>
          </div>

          {units === 'imperial' ? (
            <div className="grid-3">
              <label className="field">
                <span>Height (ft)</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={3}
                  max={8}
                  value={heightFt}
                  onChange={(e) => setHeightFt(Number(e.target.value) || 0)}
                />
              </label>
              <label className="field">
                <span>Height (in)</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={11}
                  value={heightIn}
                  onChange={(e) => setHeightIn(Number(e.target.value) || 0)}
                />
              </label>
              <label className="field">
                <span>Weight (lbs)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(Number(e.target.value) || 0)}
                />
              </label>
            </div>
          ) : (
            <div className="grid-2">
              <label className="field">
                <span>Height (cm)</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value) || 0)}
                />
              </label>
              <label className="field">
                <span>Weight (kg)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value) || 0)}
                />
              </label>
            </div>
          )}
          <label className="field">
            <span>Activity Level</span>
            <select
              value={activity}
              onChange={(e) => setActivity(Number(e.target.value))}
            >
              {ACTIVITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <button
            className="btn btn-primary"
            style={{ marginTop: 8 }}
            disabled={age <= 0 || finalHeightCm <= 0 || finalWeightKg <= 0}
            onClick={() => setStep(2)}
          >
            Next — Choose Your Physique
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="fade-in">
          <p className="kicker">Step 2 / 3</p>
          <h2 style={{ margin: '8px 0 4px' }}>Choose Your Aesthetic</h2>
          <p className="muted small" style={{ marginBottom: 18 }}>
            The look you pick drives your training style and nutrition targets.
          </p>
          {AESTHETICS.map((a) => (
            <div
              key={a.id}
              className={`card selectable ${aestheticId === a.id ? 'selected' : ''}`}
              onClick={() => setAestheticId(a.id)}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 30 }}>{a.icon}</span>
                <div>
                  <h3>{a.name}</h3>
                  <p className="small" style={{ color: 'var(--accent-2)' }}>
                    {a.headline}
                  </p>
                </div>
              </div>
              <p className="muted small" style={{ margin: '10px 0' }}>
                {a.description}
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {a.traits.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <button
            className="btn btn-primary"
            style={{ marginTop: 16 }}
            disabled={!aestheticId}
            onClick={() => setStep(3)}
          >
            Next — Pick Your Program
          </button>
        </div>
      )}

      {step === 3 && aestheticId && (
        <div className="fade-in">
          <p className="kicker">Step 3 / 3</p>
          <h2 style={{ margin: '8px 0 4px' }}>Pick Your Program</h2>
          <p className="muted small" style={{ marginBottom: 18 }}>
            Ordered by best fit for your aesthetic. PRO programs unlock with
            Premium — you can switch anytime.
          </p>
          {programsForAesthetic(aestheticId).map((p) => (
            <div
              key={p.id}
              className={`card selectable ${programId === p.id ? 'selected' : ''}`}
              onClick={() => setProgramId(p.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <h3>{p.name}</h3>
                {p.premium && <span className="pro-tag">PRO</span>}
              </div>
              <p className="small muted" style={{ margin: '4px 0 8px' }}>
                {p.origin}
              </p>
              <p className="small" style={{ marginBottom: 10 }}>{p.tagline}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="chip accent">{p.daysPerWeek} days/wk</span>
                <span className="chip">{p.weeks} weeks</span>
                <span className="chip">{p.level}</span>
              </div>
            </div>
          ))}
          <button
            className="btn btn-primary"
            style={{ marginTop: 16 }}
            disabled={!programId}
            onClick={finish}
          >
            Lock It In
          </button>
        </div>
      )}
    </div>
  )
}
