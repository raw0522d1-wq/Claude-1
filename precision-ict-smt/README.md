# Precision ICT/SMT Intelligence Engine — v2.0.0

A selective, non-repainting TradingView system for ICT-style liquidity trading with
SMT intermarket confirmation, built as three deliverables:

| Deliverable | File |
|---|---|
| A — Indicator (Pine v6, `indicator()`) | [`pine/precision_ict_smt_indicator.pine`](pine/precision_ict_smt_indicator.pine) |
| B — Strategy / webhook bot (Pine v6, `strategy()`) | [`pine/precision_ict_smt_strategy.pine`](pine/precision_ict_smt_strategy.pine) |
| C — Validation guide | [`docs/VALIDATION_GUIDE.md`](docs/VALIDATION_GUIDE.md) |
| Security & vulnerability review | [`docs/SECURITY_REVIEW.md`](docs/SECURITY_REVIEW.md) |
| Required test-case results | [`docs/TEST_CASES.md`](docs/TEST_CASES.md) |

> **No performance claims are made.** The score is a quality rank, not a probability.
> The calibration table reports win rates only alongside their sample sizes and
> Wilson 95% intervals, and labels anything under 30 trades "insufficient sample."

---

## 1 · System architecture

Both scripts share a single causal pipeline. A signal can only be produced by
walking the full chain — no step can be skipped and no step can be reordered:

```
HTF context (confirmed prev D/W/M/4H bars, delayed by design)
  → eligible liquidity level exists BEFORE the event (priority 1–11 hierarchy)
    → session / weekday / blackout eligibility
      → raid: penetration within [min, max] band, no acceptance
        → reclaim: close back through the level within the deadline
          → displacement: ATR-scaled candle/sequence quality
            → internal MSS: close beyond a swing that existed BEFORE the break
              → PD array: first-touch FVG (OB fallback / breaker)
                → optional (or mandatory) SMT confirmation w/ correlation filter
                  → draw-on-liquidity target geometry ≥ min R:R
                    → risk approval (sizing, lockouts, caps)
                      → entry activation → management → exit
```

**Modules** (numbered identically in both scripts):
1 Configuration · 2 Core series · 3 Session engine · 4 HTF engine · 5 Swing engine ·
6 Liquidity engine · 7 Sweep/reclaim engine · 8 Displacement · 9 FVG engine ·
10 OB/Breaker engine · 11 SMT engine · 12 Premium/Discount · 13 Draw-on-liquidity ·
14 Score engine · 15 State variables · 16 Confirmed-bar engine (setups 1–5,
monitoring, counters). The strategy adds S0 trade accounting/risk state,
S1 webhook JSON, S2 order engine, S3–S5 visuals/dashboard/statistics.

### Two decision layers
* **Layer 1 — mandatory gates** (hard booleans per setup): valid pre-existing
  liquidity, valid sweep, valid reclaim, confirmed displacement, confirmed MSS,
  valid entry array, session/day eligibility, minimum R:R, valid stop distance,
  risk approval. Any missing gate ⇒ developing / rejected / invalidated — never a signal.
* **Layer 2 — confluence score** (transparent 100-point weights, all user-configurable):
  Liquidity 18 · Structure 15 · Displacement 12 · HTF 12 · Entry array 10 · SMT 10 ·
  P/D 7 · Time 5 · Target 7 · Regime 4, minus explicit penalties (Monday, weak ATR,
  volatility spike, HTF conflict, near opposing liquidity, mitigated array, late entry).
  A high score can never override a failed gate.

## 2 · Definitions and assumptions (objective rules)

* **Liquidity hierarchy** (priority 1 = highest): prev-month H/L (1), prev-week (2),
  prev-day (3), Asia (5), London KZ (6), premarket (7), opening range (8),
  equal highs/lows (9), external swings (10), internal swings (11). Session levels
  become eligible **only after their session completes**. Every level stores kind,
  price, creation/confirmation bar, priority, touches, swept flag and sweep bar; a
  swept level can never re-arm.
* **Equal H/L**: ≥2 confirmed pivot touches within `max(minTicks·mintick, ATR·tol)`,
  min/max bars between touches, and a minimum ATR prominence dip/peak between them.
* **Sweep**: penetration ≥ `max(minTicks, minATR)` and ≤ `maxATR`; reclaim close back
  through the level within the deadline; `swAcceptBars` consecutive closes beyond, a
  deeper-than-max penetration, or deadline expiry reclassifies the event as
  acceptance/breakout (level consumed, **no** Turtle Soup).
