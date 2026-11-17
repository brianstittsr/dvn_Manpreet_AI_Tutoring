# MechaniX Unified Trading Platform — Product Requirements Document

**Version:** 1.0 draft  
**Date:** November 15, 2026  
**Sources:** `docs/Proposal/MechaniX_Platform_Final_Proposal.pdf`, `docs/Proposal/All-in-One_Trading_Platform_and_MechaniX_Scanner_Developer_Brief.pdf`, supplied SaaS workspace screenshot, and current `svp-platform` codebase review.

---

## 1. Product vision

MechaniX is a unified trading education, practice, community, analytics, and eventual execution platform. A trader should be able to learn a MechaniX concept, practice it on a chart, submit evidence for coach review, discuss it with the community, journal performance, and progress from simulation to connected live trading without moving between disconnected products.

> **Product principle:** Teach the framework, build the habit, keep the journey connected.

The platform does not promise trading outcomes. Scanner results, coach feedback, analytics, and simulated results are educational decision-support artifacts, not financial advice or guaranteed trade recommendations.

---

## 2. Product goals

1. Replace scattered LMS, charting, journaling, community, scanner, and trade-review tools with one branded MechaniX workspace.
2. Create a measurable learner journey from onboarding through course completion, practice proficiency, coach approval, and live-trading readiness.
3. Provide chart-based practice and replay using TradingView-like interaction patterns, with `lightweight-charts` as the initial production renderer.
4. Support multi-market instruments across forex, futures, stocks, and crypto through one canonical instrument model.
5. Give coaches visibility into learning, practice behavior, journal quality, and risk discipline.
6. Add broker/account connectivity, prop-firm simulation, live execution, order-flow analytics, and trade copying in staged releases only after technical, legal, licensing, and partner feasibility is confirmed.

---

## 3. Non-goals for the mock/design phase

- No real market-data subscription or live prices.
- No real brokerage, prop-firm, MT4, MT5, Rithmic, Tradovate, CQG, or exchange integration.
- No real order placement, account synchronization, copying, or fund movement.
- No production migration of the existing LMS database.
- No financial advice, auto-trading recommendation engine, or performance guarantee.

---

## 4. Users, personas, and roles

### 4.1 Personas

| Persona | Description | Primary jobs |
|---|---|---|
| New trader | Joins through masterclass, onboarding, or free course | Learn foundations, build routine, practice safely |
| Developing trader | Has completed basics and needs repetition/feedback | Practice setups, submit charts, review journal, improve discipline |
| Funded/live trader | Operates prop or brokerage accounts | Connect accounts, monitor rules, journal verified trades |
| Coach/mentor | Reviews learners and provides feedback | View progress, assess submissions, monitor risk/journal quality |
| Community member | Participates in discussion and peer learning | Ask questions, share chart analyses, follow topics |
| Operations/admin | Maintains curriculum, rules, integrations, users | Configure courses, prop rules, instruments, permissions |
| Compliance/support | Investigates account, audit, access, and safety issues | Audit access, support users, enforce policies |

### 4.2 Canonical roles

The production role model should normalize the current platform's mixed roles into:

| Role | Capabilities |
|---|---|
| `student` | Learn, practice, submit work, journal own data, manage own connected accounts |
| `coach` | Review explicitly shared student progress, submissions, journal summaries, risk behavior |
| `mentor` | Optional elevated coaching role with broader assigned-cohort access |
| `community_moderator` | Moderate discussion, reports, pinned content |
| `admin` | Manage curriculum, rules, instruments, integrations, users, feature flags |
| `support` | Read-only support views and audit-safe troubleshooting |
| `superadmin` | Global administration and security controls |

Mentor/coach access to student trading history must be grant-based, scoped, revocable, and audit-logged.

---

## 5. Information architecture

Recommended top-level product areas:

