import { useState } from 'react'
import { MONETIZATION } from '../config'
import { isNativeApp, purchaseNative, restoreNative, type PlanId } from '../lib/billing'
import { useStore } from '../store'

interface Props {
  onClose: () => void
}

const PERKS = [
  ['🏛️', 'All 6 PRO programs — Golden Era, Gauntlet, Shred, Hybrid & more'],
  ['🥩', 'Full meal plans for every goal, matched to your macros'],
  ['📸', 'Unlimited transformation timeline & photo archive'],
  ['🏆', 'All milestone rewards and rank titles'],
  ['📈', 'Weekly protocol tips, every category, every week'],
] as const

export function Paywall({ onClose }: Props) {
  const { updateProfile } = useStore()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function buy(plan: PlanId, link: string) {
    setError(null)
    if (isNativeApp) {
      // Store policy: digital subscriptions must use In-App Purchase.
      try {
        const ok = await purchaseNative(plan)
        if (ok) {
          updateProfile({ premium: true })
          onClose()
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Purchase failed.')
      }
      return
    }
    if (link) {
      window.open(link, '_blank', 'noopener')
    } else {
      setError(
        'Checkout is not wired up yet — add your Stripe Payment Links in src/config.ts, or use an unlock code.',
      )
    }
  }

  async function restore() {
    setError(null)
    try {
      const ok = await restoreNative()
      if (ok) {
        updateProfile({ premium: true })
        onClose()
      } else {
        setError('No previous purchase found for this account.')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Restore failed.')
    }
  }

  function redeem() {
    if (code.trim().toUpperCase() === MONETIZATION.founderCode) {
      updateProfile({ premium: true })
      onClose()
    } else {
      setError('Invalid code.')
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <span className="pro-tag" style={{ fontSize: 12, padding: '5px 12px' }}>
            FORGE PREMIUM
          </span>
          <h1 style={{ fontSize: 30, margin: '12px 0 6px' }}>
            Serious Results.
            <br />
            Serious Tools.
          </h1>
          <p className="muted small">
            Free gets you started. Premium gets you finished.
          </p>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          {PERKS.map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', gap: 10, padding: '7px 0', alignItems: 'flex-start' }}>
              <span>{icon}</span>
              <span className="small">{text}</span>
            </div>
          ))}
        </div>

        <button
          className="btn btn-primary"
          onClick={() => buy('yearly', MONETIZATION.stripeYearlyLink)}
        >
          Yearly — {MONETIZATION.yearlyPrice} · {MONETIZATION.yearlySavings}
        </button>
        <button
          className="btn btn-ghost"
          style={{ marginTop: 10 }}
          onClick={() => buy('monthly', MONETIZATION.stripeMonthlyLink)}
        >
          Monthly — {MONETIZATION.monthlyPrice}
        </button>
        {isNativeApp && (
          <button
            className="btn btn-ghost"
            style={{ marginTop: 10, border: 'none' }}
            onClick={restore}
          >
            Restore Purchases
          </button>
        )}

        {error && (
          <p className="small" style={{ color: '#ff6b6b', marginTop: 12, textAlign: 'center' }}>
            {error}
          </p>
        )}

        <hr className="divider" />
        <p className="small muted" style={{ marginBottom: 8 }}>
          Have an unlock code?
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="CODE"
            style={{ textTransform: 'uppercase' }}
          />
          <button className="btn btn-ghost" style={{ width: 'auto' }} onClick={redeem}>
            Redeem
          </button>
        </div>

        <button className="btn btn-ghost" style={{ marginTop: 16, border: 'none' }} onClick={onClose}>
          Not yet — keep grinding free
        </button>
      </div>
    </div>
  )
}