* **Displacement**: range ≥ ATR×mult AND (body ≥ ATR×mult OR body/range ≥ ratio) AND
  close in the terminal portion of the bar, optional relative-volume expansion; a
  3-bar net-move sequence alternative can be enabled. A big candle without the MSS
  break never qualifies on its own — displacement is only consumed *at* the MSS test.
* **Internal MSS**: close beyond the most recent *confirmed-before-the-sweep* internal
  swing by a tick buffer, produced by qualifying displacement, within the MSS deadline.
* **FVG**: classic 3-candle definition (`low > high[2]` / `high < low[2]`), tradable only
  if ≥ `max(minTicks, minATR)`, created during displacement, unmitigated
  (configurable max touches), within max age. Tracks distal/proximal/mid, fill %,
  touches, expiry. First-touch gaps score higher.
* **Order block**: last opposite-color candle within `obLookback` before a qualifying
  displacement structure break, captured *at* the break (so it always predates it).
* **Breaker**: a previously valid OB that fails on a confirmed displacement close
  through it **with** a structure shift on the same bar, then is retested from the
  correct side while fresh (max age, max prior retests) with a rejection close.
* **Premium/Discount**: dealing range = last confirmed external swing high/low
  (10/10 pivots — noise cannot redefine it); EQ at 50 %; OTE 62–79 % scored as full P/D quality.
* **Draw on liquidity**: opposing eligible levels ranked by priority then proximity,
  subject to R:R ≥ minimum; nearest opposing level closer than 1R triggers a penalty
  or (optional) rejection; fallback fixed-R target if no qualifying draw exists.
* **SMT**: identical pivot methodology on both instruments, comparison series
  confirmed and one bar delayed, sync window in bars, ATR-normalized minimum
  divergence, freshness limit, rolling-correlation filter (positive or explicit
  inverse mode), optional second symbol (either/both). Missing data or weak
  correlation ⇒ SMT **unavailable** (0 points, dashboard warning) — never fabricated.
  SMT alone never creates an entry; without a liquidity raid it produces an
  informational alert only.
* **HTF bias**: objective blend of price vs prev-day midpoint, daily open, prev-week
  midpoint and confirmed 4H momentum (−4…+4 → bearish/neutral/bullish). Mode A gates
  direction strictly; Mode B allows countertrend only at priority ≤ 6 external
  liquidity in the correct P/D half; Mode C is direction-free but demands +5 score
  and optionally mandatory SMT. No moving-average crossovers anywhere in the logic.

## 3 · Non-repainting methodology

1. **Confirmed bars only** — the entire event engine runs inside
   `if barstate.isconfirmed`; nothing decision-bearing updates intrabar.
2. **HTF requests** use the canonical non-repainting form
   `request.security(sym, tf, expr[1], lookahead = barmerge.lookahead_on)`:
   the value of the **previous, fully closed** HTF bar, identical on historical and
   realtime bars and stable across reloads. Confirmed HTF data is therefore
   *intentionally delayed* by one HTF bar. No un-offset expression is ever combined
   with `lookahead_on`. Invalid configs (context TF ≤ chart TF) disable signals and
   raise a dashboard warning.
3. **Comparison symbols** use the same `[1]` + `lookahead_on` pattern, so SMT swing
   logic runs on confirmed, one-bar-delayed series for both instruments symmetrically.
4. **Pivots** (`ta.pivothigh/low`) act only after right-side completion; the engine
   stores pivot bar *and* confirmation bar separately, and MSS may only reference
   swings whose confirmation predates the sweep. Signals are timestamped at the
   confirmation bar, never backdated.
5. **Sessions**: session extremes become liquidity only after session end; the
   opening range is only usable after its window closes; a session's final high/low
   is never referenced before the session finishes.
6. **Developing states** are visually separate (circles, "DEVELOPING" labels,
   disabled-by-default alerts) and can never place orders or webhooks.
7. **Strategy calc model**: `calc_on_every_tick=false`, `calc_on_order_fills=false`,
   `process_orders_on_close=false`, `pyramiding=0`, limit-fill verification
   (`backtest_fill_limits_assumption=1` + optional extra strict-fill ticks), nonzero
   commission and slippage defaults. Reload and history behave identically.
8. A **developing-HTF research mode** exists (off by default), clearly labeled
   repaint-capable, and is wired only to a dashboard cell — never to decisions.

## 4 · Indicator/strategy parity

Modules 1–16 are line-identical between the two files (same inputs, same defaults,
same IDs). Confirmed setups therefore occur on the same bars with the same score.
Verify with **parity mode** (group 16): both scripts print a compact encoded label
`P|TYPE|L/S|score|liquidity` on each confirmation bar — overlay both scripts and the
labels must match bar-for-bar.