1. **Dashboard** — learner/trader journey, progress, today's routine, alerts, recent activity.
2. **Learn** — MechaniX Academy, learning paths, courses, lessons, workshops, assignments.
3. **Practice** — chart workspace, replay, simulation accounts, practice plans, chart submissions.
4. **Markets** — watchlists, instrument details, market overview, alerts.
5. **Scanner** — MechaniX opportunity scanner and filtered setup lists.
6. **Trade** — connected accounts, orders, positions, DOM/order ticket, execution status.
7. **Journal** — track record, imported/manual trades, notes, screenshots, tags, review.
8. **Community** — discussions, chart posts, learning questions, mentor replies, trending topics.
9. **Coach** — assigned learners, submissions, performance, intervention queue.
10. **Admin** — curriculum, prop rules, instruments, market-data providers, integrations, roles.
11. **Settings** — profile, subscription/billing, notifications, connected services, privacy.

---

## 6. Functional requirements

### 6.1 Identity, onboarding, and learner journey

**Priority: Must**

- Email/password authentication initially; support future SSO/social login if needed.
- Stable internal `user_id` shared across Firebase LMS and future relational trading records.
- Role selection and access assignment by admin; public users default to `student`.
- Onboarding captures goals, market interests, experience level, timezone, risk acknowledgment, and coaching relationship.
- Risk disclosure and terms acceptance stored with timestamp/version.
- Learner dashboard shows track progress, next lesson, practice assignments, coach feedback, and community prompts.
- Admin can invite, suspend, deactivate, and impersonate safely for support only with audit logging.

**Acceptance criteria**

- A user can register, accept required disclosures, select market interests, and land on a personalized dashboard.
- Every learner artifact references the same durable user ID across LMS and trading systems.
- Role changes do not require changing historical learning, journal, or trade records.

---

### 6.2 MechaniX Academy / Learn

**Priority: Must**

Reuse and adapt the existing LMS foundation.

- Course catalog with categories, difficulty, instructor, duration, pricing, tags, prerequisites, and publication state.
- Learning path/track view matching the MechaniX curriculum (for example: Trading Mindset, Market Structure, Supply & Demand, Trade Planning, Risk Management, Execution & Review).
- Course modules and ordered lessons.
- Lesson types:
  - Video
  - Text/article
  - Quiz
  - Assignment
  - Downloadable resource
  - Live session
  - AI-guided lesson
  - Student interview
  - **New:** chart task / trading evidence submission
- Progress tracking at lesson, module, course, and learning-path level.
- Quiz attempts, passing score, review, retry policy, and completion status.
- Certificate issuance after completion.
- Course purchases and subscription/paid-program entitlements through Stripe.
- Coach-visible course reports.

**Should**

- Live workshop scheduling, registration, attendance, recordings, and reminders.
- Downloadable routine/checklist templates.
- Personalized recommended next lesson based on course progress and practice outcomes.

**Acceptance criteria**

- A learner can enroll, complete lessons, pass quizzes, submit assignments, and receive a certificate.
- A coach can see a student's enrollment status, lesson progress, quiz history, submissions, and course report.
- A chart-task lesson can require a saved chart screenshot/drawing submission before completion.

---

### 6.3 Practice chart workspace

**Priority: Must**

The screenshot's light SaaS practice workspace is the target interaction model.

- Symbol selector with multi-market instruments.
- Timeframes: minute, hour, day, week, month; configurable common intervals.
- Candlestick chart with volume pane, crosshair, price scale, time scale, session context.
- Supply/demand zones and MechaniX annotations.
- Price lines, markers, notes, and basic drawing tools.
- Saved chart layouts per user.
- Simulation/live visual mode toggle that prevents ambiguity.
- Order ticket for simulated trades: market, limit, stop, quantity, stop loss, take profit, estimated risk/reward.
- Positions/orders panel for simulated account.
- Practice checklist linked to the MechaniX method.
- Chart note/analysis panel linked to lessons and community posts.
- Concept/illustrative-data label when not connected to licensed real-time data.

