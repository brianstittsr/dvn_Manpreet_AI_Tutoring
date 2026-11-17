# MechaniX Platform Project Plan

**Version:** 1.0 draft  
**Date:** November 15, 2026

This plan converts the merged PRD into phased delivery. Estimates are planning ranges, not binding quotes. Third-party licensing, exchange fees, broker approvals, prop-firm permissions, and compliance review can materially change cost and schedule.

---

## 1. Delivery strategy

Build the platform in stages so the education/community foundation can launch before the technically and legally harder trading integrations.

| Phase | Goal | Duration | Estimated implementation cost |
|---|---|---:|---:|
| Phase 0 — Discovery & architecture | Confirm scope, data providers, roles, schema, UX, compliance boundaries | 6–8 weeks | $25k–$45k |
| Phase 1 — Learn + Practice + Community MVP | MechaniX workspace, academy, basic chart/simulation, community, coach review | 16–20 weeks | $28k proposal baseline, or $100k–$160k market-rate scope |
| Phase 2 — Simulation, journal, mentor | Prop rules, replay depth, journal/track record, grants, alerts | 14–18 weeks | $80k–$130k |
| Phase 3 — Connected accounts/live pilot | Broker/account sync, verified imports, order pilot, reconciliation | 16–24 weeks | $120k–$220k |
| Phase 4 — Order flow, scanner, copier | Advanced analytics, scanner, multi-account copier, hardening | 20–28 weeks | $160k–$280k |

### Total planning estimate

- **Proposal-baseline scenario:** approximately **$413k–$703k** if the $28k Phase 1 offer remains constrained to the final proposal's learning/practice/community launch scope.
- **Market-rate Phase 1 scenario:** approximately **$485k–$835k** if Phase 1 also includes broader database separation, polished SaaS UX, real market-data plumbing, and deeper simulation.
- **Timeline:** approximately **14–22 months** with overlapping workstreams, or **20–28 months** if phases are fully serial.
- **Excluded:** market-data licenses, exchange fees, broker/prop fees, legal/compliance counsel, taxes, payment processing, support retainers, and customer content creation.

---

## 2. Phase details

## Phase 0 — Discovery, architecture, and product validation

**Duration:** 6–8 weeks  
**Estimated cost:** $25k–$45k

### Scope

- Confirm target markets and initial instrument universe.
- Select chart data provider candidates and determine licensing/entitlement constraints.
- Select broker/prop/integration candidates for later phases.
- Finalize roles, tenant model, coach grants, privacy model, and audit requirements.
- Design hybrid Firestore + PostgreSQL + time-series architecture.
- Produce provider-adapter interfaces and schema migration plan.
- Finalize MechaniX curriculum structure and coach workflow.
- Validate SaaS UX with mock screens and stakeholder review.
- Legal/compliance review for education, trading, performance display, scanner language, data licensing, and broker execution.

### Deliverables

- Signed-off PRD and acceptance criteria.
- Provider/integration decision log.
- Entity-relationship and migration plan.
- Environment/security plan.
- MVP release backlog and statement of work.

### Exit criteria

- Market and provider shortlist selected.
- MVP scope and acceptance criteria approved.
- No unresolved blocker around data rights, role privacy, or production architecture.

---

## Phase 1 — MechaniX foundation: Learn + Practice + Community

**Duration:** 16–20 weeks  
**Estimated cost:** $28k proposal baseline / $100k–$160k market-rate scope

### Scope

- Rebrand portal into MechaniX workspace using the approved light-green SaaS direction.
- Canonical role cleanup and feature navigation.
- User onboarding: goals, markets, experience, timezone, risk acknowledgment.
- Reuse existing LMS for MechaniX Academy:
  - Courses, modules, lessons, quizzes, assignments, downloads
  - AI lessons and student interviews where appropriate
  - Learning paths/tracks
  - Certificates and progress
- Community:
  - Threads, replies, categories, reactions, search, moderation, notifications
  - Chart post/snapshot support
- Practice:
  - `lightweight-charts` chart renderer
  - Static or delayed market-data adapter initially
  - Candles/volume, timeframes, symbols, zones, markers, notes
  - Saved layouts and drawing persistence
  - Basic simulated order ticket and simulated account state
  - Replay MVP if data availability supports it
- Coach workflow:
  - Chart-task submissions
  - Feedback/status/approval
  - Student learning dashboard improvements
- Notifications:
  - Course, community, submission, simulated-rule warnings
- Firestore rules hardening for LMS/community.

### Deliverables

- Production-ready Learn/Practice/Community release.
- Admin-managed curriculum and initial prop/practice configuration stubs.
- Explicitly labeled simulation/illustrative data.
- Pilot-ready learner cohort.

### Dependencies

- Firebase Auth/Firestore existing LMS.
- PostgreSQL for new trading/simulation/community entities if not deferred.
- Initial market-data provider or licensed sample/delayed dataset.
- Lightweight Charts.

