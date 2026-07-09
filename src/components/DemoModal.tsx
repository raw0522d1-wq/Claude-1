interface Props {
  exerciseName: string
  url: string
  onClose: () => void
}

/** Full-screen player for the animated exercise example. */
export function DemoModal({ exerciseName, url, onClose }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <p className="kicker">Form Demo</p>
        <h3 style={{ margin: '6px 0 12px' }}>{exerciseName}</h3>
        <video
          src={url}
          autoPlay
          loop
          muted
          playsInline
          controls
          style={{ width: '100%', borderRadius: 12, background: '#000', aspectRatio: '1' }}
          onError={(e) => {
            const el = e.currentTarget
            el.style.display = 'none'
            const note = el.nextElementSibling as HTMLElement | null
            if (note) note.style.display = 'block'
          }}
        />
        <p className="muted small" style={{ display: 'none', padding: '20px 0' }}>
          Demo clip could not be loaded in this environment — it plays in the
          installed app and web deployment.
        </p>
        <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