**Should**

- Bar replay with speed controls, step-forward/backward, and replay-specific simulated trading.
- Multiple synchronized chart panes/layouts.
- Alert presets and saved drawing templates.
- Chart screenshot/export for assignments, community, and journal.
- Indicator library beginning with core SMA/EMA/RSI/MACD/ATR/volume indicators.

**Future / separate release**

- Full TradingView-style 100+ drawing tools, Pine-compatible scripts, community indicator marketplace, DOM, advanced order brackets.

**Acceptance criteria**

- A learner can select an instrument/timeframe, draw zones, place a simulated order, and see risk/reward before submission.
- A saved layout restores symbol, timeframe, drawings, indicators, and zone overlays for that user only.
- Replay mode clearly identifies historical simulation and prevents simulated fills from entering verified live history.

---

### 6.4 TradingView-inspired chart capability matrix

| Capability | Lightweight Charts status | MechaniX plan |
|---|---|---|
| Candles, bars, line, area, baseline, histogram | Native | Use for core charting |
| Volume pane / multi-pane | Native panes | Use for volume, delta, indicators |
| Price lines and markers | Native | Use for entry, SL, TP, zones, alerts |
| Real-time updates | Native API | Connect normalized websocket stream |
| Multiple series / comparisons | Native | Add multi-instrument overlay |
| Custom overlays/plugins | Supported extension point | Supply/demand zones, checklist markers, scanner overlays |
| Drawing suite | Custom build | Start with trendline, horizontal line, rectangle/zone, arrow, text/note |
| Indicators | Custom build | Begin with core set; expand later |
| Multi-chart layouts | Custom build | Phase 2 grid + symbol/timeframe/crosshair sync |
| Bar replay | Custom build | Time cursor over historical bars + simulated fills |
| Alerts | Custom backend | Price, indicator, drawing, scanner, watchlist alerts |
| DOM | Custom build + provider data | Later phase, requires L2 data and provider terms |
| Order ticket | Custom build | Phase 1 simulated; Phase 3 broker-backed |
| Account manager | Custom build | Simulated first; connected accounts later |
| Pine Script/public indicators | Not available | Do not promise in initial scope |
| TradingView broker UI | Not available | Custom broker adapter if live trading proceeds |

---

### 6.5 Simulation and prop-firm challenge engine

**Priority: Should / Phase 2**

- User selects account type: practice, prop challenge, funded simulation, or live-connected later.
- Configurable initial balance, currency, leverage/margin assumptions, instrument permissions, commissions, spread/slippage model.
- Rule templates for prop firms:
  - Profit target
  - Daily loss limit
  - Maximum drawdown
  - Trailing drawdown
  - Consistency rule
  - Minimum trading days
  - News/overnight restrictions
  - Contract/position limits
- Real-time progress toward each rule, warnings, breach status, pass/fail outcome.
- Admin UI to version and maintain firm-specific rules.
- Every rule evaluation is timestamped, explainable, and reproducible.

**Acceptance criteria**

- Admin can create a versioned rule set and assign it to a simulated account.
- Each simulated fill updates rule state and shows remaining room before breach.
- A breach produces a clear reason, timestamp, equity snapshot, and audit event.

---

### 6.6 Markets, watchlists, and alerts

**Priority: Must**

- Multi-market instrument browser: forex, futures, stocks, crypto.
- Instrument detail page: chart, sessions, contract metadata, quote status, related lessons, related scanner setups.
- Multiple named watchlists with sorting, grouping, color tags, and per-symbol notes.
- Quote status supports delayed, real-time, unavailable, and licensed-required states.
- Alerts on price, indicator value, drawing interaction, scanner match, and rule threshold.
- Delivery through in-app notifications initially; email/webhook/mobile push later.

**Acceptance criteria**

