import { useEffect, useRef, useState } from 'react'
import {
  deleteClip,
  fmtSize,
  listClips,
  saveClip,
  type ClipRecord,
} from '../lib/videoStore'

/**
 * UGC video library — upload unlimited short-form workout example clips
 * (form demos, session highlights, community content) and replay them
 * anytime. Stored on-device in IndexedDB, so there is no upload cap.
 */
export function Clips() {
  const [clips, setClips] = useState<ClipRecord[]>([])
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [tag, setTag] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [playing, setPlaying] = useState<ClipRecord | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false
    listClips()
      .then((list) => {
        if (cancelled) return
        setClips(list)
        setUrls((prev) => {
          const next = { ...prev }
          for (const c of list) {
            if (!next[c.id]) next[c.id] = URL.createObjectURL(c.blob)
          }
          return next
        })
      })
      .catch(() => setError('Video storage is unavailable in this browser.'))
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(
    () => () => {
      Object.values(urls).forEach((u) => URL.revokeObjectURL(u))
    },
    // revoke only on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  async function confirmUpload() {
    if (!pendingFile) return
    setUploading(true)
    setError(null)
    try {
      const meta = await saveClip(pendingFile, title, tag)
      const record: ClipRecord = { ...meta, blob: pendingFile }
      setClips((c) => [record, ...c])
      setUrls((u) => ({ ...u, [meta.id]: URL.createObjectURL(pendingFile) }))
      setPendingFile(null)
      setTitle('')
      setTag('')
    } catch {
      setError('Could not save that video — your device storage may be full.')
    } finally {
      setUploading(false)
    }
  }

  async function remove(clip: ClipRecord) {
    if (!confirm(`Delete "${clip.title}"?`)) return
    await deleteClip(clip.id)
    setClips((c) => c.filter((x) => x.id !== clip.id))
    if (urls[clip.id]) URL.revokeObjectURL(urls[clip.id])
    if (playing?.id === clip.id) setPlaying(null)
  }

  const totalBytes = clips.reduce((s, c) => s + c.size, 0)

  return (
    <div className="screen fade-in">
      <p className="kicker">Clips</p>
      <h1 style={{ fontSize: 26, margin: '6px 0 2px' }}>Workout Videos</h1>
      <p className="muted small" style={{ marginBottom: 16 }}>
        Upload unlimited short-form and UGC clips — form demos, session
        highlights, community examples. Stored on your device, no caps.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) {
            setPendingFile(f)
            setTitle(f.name.replace(/\.[^.]+$/, ''))
          }
          e.target.value = ''
        }}
      />

      {pendingFile ? (
        <div className="card fade-in" style={{ borderColor: 'var(--accent)' }}>
          <h3 style={{ fontSize: 15, marginBottom: 4 }}>New Clip</h3>
          <p className="small muted" style={{ marginBottom: 12 }}>
            {pendingFile.name} · {fmtSize(pendingFile.size)}
          </p>
          <label className="field">
            <span>Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. RDL form check" />
          </label>
          <label className="field">
            <span>Exercise / tag (optional)</span>
            <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="e.g. Romanian Deadlift" />
          </label>
          <div className="btn-row">
            <button className="btn btn-ghost" onClick={() => setPendingFile(null)}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={uploading} onClick={confirmUpload}>
              {uploading ? 'Saving…' : 'Save Clip'}
            </button>
          </div>
        </div>
      ) : (
        <div className="capture">
          <div className="big-ico">🎥</div>
          <h3 style={{ margin: '10px 0 6px' }}>ADD A CLIP</h3>
          <p className="muted small" style={{ marginBottom: 16 }}>
            Record or pick any video — no size limit, no clip limit.
          </p>
          <button className="btn btn-primary" onClick={() => inputRef.current?.click()}>
            Upload Video
          </button>
        </div>
      )}

      {error && (
        <p className="small" style={{ color: '#ff6b6b', marginTop: 12 }}>
          {error}
        </p>
      )}

      {playing && urls[playing.id] && (
        <div className="modal-backdrop" onClick={() => setPlaying(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 4 }}>{playing.title}</h3>
            {playing.tag && (
              <p className="small muted" style={{ marginBottom: 10 }}>
                🎯 {playing.tag}
              </p>
            )}
            <video
              src={urls[playing.id]}
              controls
              autoPlay
              playsInline
              style={{ width: '100%', borderRadius: 12, background: '#000' }}
            />
            <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={() => setPlaying(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {clips.length > 0 && (
        <>
          <div className="section-head">
            <h2>Your Library</h2>
            <span className="small muted">
              {clips.length} clips · {fmtSize(totalBytes)}
            </span>
          </div>
          {clips.map((clip) => (
            <div key={clip.id} className="card" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <video
                src={urls[clip.id]}
                muted
                playsInline
                preload="metadata"
                onClick={() => setPlaying(clip)}
                style={{
                  width: 76,
                  height: 76,
                  objectFit: 'cover',
                  borderRadius: 10,
                  background: '#000',
                  border: '1px solid var(--line)',
                  cursor: 'pointer',
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {clip.title}
                </h3>
                <p className="small muted" style={{ marginTop: 3 }}>
                  {clip.tag ? `🎯 ${clip.tag} · ` : ''}
                  {clip.date} · {fmtSize(clip.size)}
                </p>
                <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                  <button
                    onClick={() => setPlaying(clip)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-2)', cursor: 'pointer', fontSize: 13, padding: 0 }}
                  >
                    ▶ Play
                  </button>
                  <button
                    onClick={() => remove(clip)}
                    style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: 13, padding: 0 }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
