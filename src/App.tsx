import { useState } from 'react'
import { StoreProvider, useStore } from './store'
import { getProgram } from './data/programs'
import { Onboarding } from './components/Onboarding'
import { Home } from './components/Home'
import { Train } from './components/Train'
import { Session } from './components/Session'
import { Fuel } from './components/Fuel'
import { Clips } from './components/Clips'
import { Progress } from './components/Progress'
import { Paywall } from './components/Paywall'

type Tab = 'home' | 'train' | 'fuel' | 'clips' | 'progress'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Base', icon: '🏠' },
  { id: 'train', label: 'Train', icon: '🏋️' },
  { id: 'fuel', label: 'Fuel', icon: '🥩' },
  { id: 'clips', label: 'Clips', icon: '🎥' },
  { id: 'progress', label: 'Progress', icon: '🏆' },
]

function Main() {
  const { state, stats } = useStore()
  const [tab, setTab] = useState<Tab>('home')
  const [inSession, setInSession] = useState(false)
  const [pendingDay, setPendingDay] = useState(0)
  const [paywall, setPaywall] = useState(false)

  if (!state.profile) {
    return (
      <div className="shell">
        <Onboarding />
      </div>
    )
  }

  const program = getProgram(state.profile.programId)
  const suggestedDay = stats.totalWorkouts % program.days.length

  // A persisted active session (e.g. after a page reload) resumes automatically.
  const sessionActive = inSession || state.session !== null

  function startWorkout(dayIndex: number) {
    setPendingDay(dayIndex)
    setInSession(true)
  }

  return (
    <div className="shell">
      {sessionActive ? (
        <Session pendingDayIndex={pendingDay} onExit={() => setInSession(false)} />
      ) : (
        <>
          {tab === 'home' && (
            <Home
              onStartWorkout={() => startWorkout(suggestedDay)}
              onOpenPaywall={() => setPaywall(true)}
            />
          )}
          {tab === 'train' && (
            <Train onStartWorkout={startWorkout} onOpenPaywall={() => setPaywall(true)} />
          )}
          {tab === 'fuel' && <Fuel onOpenPaywall={() => setPaywall(true)} />}
          {tab === 'clips' && <Clips />}
          {tab === 'progress' && <Progress onOpenPaywall={() => setPaywall(true)} />}

          <nav className="nav">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={tab === t.id ? 'active' : ''}
                onClick={() => setTab(t.id)}
              >
                <span className="ico">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>
        </>
      )}
      {paywall && <Paywall onClose={() => setPaywall(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Main />
    </StoreProvider>
  )
}