- A user can build separate watchlists and open a chart directly from any symbol.
- Alert records include owner, instrument, condition, delivery channel, status, triggered timestamp, and audit metadata.
- Unlicensed data is labeled and never silently represented as real-time.

---

### 6.7 MechaniX Opportunity Scanner

**Priority: Could / later project after data and rules are validated**

- Scan selected instruments/timeframes/watchlists.
- MechaniX Four Filter Checklist:
  1. Zone
  2. Freshness
  3. Trapped Participants
  4. Math (minimum 1:2 risk/reward)
- Scored and ranked setup list with direction, timeframe, zone range, checklist status, confidence, timestamp, and chart link.
- Filters for market, direction, timeframe, score, freshness, and watched symbols.
- Alert on newly identified setups.
- Scanner explanation panel showing why each criterion passed/failed.
- Backtesting/validation reports before enabling production alerts.

**Important product language**

Scanner outputs are **potential educational setups**, not guaranteed trades or personalized financial advice.

**Acceptance criteria**

- Admin can version scanner logic and run it against a defined universe.
- Each result links to a chart with the same zones/checklist rendered.
- A scanner configuration change does not mutate historical result explanations.

---

### 6.8 Live trading and connected accounts

**Priority: Future / Phase 3 after partner discovery**

- Connect supported brokerage, prop, MT4, MT5, or platform accounts.
- Read balances, positions, open orders, fills, account metadata, and applicable prop rules.
- Place, modify, and cancel orders from chart, ticket, or DOM where partner APIs permit.
- Show connected account health, sync errors, latency, permissions, and entitlement gaps.
- Broker/provider credentials stored server-side in a secrets manager; never in client-readable Firestore.
- Order workflows include confirmation, risk checks, idempotency, audit event, and failure recovery.
- Live and simulation data remain visually and structurally separate.

**Acceptance criteria**

- A connected account can be synced, disconnected, and reconciled without duplicating fills.
- Order submission requires authenticated user, account ownership, permission check, risk check, provider call, idempotency key, and audit record.
- Users can distinguish verified provider records from manual/simulated records.

---

### 6.9 Integrated journal and track record

**Priority: Should / Phase 2**

- Manual journal entries and automatic imports from connected accounts.
- Consolidated track record plus per-account views.
- Metrics: net P&L, win rate, average win/loss, drawdown, profit factor, expectancy, risk-to-reward, streaks, rule adherence.
- Journal fields: thesis, setup type, checklist status, notes, tags, screenshots, mistakes, emotions, review outcome.
- Attach chart state/drawings/screenshots to each trade.
- Verified/synced records clearly separated from manual records.
- Duplicate detection based on provider IDs, timestamps, instrument, quantity, and account.
- Calendar, table, and chart-based performance views.

**Acceptance criteria**

- User can filter trades by account, market, strategy, setup, tag, and date.
- Journal metrics reconcile to underlying executions within a defined tolerance.
- Manual records cannot be marked verified unless imported through an approved provider path.

---

### 6.10 Mentor/coach performance dashboard

**Priority: Should / Phase 2**

- Students explicitly grant scoped access to coaches/mentors.
- Coach sees assigned learners, course progress, practice submissions, journal summaries, risk behavior, and intervention flags.
- Compare progress over time without exposing unnecessary private notes unless the student permits.
- Student can revoke access; revocation takes effect immediately and is audit-logged.
- Coach feedback workflow: requested review, comments, approval status, follow-up tasks.
- Cohort-level aggregates avoid exposing individual private data unnecessarily.

**Acceptance criteria**

- A coach cannot access student trading history without an active grant.
- Access grants define scope, expiration, and permissions.
- Every coach view of sensitive trading data emits an audit event.

---

### 6.11 Community and chart discussion

**Priority: Must**

