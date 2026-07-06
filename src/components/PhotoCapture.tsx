import { useRef, useState } from 'react'
import { fileToThumb } from '../lib/photos'

interface Props {
  kind: 'in' | 'out'
  onCapture: (dataUrl: string) => void
}

/**
 * Photo check-in / check-out capture. Uses the native camera via
 * `capture` on mobile; falls back to a file picker on desktop.
 */
export function PhotoCapture({ kind, onCapture }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const label = kind === 'in' ? 'CHECK-IN PHOTO' : 'CHECK-OUT PHOTO'
  const prompt =
    kind === 'in'
      ? 'Snap a photo to unlock this workout. No photo, no session.'
      : 'Prove you finished. Take your check-out photo to bank the work.'

  async function handleFile(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const thumb = await fileToThumb(file)
      setPreview(thumb)
    } catch {
      setError('Could not process that photo — try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`capture ${preview ? 'armed' : ''}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {preview ? (
        <>
          <div
            className="photo-frame"
            style={{ maxWidth: 180, margin: '0 auto 14px' }}
          >
            <img src={preview} alt={`${label} preview`} />
            <span className="tag">{kind === 'in' ? 'CHECK-IN' : 'CHECK-OUT'}</span>
          </div>
          <div className="btn-row">
            <button className="btn btn-ghost" onClick={() => inputRef.current?.click()}>
              Retake
            </button>
            <button className="btn btn-primary" onClick={() => onCapture(preview)}>
              {kind === 'in' ? 'Start Workout' : 'Complete Workout'}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="big-ico">📸</div>
          <h3 style={{ margin: '10px 0 6px' }}>{label}</h3>
          <p className="muted small" style={{ marginBottom: 16 }}>
            {prompt}
          </p>
          {error && (
            <p className="small" style={{ color: '#ff6b6b', marginBottom: 10 }}>
              {error}
            </p>
          )}
          <button
            className="btn btn-primary"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? 'Processing…' : 'Open Camera'}
          </button>
        </>
      )}
    </div>
  )
}
