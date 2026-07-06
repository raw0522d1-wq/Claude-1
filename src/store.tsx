import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  ActiveSession,
  AppState,
  PhotoRecord,
  ProgressStats,
  UserProfile,
  WorkoutLog,
} from './types'
import { MILESTONES } from './data/milestones'
import { calcStreaks, todayISO, weeksSince } from './lib/dates'
import { uid } from './lib/photos'

const STORAGE_KEY = 'forge.state.v1'
const MAX_PHOTOS = 60

const EMPTY: AppState = {
  profile: null,
  logs: [],
  photos: [],
  claimedMilestones: [],
  session: null,
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    return { ...EMPTY, ...(JSON.parse(raw) as AppState) }
  } catch {
    return EMPTY
  }
}

function save(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage full — drop oldest photos and retry once.
    try {
      const trimmed = { ...state, photos: state.photos.slice(-20) }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    } catch {
      /* give up silently; in-memory state still works */
    }
  }
}

interface Store {
  state: AppState
  stats: ProgressStats
  setProfile: (p: UserProfile) => void
  updateProfile: (patch: Partial<UserProfile>) => void
  startSession: (programId: string, dayIndex: number, checkInDataUrl: string) => void
  toggleExercise: (index: number) => void
  finishSession: (checkOutDataUrl: string, totalExercises: number) => WorkoutLog | null
  abandonSession: () => void
  claimMilestone: (id: string) => void
  resetAll: () => void
}

const StoreCtx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load)

  useEffect(() => {
    save(state)
  }, [state])

  const stats: ProgressStats = useMemo(() => {
    const dates = state.logs.filter((l) => l.finishedAt).map((l) => l.date)
    const { current, best } = calcStreaks(dates)
    const milestoneXp = MILESTONES.filter((m) =>
      state.claimedMilestones.includes(m.id),
    ).reduce((sum, m) => sum + m.xp, 0)
    const workoutXp = state.logs.reduce((sum, l) => sum + l.xp, 0)
    return {
      totalWorkouts: state.logs.filter((l) => l.finishedAt).length,
      currentStreak: current,
      bestStreak: best,
      totalPhotos: state.photos.length,
      totalXp: workoutXp + milestoneXp,
      weeksIn: state.profile ? weeksSince(state.profile.startDate) : 0,
    }
  }, [state])

  const setProfile = useCallback((p: UserProfile) => {
    setState((s) => ({ ...s, profile: p }))
  }, [])

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setState((s) =>
      s.profile ? { ...s, profile: { ...s.profile, ...patch } } : s,
    )
  }, [])

  const startSession = useCallback(
    (programId: string, dayIndex: number, checkInDataUrl: string) => {
      const photo: PhotoRecord = {
        id: uid(),
        date: todayISO(),
        kind: 'in',
        dataUrl: checkInDataUrl,
      }
      const session: ActiveSession = {
        programId,
        dayIndex,
        checkInPhotoId: photo.id,
        startedAt: Date.now(),
        doneExercises: [],
      }
      setState((s) => ({
        ...s,
        photos: [...s.photos, photo].slice(-MAX_PHOTOS),
        session,
      }))
    },
    [],
  )

  const toggleExercise = useCallback((index: number) => {
    setState((s) => {
      if (!s.session) return s
      const done = s.session.doneExercises.includes(index)
        ? s.session.doneExercises.filter((i) => i !== index)
        : [...s.session.doneExercises, index]
      return { ...s, session: { ...s.session, doneExercises: done } }
    })
  }, [])

  const finishSession = useCallback(
    (checkOutDataUrl: string, totalExercises: number): WorkoutLog | null => {
      let created: WorkoutLog | null = null
      setState((s) => {
        if (!s.session) return s
        const photo: PhotoRecord = {
          id: uid(),
          date: todayISO(),
          kind: 'out',
          dataUrl: checkOutDataUrl,
        }
        const dates = s.logs.filter((l) => l.finishedAt).map((l) => l.date)
        const { current } = calcStreaks([...dates, todayISO()])
        const streakBonus = Math.min(100, current * 10)
        const completed = s.session.doneExercises.length
        const completionBonus =
          totalExercises > 0 ? Math.round((completed / totalExercises) * 50) : 0
        const log: WorkoutLog = {
          id: uid(),
          date: todayISO(),
          programId: s.session.programId,
          dayIndex: s.session.dayIndex,
          checkInPhotoId: s.session.checkInPhotoId,
          checkOutPhotoId: photo.id,
          startedAt: s.session.startedAt,
          finishedAt: Date.now(),
          completedExercises: completed,
          totalExercises,
          xp: 100 + streakBonus + completionBonus,
        }
        created = log
        return {
          ...s,
          photos: [...s.photos, photo].slice(-MAX_PHOTOS),
          logs: [...s.logs, log],
          session: null,
        }
      })
      return created
    },
    [],
  )

  const abandonSession = useCallback(() => {
    setState((s) => ({ ...s, session: null }))
  }, [])

  const claimMilestone = useCallback((id: string) => {
    setState((s) =>
      s.claimedMilestones.includes(id)
        ? s
        : { ...s, claimedMilestones: [...s.claimedMilestones, id] },
    )
  }, [])

  const resetAll = useCallback(() => {
    setState(EMPTY)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({
      state,
      stats,
      setProfile,
      updateProfile,
      startSession,
      toggleExercise,
      finishSession,
      abandonSession,
      claimMilestone,
      resetAll,
    }),
    [
      state,
      stats,
      setProfile,
      updateProfile,
      startSession,
      toggleExercise,
      finishSession,
      abandonSession,
      claimMilestone,
      resetAll,
    ],
  )

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