- Discussion feed with categories: chart analysis, learning questions, trade planning, platform help.
- New post with rich text, tags, market/instrument, timeframe, chart snapshot or saved chart reference.
- Replies, likes/reactions, mentions, pinned/locked threads, moderation and reporting.
- Trending topics sidebar and search.
- Link community discussion to courses, lessons, chart layouts, scanner setups, and journal reviews.
- Coach/instructor replies visibly labeled.
- Role-aware moderation tools and abuse reporting.

**Acceptance criteria**

- User can publish a post with a chart image/reference and tag it by topic.
- Moderator can pin, lock, hide, or remove content with audit logging.
- Community notifications respect user preferences.

---

### 6.12 Multi-account trade copier

**Priority: Future / high-risk**

- Connect and organize multiple supported accounts.
- Designate lead account and follower accounts.
- Copy orders/fills with configurable sizing, symbol/account mapping, risk constraints, and exclusion rules.
- Show connection status, execution result, failures, mismatches, and pause/resume controls.
- Per-account and per-firm copying permissions checked before enabling.
- Copying policy disclosures and audit trail.

**Acceptance criteria**

- Copy configuration is disabled until broker/firm policy and technical permissions are verified.
- Every copied action links to source order, follower order, status, error, and audit event.
- User can pause copying globally or per follower account.

---

### 6.13 Administration

**Priority: Must for MVP admin subset**

- Course/module/lesson management (reuse current LMS admin foundation).
- Student progress and course reporting (reuse current student admin foundation).
- User/role/tenant management.
- MechaniX curriculum/track management.
- Instrument and provider-symbol mapping.
- Prop-firm rule templates and versions.
- Scanner configuration and validation reports.
- Market-data provider status, entitlement, and audit dashboards.
- Integration credentials stored through server-side settings/secrets.
- Feature flags and environment management.
- Audit log explorer.

**Acceptance criteria**

- Admin can update a rule template without mutating historical evaluations.
- Admin can add a new provider symbol mapping without code changes.
- Support staff cannot view secrets or modify trading records.

---

### 6.14 Billing and subscriptions

**Priority: Must**

- Free, paid course, subscription, and coaching-program entitlements.
- Stripe checkout/customer portal.
- Product/price mapping to role or entitlement plan.
- Access control by plan, cohort, or explicit grant.
- Payment, refund, and entitlement audit events.
- Clear handling of third-party market-data fees or pass-through fees if required.

**Acceptance criteria**

- Successful payment grants the correct entitlement automatically.
- Refund/cancellation removes or downgrades access without deleting historical learning/trading data.
- Billing state is visible in account settings and admin support tools.

---

### 6.15 Notifications

**Priority: Must**

- In-app notification center and preferences.
- Event categories: course progress, coach feedback, community replies, chart alerts, simulation rule warnings, scanner matches, account sync failures.
- Email notifications for critical/high-value events.
- Quiet hours, channel preferences, unsubscribe/compliance handling.
- Future: push, SMS, webhook delivery.

**Acceptance criteria**

- Notification records contain recipient, type, source entity, delivery state, read state, and timestamp.
- Users can disable nonessential channels without losing critical security notices.

---

## 7. Data requirements

### 7.1 Core entities

- Tenant/organization
- User/profile/role assignment
- Coach/student access grant
- Course/module/lesson/enrollment/progress/submission
- Community thread/reply/reaction/report
- Instrument/provider symbol/market calendar
- Watchlist/alert/saved chart layout/drawing
- Simulation account/session/rule evaluation
- Connected account/provider credential reference
- Order/execution/position/account balance snapshot
- Journal entry/trade review/import batch
- Scanner definition/result/explanation
- Notification/audit event
- Billing entitlement/payment record

### 7.2 Required data qualities

- Multi-market canonical instrument model with provider mappings.
- Tenant-scoped access and row-level authorization.
- Immutable audit history for sensitive operations.
- Idempotent ingestion and duplicate prevention.
- Clear distinction between illustrative, delayed, real-time, simulated, manual, imported, and verified records.
- Versioned rules, scanner definitions, disclosures, and curriculum.
- Partitioned high-volume data by time, market, and instrument.

