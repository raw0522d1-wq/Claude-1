import { useStore } from '../store'
import type { WorkoutLocation } from '../data/homeSwaps'

/** Where are you training today? Gym uses the full program; Home swaps in bodyweight/functional work. */
export function LocationToggle() {
  const { state, updateProfile } = useStore()
  const location: WorkoutLocation = state.profile?.location ?? 'gym'
  return (
    <div className="seg" style={{ marginBottom: 12 }}>
      <button
        type="button"
        className={location === 'gym' ? 'on' : ''}
        onClick={() => updateProfile({ location: 'gym' })}
      >
        🏋️ Gym
      </button>
      <button
        type="button"
        className={location === 'home' ? 'on' : ''}
        onClick={() => updateProfile({ location: 'home' })}
      >
        🏠 Home
      </button>
    </div>
  )
}
