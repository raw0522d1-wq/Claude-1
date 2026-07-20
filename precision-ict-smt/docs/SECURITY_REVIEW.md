# Security & Vulnerability Review — v2.0.0

Scope: both Pine scripts, the webhook contract, and the automation path
(TradingView alert → webhook bridge → broker). Review performed before release;
every finding below is either **fixed in code** or **mitigated with a documented control**.

## A · Findings fixed in code

| # | Vulnerability | Impact | Fix |
|---|---|---|---|
| A1 | JSON injection via user inputs (account alias, broker symbol, token, symbol names can contain `"` or `\`) | Malformed/forged webhook payloads; a crafted alias could inject extra JSON keys into the message consumed by the bridge | All string fields pass through `f_esc()` (escapes `\` then `"`) before interpolation; numbers are emitted unquoted via fixed format strings; `na` numerics are `nz()`-guarded so `NaN` can never appear in a payload |
| A2 | Secret exposure on chart | Token leakage via screenshots/streams | `auth_token` is used **only** inside alert payloads — it is never plotted, never placed in a label, table cell, or title; input tooltip forbids real credentials (opaque shared token only) |
| A3 | Repainting vectors: intrabar decisions, un-offset `lookahead_on`, unconfirmed pivots, live session extremes, live HTF candle | Signals that move after reload → historically fake edge → real losses when automated | Entire decision engine gated by `barstate.isconfirmed`; every `request.security` uses `expr[1]` + `lookahead_on`; pivots consumed only post-confirmation with confirm-bar stored separately; session levels eligible only after session end; live-HTF "research mode" is display-only, off by default, labeled repaint-capable |
| A4 | Duplicate execution: same sweep re-triggering, alert recalculation, multiple pending orders per setup | Double positions at the broker | Levels are single-use (swept flag), one active setup latch, one pending order latch, SMT events keyed by pivot pair, and every webhook event carries a deterministic `idempotency_key` the bridge must deduplicate on |
| A5 | Division by zero / na poisoning (`high-low = 0` dojis, ATR warm-up, empty comparison data, zero risk distance) | Runtime errors or na-corrupted booleans silently disabling gates | `math.max(x, tick)` guards on all range/size denominators; `riskPerUnit > 0` guard before sizing; bias components na-guarded to 0; v6 short-circuit `not na(x) and …` on all optional levels (OTE, dealing range, comparison pivots) |
| A6 | Unbounded object/loop growth (levels, FVGs, zones, swings, trade arrays) | Script halt at runtime limits, silent drawing loss | Hard caps with FIFO eviction + drawing deletion: 80 liquidity levels, per-kind caps, 40 swings/array, FVG list pruned at 2× max age, 24 zones, 2000 stored trade results |
| A7 | Array index shift bug: sweep tracker stored an array *index* while other code removes elements | Wrong level marked swept → phantom setups | Tracker now stores the `LiqLevel` **object reference** (UDTs are reference types), immune to index shifts |
| A8 | Ternary side-effects: `showX ? line.new(...) : na` still executes the drawing call in Pine | Object-limit exhaustion with visuals "off" | All drawing creation moved into explicit `if` blocks |
| A9 | `ta.*` calls inside conditional scopes (`ta.barssince` in the confirmed-bar block) | Realtime/historical state desync — a classic stealth-repaint | All stateful `ta.*` series computed unconditionally at global scope; only pure functions run conditionally |
| A10 | Same-bar stop/target ambiguity | Optimistic fills inflating backtests | Broker-emulator conservative behavior + `backtest_fill_limits_assumption = 1` + optional strict-fill extra ticks + Bar Magnifier recommendation; indicator-side monitoring treats stop-and-target-same-bar as a close (no win assumed) |
| A11 | Risk-engine bypass after losses (martingale, stop-widening, oversize on small stops) | Account destruction | Stops can only move toward price (`math.max`/`math.min` per side); risk % hard-capped by a second input; min/max stop distance gates; min/max/step quantity; lockouts persist to their reset boundary and cancel pending orders |
| A12 | Judas false-move measured from an unrelated anchor | Mislabeled setups gaming the session filter | False move measured from the actual tracked session open (09:30 open or LKZ open), na-guarded |

## B · Mitigations documented (cannot be enforced from Pine)

| # | Risk | Control |
|---|---|---|
| B1 | Webhook endpoint spoofing / replay | Bridge must validate `auth_token` (constant-time), deduplicate `idempotency_key`, reject events older than a skew window, HTTPS only |
| B2 | TradingView alert body is visible to anyone with chart-layout access | Use an opaque token, rotate it, never real credentials — enforced by convention + tooltip |
| B3 | Broker-side runaway (bridge bug, TV outage mid-position) | Bridge keeps independent position caps, a kill switch, and a session-end flattener; never rely on the strategy alone |
| B4 | Futures roll mismatch between primary and SMT symbol | Manual check documented in the validation guide; SMT self-disables on missing/uncorrelated data |
| B5 | Overfitting presented as edge | Calibration table refuses win rates without N, labels samples, warns on top-5 concentration; validation guide mandates OOS + walk-forward + parameter neighborhoods |

## C · Residual risks (accepted, disclosed)

* Exit stop/limit legs share one alert message per `strategy.exit` (Pine limitation) — bridge disambiguates by price; wrong bridge logic could misclassify an exit type (not a position-size risk: `reduce_only` is set).
* Declaration-constant costs (commission/slippage/bar-magnifier) can be zeroed by the user in Properties; the dashboard shows a standing reminder but cannot read those values.
* Pine cannot see holidays; a shortened session yields a shorter (still non-repainting) session range.
* Scripts are reviewed against the v6 reference but not machine-compiled in this environment (no TradingView compiler offline); paste-time compiler nits are possible and must be fixed before use — architecture is unaffected.