---

## 8. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | Chart interactions under ~100 ms local response; quote updates incremental; avoid full dataset reloads |
| Scalability | Separate read APIs, ingestion workers, cache, queue, and time-series partitions |
| Availability | MVP target 99.5%; live trading pilot target and failover must be separately defined |
| Security | Server-side secrets, least privilege, encrypted transport/storage, RLS or equivalent, audit logging |
| Privacy | Mentor visibility by explicit grant; user can revoke; data retention documented |
| Accessibility | WCAG 2.1 AA-oriented design, keyboard navigation, visible focus, readable contrast |
| Observability | Structured logs, ingestion lag, provider errors, order failures, scanner run metrics |
| Compliance | Risk disclosures, educational positioning, terms versioning, market-data entitlement enforcement |
| Reliability | Duplicate prevention, reconciliation, retry/backoff, provider outage behavior |
| Maintainability | Provider adapters, versioned rules, typed schemas, modular feature domains |

---

## 9. Analytics and success metrics

- Activation: completed onboarding, first lesson, first practice chart, first community post.
- Learning: lesson completion, quiz pass rate, course completion, certificate count.
- Practice: chart sessions, replay minutes, drawings saved, simulated orders, assignment submissions.
- Coaching: review turnaround, approval rate, feedback loops, at-risk learner detection.
- Trading/journal: imported trades, journal completion rate, verified record coverage, rule breaches.
- Community: posts, replies, helpful answers, retention, moderation actions.
- Scanner: setup count, precision/validation metrics, alert opt-ins, false-positive review rate.
- Platform: DAU/WAU/MAU, cohort retention, paid conversion, churn, provider sync health.

---

## 10. Release strategy

- **Release 0 — Design/documentation:** PRD, gap analysis, architecture, screen mocks, provider decisions.
- **Release 1 — Learn/Practice/Community:** MechaniX branding, academy, practice chart, simulated order ticket, chart tasks, community, notifications.
- **Release 2 — Performance/Prop/Journal:** prop rules, deeper simulation, journal/track record, coach dashboard, permissions.
- **Release 3 — Connected Trading:** account connections, verified imports, order pilot, reconciliation, compliance controls.
- **Release 4 — Intelligence/Scale:** scanner, order-flow analytics, copier, advanced replay/layouts, production hardening.

---

## 11. Open decisions

1. Initial markets and exact instrument universe.
2. Market-data vendor(s) and redistribution/licensing model per market.
3. Broker, prop-firm, MT4/MT5, Rithmic, Tradovate, CQG, or other partner order.
4. Whether scanner logic is deterministic rules, AI-assisted ranking, or hybrid.
5. Live execution jurisdiction, brokerage entity relationships, legal review, and user-risk disclosures.
6. Whether order-flow features justify dedicated market-data infrastructure in early phases.
7. Mobile posture: responsive web first versus native/webview companion later.
8. TradingView Advanced Charts/Trading Platform migration criteria if Lightweight Charts custom work becomes too expensive.

---

## 12. Acceptance definition for the full product

The platform is considered feature-complete for the merged proposal when a learner can:

1. Register and enter a MechaniX learning track.
2. Complete lessons, quizzes, live sessions, downloads, AI lessons, and chart assignments.
3. Practice on multi-market charts with replay, zones, notes, saved layouts, and simulated orders.
4. Participate in community chart discussions and receive coach feedback.
5. Run or review a prop-style simulated account against versioned rules.
6. Maintain a verified/manual trading journal and share scoped access with a mentor.
7. Connect an approved account and monitor balances/orders/positions.
8. Receive scanner opportunities linked to chart evidence.
9. Use order-flow/depth capabilities where licensed data permits.
10. Manage profile, billing, alerts, privacy, and connected integrations in one workspace.