### Exit criteria

- Cohort can complete a lesson, practice on a chart, submit evidence, discuss it, and receive coach feedback.
- No real-money execution or verified trade claims.

---

## Phase 2 — Simulation depth, prop rules, journal, and mentor dashboard

**Duration:** 14–18 weeks  
**Estimated cost:** $80k–$130k

### Scope

- Prop-firm account simulation:
  - Account sizes, balances, profit targets, loss limits, drawdowns, consistency, minimum days, restrictions, contract limits
  - Versioned rule templates and admin editor
  - Real-time warnings and pass/fail outcomes
- Realistic fill model:
  - Commissions, spread, slippage assumptions, session rules
- Journal/track record:
  - Manual entries, simulated trade review, screenshots, tags, strategy classification
  - Track-record metrics and account views
  - Import framework for later verified accounts
- Mentor dashboard:
  - Grant-based student performance, practice/journal/risk views
  - Revocation and audit logs
- Alerts:
  - Price/indicator/zone/scanner/rule notifications
- Chart upgrades:
  - More indicators, drawing types, multi-pane layout, replay controls

### Deliverables

- Prop-style simulation and journal release.
- Mentor review and permission model.
- Admin rules/instrument management.

### Exit criteria

- A learner can run a rules-based challenge, journal results, and share scoped progress with a mentor.
- Historical evaluations are reproducible against versioned rules.

---

## Phase 3 — Connected accounts and live trading pilot

**Duration:** 16–24 weeks  
**Estimated cost:** $120k–$220k

### Scope

- Connected account framework:
  - OAuth/API-key adapters as partners permit
  - MT4/MT5/broker/prop import options where technically feasible
  - Encrypted server-side credential handling
- Synchronization:
  - Balances, positions, orders, fills, account metadata
  - Duplicate detection and reconciliation
- Verified track record:
  - Synced trades marked verified
  - Manual/imported/simulated distinction
- Order pilot:
  - Read-only first, then limited approved order placement
  - Chart/order-ticket integration, order state machine, risk checks, audit trail
- Compliance:
  - Terms, disclosures, permissions, data handling, incident procedures

### Deliverables

- Connected-account and verified-journal pilot.
- Limited live/demo order workflow for approved partners only.

### Exit criteria

- Partner-approved account can sync without duplicates and reconcile local state.
- If order placement is enabled, it passes audit, idempotency, failure-recovery, and user-permission tests.

---

## Phase 4 — Order flow, scanner, copier, and scale

**Duration:** 20–28 weeks  
**Estimated cost:** $160k–$280k

### Scope

- Order-flow analytics:
  - Volume profile, POC/value area
  - Footprint/delta
  - Liquidity heatmap
  - Big-trade markers
  - DOM where licensed/supported
- MechaniX Opportunity Scanner:
  - Four Filter Checklist implementation
  - Scoring/explanation/backtesting
  - Watchlist scanning and alerts
- Multi-account copier:
  - Lead/follower configuration
  - Sizing/risk controls, account mapping, pause/resume
  - Execution discrepancy reporting
- Advanced workspace:
  - Multi-chart layouts and sync
  - Advanced replay
  - Additional indicators/drawing tools
- Scale:
  - Dedicated ingestion workers, partitions, caching, monitoring, failover

### Deliverables

- Scanner release after validation.
- Advanced charting/order-flow release where data licenses permit.
- Trade copier only for technically and contractually supported accounts.

### Exit criteria

- Scanner results are explainable and validated before user alerts.
- Copier can be disabled safely and exposes discrepancies.
- System meets agreed data-volume and latency targets.

---

## 3. Staffing assumptions

Planning ranges assume a blended team, not necessarily all roles full-time:

| Role | Phase involvement |
|---|---|
| Product manager / business analyst | Phases 0–4 |
| UX/product designer | Phases 0–2, lighter 3–4 |
| Full-stack Next.js engineer | Phases 1–4 |
| Backend/data engineer | Phases 0–4, heaviest 2–4 |
| Trading/market-data engineer | Phases 0–4, heaviest 2–4 |
| QA/test engineer | Phases 1–4 |
| DevOps/SRE | Phases 1–4 |
| Compliance/legal advisor | Phases 0, 3, 4 |
| MechaniX domain expert/coach | Phases 0–4 for curriculum, rules, acceptance |

---

## 4. Hosting and third-party cost model

### 4.1 Design/prototype environment

| Item | Estimated monthly cost |
|---|---:|
| Vercel Hobby or minimal Pro | $0–$20 |
| Firebase Spark/minimal Blaze | $0–$25 |
| Static/sample data | $0 |
| Domain amortization | $1–$2 |
| **Estimated total** | **$0–$50** |

### 4.2 MVP production/staging environment

