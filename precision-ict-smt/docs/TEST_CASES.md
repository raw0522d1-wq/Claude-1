# Required Test Cases — expected behavior and implementing logic

How each of the 26 mandated cases is satisfied. "Module" refers to the shared core
(identical in both scripts); verify live via Bar Replay per the validation guide.

| # | Scenario | Expected | Implementing logic |
|---|---|---|---|
| 1 | Price touches a level without penetrating | No sweep | Module 7: candidate requires `pen ≥ max(minTicks·tick, minATR·atr)` |
| 2 | Penetrates PDL but never reclaims | No bullish Turtle Soup | Module 7: reclaim deadline / acceptance-closes / max-penetration → level consumed with `swept=true`, no context created |
| 3 | Sweep + reclaim without MSS | Developing only | 16.7 creates the reclaim context (`DEVELOPING` event); 16.9 invalidates at `rcbDead` with no setup |
| 4 | Sweep, reclaim, displacement, MSS | Entry zone may activate | 16.9 full chain → `ST_ENTRY_ACTIVE` if array/gates/score pass |
| 5 | Score > 85 but MSS missing | No executable trade | Score is computed **only after** the MSS branch is entered — a gate can never be outvoted by score |
| 6 | SMT divergence without external liquidity | Informational alert only | 16.8 fires `evSmtInfo` (`SMT_DIVERGENCE_INFO` webhook / indicator alert); Setup 5 additionally requires a raid at priority ≤ 6 |
| 7 | Comparison symbol missing | SMT disabled, nothing fabricated | `smt1Avail` requires `not na(c1c)`; unavailable → 0 points + dashboard "UNAVAILABLE" |
| 8 | Rolling correlation inadequate | SMT points removed | `corr1Ok` threshold gates `smt1Avail`; dashboard warning "SMT corr below threshold" |
| 9 | HTF candle unfinished | Not used for confirmation | Module 4: all confirmed HTF values are `expr[1]` + `lookahead_on` (previous closed bar); live HTF exists only in the labeled research display |
| 10 | Pivot right side incomplete | Unusable | `ta.pivothigh/low` return na until confirmation; swings stored with `confirmBar`, MSS requires `confirmBar ≤ sweep bar` |
| 11 | FVG too small | Rejected | FVG `qualified` requires `size ≥ max(minTicks·tick, minATR·atr)`; `f_pickFvg` filters on `qualified` |
| 12 | FVG fully mitigated before activation | No first-touch signal | Full fill sets `active=false`; touches beyond `fvgMaxMitig` excluded; partial mitigation penalized |
| 13 | Entry limit expires | Order canceled | 16.12 expiry → `CANCELED`; strategy S2.2 `strategy.cancel` + `ENTRY_CANCELED` webhook |
| 14 | Target trades before limit entry | Setup canceled | 16.12 `tgtFirst` branch → cancel path as #13 |
| 15 | Entry and stop in same historical bar | Conservative behavior | Emulator conservative sequencing + `backtest_fill_limits_assumption=1` + optional strict-fill ticks + Bar Magnifier recommended; indicator monitor counts it as closed, never as a win |
| 16 | Friday cutoff passed | No new entries | `dayOk` requires Friday bar inside `sessFriOk` window |
| 17 | Daily loss limit reached | Risk lockout | S0: `dayR ≤ −dailyStopR` → `riskLocked`, pending canceled, `RISK_LOCKOUT` webhook, persists until new day |
| 18 | Same sweep visible for multiple bars | One setup ID, one alert | Level is single-use (`swept` flag); setup latch prevents re-entry; ID is deterministic per sweep |
| 19 | Script reload | Confirmed signals stay on the same bars | All decisions on confirmed bars with reload-stable security calls; verify per validation guide §5 |
| 20 | Indicator & strategy, identical settings | Confirmed signals match | Line-identical core + parity labels; two documented strategy-only divergences (PnL lockouts, open-position latch) in README §4 |
| 21 | Opposing liquidity leaves < min R:R | Rejected | `f_draw` only returns targets with `rr ≥ minRR`; `rr` gate before scoring; `< 1R` opposing level penalized or (option) rejected |
| 22 | Abnormally large signal candle | Penalized / rejected | `chaseBar` (> maxSignalAtr × ATR) hard-rejects; ATR-percentile spike penalty on top |
| 23 | Setup during lunch | Rejected by default | `sessionEligible` requires `not inLunch` unless explicitly allowed |
| 24 | Breaker already mitigated repeatedly | Rejected / penalized | `z.touches ≤ brkMaxMitig` gate (default 0 = first retest only) + mitigation penalty in score |
| 25 | Max trades per day reached | No additional entry | Signal cap (`sigDay`) + strategy `tradesToday ≥ maxTradesDay` lockout |
| 26 | Webhook event recalculates | No duplicate execution | `idempotency_key = setup_id + event + bar time`; bridge dedup is a documented hard requirement |
