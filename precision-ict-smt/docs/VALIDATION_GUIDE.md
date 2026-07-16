# Deliverable C — Validation Guide

Precision ICT/SMT Intelligence Engine v2.0.0

---

## 1 · Installation

1. TradingView → **Pine Editor** → *New blank script*.
2. Paste the full contents of `pine/precision_ict_smt_indicator.pine` → **Save** → **Add to chart**.
3. Repeat with `pine/precision_ict_smt_strategy.pine` in a second script.
4. Both scripts compile independently; the strategy also opens the **Strategy Tester** tab.
5. Keep both on the same chart while validating parity; remove the indicator for live alerting if you only automate the strategy.

## 2 · Recommended chart settings

* Symbol: **CME_MINI:ES1!** (or MES/NQ/MNQ/YM/MYM). Set the SMT comparison symbol to the paired index (ES↔NQ by default).
* Chart timeframe: **5** for A+ Selective / Balanced, **3** for Active, **15** for a conservative variant. The dashboard warns when chart TF ≠ preset TF.
* Regular candles only. **Never** Heikin Ashi / Renko / Range — the strategy blocks entries on synthetic charts by default and warns.
* Use the same contract type on the chart and the comparison symbol (both continuous `1!` or both a specific expiry) — mixed rolls invalidate SMT and backtests (dashboard cannot detect roll mismatch; check manually).
* Chart session: default exchange session; the engine's session logic is anchored to the configurable `America/New_York` timezone and handles DST via TradingView session strings.

## 3 · Alert creation

### Indicator (signals only — never executable)
Create alerts from the alert dialog → *Condition = the indicator* → pick one of the 19
conditions (developing/qualified per direction, the five setups per direction, SMT
informational, entry-zone touch, canceled, invalidated, lockout).
**Trigger: "Once per bar close"** — mandatory. Developing alerts are for research and
must not be wired to execution. Indicator alert messages are static text by design;
executable payloads only exist in the strategy.

### Strategy (webhook automation)
1. Add the strategy to the chart, configure inputs, verify the dashboard shows no red warnings.
2. Create **one** alert: *Condition = the strategy*, choose **"Order fills and alert() function calls"**.
3. Message box: exactly `{{strategy.order.alert_message}}` — this substitutes the dynamic JSON attached to each order event. `alert()`-based events (SETUP_CONFIRMED, ENTRY_SUBMITTED, ENTRY_CANCELED, RISK_LOCKOUT, SMT info) deliver their own JSON automatically.
4. Enable **Webhook URL** and point it at your bridge endpoint (HTTPS only).
5. TradingView posts the body as `application/json` when the message is a valid JSON object — the engine escapes all strings and never emits malformed JSON.

## 4 · Webhook field documentation

Every event is a flat JSON object:

| Field | Meaning |
|---|---|
| `system`, `version` | strategy alias input, engine version |
| `event` | `SETUP_CONFIRMED`, `ENTRY_SUBMITTED`, `ENTRY_FILLED`, `ENTRY_CANCELED`, `ENTRY_SKIPPED_RISK`, `TP1_OR_STOP_FILLED`, `TP2_OR_STOP_FILLED`, `FINAL_OR_STOP_FILLED`, `FINAL_EXIT`, `FORCE_FLAT`, `RISK_LOCKOUT`, `SMT_DIVERGENCE_INFO` |
| `setup_id` | deterministic: ticker \| setup \| side \| liquidity kind \| tick-rounded price \| sweep time \| confirm time |
| `idempotency_key` | `setup_id + event + bar time` — **your bridge must deduplicate on this** |
| `account_alias`, `broker_symbol` | your routing inputs (broker_symbol falls back to the ticker) |
| `ticker`, `timeframe`, `timestamp_utc` (ms), `timezone` | context |
| `setup`, `side`, `order_type`, `time_in_force` | trade descriptor |
| `quantity`, `entry`, `stop`, `target_1`, `target_2`, `final_target` | numbers, tick-rounded |
| `risk_percent`, `risk_amount`, `projected_rr`, `confluence_score`, `bias`, `session`, `liquidity_type`, `smt_symbol`, `smt_direction` | quality metadata |
| `reduce_only` | true on every exit event |
| `bar_confirmed` | always true — no intrabar payloads exist |
| `reason` | cancellation/exit reason (e.g. `setup_invalidated`, `force_flat_window`, `time_stop`) |
| `auth_token` | opaque shared token from inputs — see security notes |

Notes:
* A `strategy.exit` order carries one message for both its limit and stop leg; the event name says `_OR_STOP_` and the bridge disambiguates by comparing the fill price to `stop` vs the target. The Strategy Tester's trade list also records `TP1/TP2/FINAL/STOP` comments per fill.
* `ENTRY_FILLED` fires on the actual fill (order-fill event), `ENTRY_SUBMITTED` on submission bar close.
* **Never** put broker usernames, passwords, API keys or private keys in alert bodies. Use only an opaque random token that your bridge validates, rotate it periodically, and terminate TLS at the bridge.

### External execution-bridge requirements
The bridge (your server, not TradingView) must: validate `auth_token` with a constant-time compare; deduplicate on `idempotency_key` (store processed keys ≥ 48 h); honor `reduce_only`; map `broker_symbol`; reject stale events (`timestamp_utc` older than a configurable skew, e.g. 90 s); apply its own max-position and kill-switch caps independent of the strategy; log everything; and respond 2xx quickly (TradingView times out slow webhooks).

## 5 · Bar Replay test procedure