| Item | Estimated monthly cost |
|---|---:|
| Vercel Pro | $20 per deploying seat + usage |
| Firebase Blaze | $25–$200 typical early usage |
| Managed PostgreSQL | $25–$200 |
| Redis/cache | $10–$100 |
| Queue/worker runtime | $20–$200 |
| Object storage/backups | $10–$100 |
| Email/monitoring/logging | $20–$150 |
| **Estimated infrastructure** | **$150–$700 before market data** |

### 4.3 Real-time production environment

| Item | Estimated monthly cost |
|---|---:|
| App hosting + workers | $200–$800 |
| Managed Postgres | $100–$500 |
| Time-series store | $150–$1,000 |
| Redis/queues/websockets | $100–$600 |
| Logging/monitoring/backups | $100–$500 |
| Storage/CDN | $50–$300 |
| **Estimated infrastructure** | **$800–$3,500+ before market data** |

### 4.4 Market-data and integration costs

| Vendor/type | Public-plan reference point | Notes |
|---|---:|---|
| Lightweight/delayed forex/crypto/stocks feed | ~$50–$300/month | Suitable for MVP only if redistribution/display rights fit |
| Databento CME Standard | ~$199/month | Published plan reference; licensing terms still apply |
| Databento Plus | ~$1,750/month | Higher history/live-data capabilities |
| Tradovate API add-on | ~$25/month/account | Account/order API; real-time market data requires separate entitlement |
| Rithmic API via broker | ~$125/month/user plus exchange/routing fees | Provider/broker dependent; conformance required |
| CME/exchange redistribution/professional data | Quote/contract required | Can materially exceed SaaS infrastructure costs |
| Video hosting/AI/email | Usage-based | Budget separately once content volume is known |
| Stripe | Percentage/transaction fees | Payment processing and Billing fees vary by configuration |

---

## 5. Operational budget after launch

Estimated monthly operating budget:

| Scenario | Monthly estimate | Includes |
|---|---:|---|
| Pilot cohort | $300–$1,000 | App hosting, Firebase, managed DB, storage, email, monitoring |
| Growth SaaS | $1,000–$5,000+ | More database, workers, notifications, retention, support tooling |
| Real-time order-flow product | $3,000–$15,000+ | Time-series storage, ingestion, L2/tick data, monitoring, redundancy |
| Licensed multi-market platform | Highly variable | Add exchange/vendor redistribution and partner fees |

---

## 6. Milestone schedule

| Milestone | Target |
|---|---|
| PRD/gap/architecture/mock screens complete | Week 0 deliverable |
| Phase 0 partner/data decisions | Weeks 1–8 |
| Phase 1 alpha | Month 3 |
| Phase 1 pilot | Month 4–5 |
| Phase 2 beta | Month 7–9 |
| Phase 3 limited pilot | Month 11–15 |
| Phase 4 advanced release | Month 15–22 |

Dates depend on provider approvals and whether phases overlap.

---

## 7. Risk register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Full roadmap exceeds expected budget | High | High | Stage scope; keep Phase 1 narrowly defined |
| Market-data licensing unavailable/expensive | Medium-high | High | Start with delayed/internal-only data; contract review before build |
| Broker/prop APIs cannot support desired flows | High | High | Partner discovery before committing to live execution |
| Firestore security exposes sensitive records | Medium | High | Explicit rules, server-only trading mutations, security review |
| Lightweight Charts custom-work balloons | Medium | Medium-high | Start with limited toolset; define Advanced Charts migration trigger |
| Multi-market schema underestimated | Medium | High | Canonical instrument/provider mapping in Phase 0 |
| Scanner outputs mistaken for advice | Medium | High | Educational labeling, explainability, legal review |
| Copier violates firm/platform rules | Medium | High | Per-provider permission checks and policy gates |
| Data retention costs exceed plan | Medium | Medium | Tiered retention/downsampling/storage policies |
| Role/privacy model leaks student data | Medium | High | Grant-scoped access, RLS/service checks, audit events |

---

## 8. Acceptance gates

### Phase 1 acceptance

- MechaniX learner can complete a lesson and chart task.
- Simulated order and chart annotations are clearly labeled and persisted.
- Community and coach feedback workflows operate securely.
- No live account or market-data entitlement misrepresentation.

### Phase 2 acceptance

- Prop simulation evaluates versioned rules accurately.
- Journal metrics reconcile to simulated/imported executions.
- Mentor access is grant-scoped, revocable, and audited.

### Phase 3 acceptance

- Connected account sync is reliable, deduplicated, and reconciled.
- Live order pilot passes partner, security, audit, and failure-recovery review.

### Phase 4 acceptance

- Scanner results are explainable, versioned, and validated.
- Order-flow displays match licensed data and performance targets.
- Copier includes pause, discrepancy, permission, and audit controls.