Two *documented* divergences, both spec-required strategy behavior the indicator
cannot know:
* PnL-based lockouts (daily/weekly loss, consecutive losses, profit target, kill
  switch) exist only in the strategy — the indicator approximates with signal-count
  caps and shows "PnL lockouts enforced in strategy" on its dashboard.
* While a position or pending order is open the strategy suppresses new setups
  (`stratGate`); the indicator approximates this with its own active-setup latch.
Compare parity on windows where neither condition binds (or disable lockouts while testing).

## 5 · Setup state machine

States: `0 IDLE · 1 LIQUIDITY_ARMED · 2 SWEEP_DETECTED · 3 RECLAIM_PENDING ·
4 RECLAIM_CONFIRMED · 5 MSS_PENDING · 6 MSS_CONFIRMED · 7 ENTRY_ZONE_ACTIVE ·
8 ORDER_PENDING · 9 POSITION_OPEN · 10 PARTIAL_EXIT · 11 CLOSED · 12 INVALIDATED ·
13 CANCELED · 14 COOLDOWN · 15 DAILY_LOCKOUT`

| From | Event | To |
|---|---|---|
| IDLE | eligible level exists | LIQUIDITY_ARMED |
| LIQUIDITY_ARMED | penetration within band on confirmed bar | SWEEP_DETECTED |
| SWEEP_DETECTED | close back through level ≤ deadline | RECLAIM_CONFIRMED |
| SWEEP_DETECTED | deadline / acceptance closes / max penetration | INVALIDATED (level consumed) |
| RECLAIM_CONFIRMED | — | MSS_PENDING |
| MSS_PENDING | displacement close beyond pre-existing swing ≤ deadline | MSS_CONFIRMED |
| MSS_PENDING | deadline expires or close beyond sweep extreme | INVALIDATED |
| MSS_CONFIRMED | valid PD array + gates + score ≥ threshold | ENTRY_ZONE_ACTIVE |
| MSS_CONFIRMED | no valid array / gate fails / score low | INVALIDATED |
| ENTRY_ZONE_ACTIVE | limit order accepted (strategy) | ORDER_PENDING |
| ENTRY_ZONE_ACTIVE / ORDER_PENDING | expiry, target trades first, opposite MSS | CANCELED |
| ENTRY_ZONE_ACTIVE / ORDER_PENDING | close beyond sweep extreme | INVALIDATED |
| ORDER_PENDING | fill | POSITION_OPEN |
| POSITION_OPEN | TP1/TP2 partial fill | PARTIAL_EXIT |
| POSITION_OPEN / PARTIAL_EXIT | stop, final target, MSS exit, time stop, force flat | CLOSED |
| CLOSED / CANCELED / INVALIDATED | — | COOLDOWN (n bars) |
| any | daily loss / consec-loss / max-trades / kill switch | DAILY_LOCKOUT until reset boundary |

No state re-fires its alert: sweeps consume their level, SMT events are keyed by the
pivot pair, and every webhook carries a unique idempotency key
(`setup_id + event + bar time`); the setup ID itself is deterministic
(ticker | type | direction | liquidity kind | tick-rounded price | sweep time | confirm time).

## 6 · Default settings (Balanced preset)

Execution 5 m · context 60 m · bias 4 H+D/W/M · NY AM window, lunch rejected,
Monday off, Friday cut 11:30 ET · min score 80 · min R:R 2.0 · risk 0.25 %
(1 % hard cap) · max 2 trades/day, 1/session · daily stop −2R · 2 consecutive
losses · TP1 25 % @1R, TP2 25 % @2R, rest at the liquidity draw · BE after TP1 ·
force flat 15:55 ET · commission $1.25/contract + 1 tick slippage.
Presets: **A+ Selective** (score 85, R:R 2.5), **Balanced**, **Active** (3 m, 78,
1.75), **Research** (shows developing states; confirmations unchanged).
Default markets: ES/MES/NQ/MNQ/YM/MYM with SMT pairs ES↔NQ, ES↔YM, MES↔MNQ
(optional EURUSD↔GBPUSD, BTC↔ETH; inverse mode for DXY pairs must be explicitly selected).

## 7 · Version history

* **2.0.0 (2026-07-15)** — initial public release: five setups, two-layer gate/score
  engine, SMT with correlation filter, full risk engine, webhook JSON with
  idempotency keys, calibration table with Wilson intervals, parity mode,
  post-review security fixes (see `docs/SECURITY_REVIEW.md`).