1. Load ES1! 5 m with both scripts, identical settings, **parity mode ON**.
2. Enter Bar Replay well before a known signal day; step bar-by-bar.
3. Verify: no confirmed marker ever appears mid-bar; developing circles may appear and die without ever becoming orders; every confirmed marker appears exactly at a bar close and **stays on that bar** as you continue stepping.
4. Note the bar time of 5–10 confirmed setups, exit replay, reload the chart (Ctrl/Cmd-R): the same setups must sit on the same bars with the same scores (test case 19).
5. Overlay check: indicator parity labels and strategy parity labels match bar-for-bar (test case 20).

## 6 · Backtest integrity checklist

- [ ] Commission and slippage are **non-zero** and realistic for your broker (Properties tab; defaults $1.25/contract + 1 tick).
- [ ] `process_orders_on_close` remains **off**; Bar Magnifier **on** if your plan has it (limit+stop in the same bar otherwise resolves by conservative broker-emulator assumptions; the engine additionally supports strict-fill extra ticks).
- [ ] Regular candles; no synthetic chart types.
- [ ] Date-range filter used to carve **in-sample vs out-of-sample**; the OOS window is never touched during tuning.
- [ ] Run on the current contract **and** the continuous contract separately; compare.
- [ ] ≥ 2 market regimes and ≥ 2 years of data; the stats table flags < 30 trades as insufficient.
- [ ] Score-bucket table: never quote a bucket win rate without its `N`; respect the Wilson interval.
- [ ] Check "Top5 %" — if most profit comes from ≤ 5 trades, treat the edge as unproven.
- [ ] Weekday table validates (or refutes) the Monday-off / Friday-cutoff defaults — they are hypotheses, not facts.
- [ ] Trade count sanity: implausibly many trades ⇒ a filter is broken; near-zero ⇒ over-filtered (warning row).

### Parameter robustness
Never ship a single tuned value. For each load-bearing input test the neighborhood
(e.g. displacement 1.5 → also 1.3/1.4/1.6/1.7; sweep max 0.75 → 0.6/0.9; score 80 →
78/82/85). Prefer plateaus over peaks. Do this per market — NQ settings do **not**
transfer to ES untested. Minimum market sweep: ES, NQ, YM, one micro, one non-index.

### Walk-forward & Monte Carlo
Use a fixed development window, then an untouched validation window, then roll or
expand; never re-tune after seeing validation results. Pine cannot run Monte Carlo —
export the closed-trade list (Strategy Tester → export) and externally test trade-order
randomization, slippage/commission stress, missed-trade simulation, winner-haircut,
losing-streak and drawdown distributions.

## 7 · Forward-testing checklist

- [ ] Run the strategy live on a chart with alerts (webhook to a **paper** bridge) for ≥ 4 weeks.
- [ ] Confirm every live alert corresponds to a bar-close signal that is still on the chart the next day (no ghost signals).
- [ ] Reconcile paper fills vs Strategy Tester fills; expected slippage divergence only.
- [ ] Verify idempotency: force TradingView to re-fire (edit/save alert) and confirm the bridge rejects duplicate keys (test case 26).
- [ ] Verify lockouts fire in real time (simulate with tiny limits).
- [ ] Only then consider small live size, starting at the 0.25 % default.

## 8 · Known Pine Script limitations (honest constraints)

1. `commission`, `slippage`, `process_orders_on_close`, `use_bar_magnifier`,
   `backtest_fill_limits_assumption` are declaration constants — users tune them in
   **Properties**, not Inputs; the dashboard reminds you to verify costs.
2. A single `strategy.exit` shares one `alert_message` between its stop and limit
   leg; exit reasons are disambiguated by price/comment (documented above).
3. `strategy.equity`-based sizing uses equity at order time; intrabar equity swings
   are not modeled. Broker-emulator fills on historical bars use OHLC (or Bar
   Magnifier when enabled) — ambiguous same-bar entry+stop sequences are resolved
   conservatively by the emulator, not by the script (test case 15).
4. Holidays/half-days: session strings follow exchange data; unusual sessions may
   shorten ranges (handled gracefully — a session that never ends simply produces no
   level). Explicit holiday calendars are not available in Pine.
5. SMT comparison data arrives one confirmed bar late by design; futures-roll
   mismatch between primary and comparison contracts cannot be auto-detected.
6. Repainting protection depends on the platform contract of
   `request.security(..., expr[1], lookahead_on)`; do not modify those calls.
7. Object counts are capped (≤ 500 lines/labels/boxes) with recycling; on very long
   histories old drawings are deleted first.
8. The scripts are written for TradingView's Pine v6 compiler. They were reviewed
   line-by-line against the v6 language reference but **could not be compiled in this
   offline environment** — if the editor flags a line on paste, it will be a mechanical
   fix (typo-level), not an architectural one. Report/fix and re-test parity.

## 9 · Optimization warnings

* Never optimize to make the equity curve pretty; optimize for gate correctness first.
* The confluence score is not a probability; only the calibration table (with N and
  CI) may be used to talk about historical frequencies.
* Do not raise risk after losses; the engine hard-blocks martingale by design.
* If a parameter only works at one value, it does not work.
* If Monday (or any weekday) shows positive expectancy over a real sample, enable it —
  the defaults are conservative priors, not truths.

## 10 · Suggested default markets & comparison symbols

| Primary | SMT comparison | Alt comparison |
|---|---|---|
| CME_MINI:ES1! | CME_MINI:NQ1! | CBOT_MINI:YM1! |
| CME_MINI:NQ1! | CME_MINI:ES1! | CBOT_MINI:YM1! |
| CBOT_MINI:YM1! | CME_MINI:ES1! | CME_MINI:NQ1! |
| CME_MICRO:MES1! (MES) | CME_MICRO:MNQ1! | — |
| OANDA:EURUSD | OANDA:GBPUSD | — |
| BINANCE:BTCUSDT | BINANCE:ETHUSDT | — |
| Risk asset vs TVC:DXY | **inverse mode ON** | — |
