# MechaniX Platform Gap Analysis

**Version:** 1.0 draft  
**Date:** November 15, 2026  
**Codebase reviewed:** `svp-platform` Next.js/Firebase application

This document compares the current application against the merged requirements in `PRD.md`.

---

## 1. Executive summary

The repository already contains a strong **education-platform foundation**: Firebase Auth/Firestore, LMS course/module/lesson models, enrollments, progress, quizzes, certificates, AI-guided lessons, student interviews, course checkout, student-progress administration, notifications, role-gated portal navigation, and shadcn/Tailwind UI primitives.

It does **not** currently contain the trading product: there is no MechaniX information architecture, chart workspace, market-data layer, simulation engine, prop-rule engine, community implementation, chart-assignment workflow, journal, broker/account connectivity, order-flow tooling, scanner, or trade copier.

The fastest path is to **reuse the LMS/admin/Firebase foundation** and add a separate trading domain architecture rather than trying to store financial state and high-volume market data in Firestore.

---

## 2. Readiness by domain

| Domain | Readiness | Assessment |
|---|---:|---|
| Application framework/UI | High | Next.js 16, React 19, TypeScript, Tailwind, shadcn components are production-ready foundations |
| Authentication/profile | Medium | Firebase Auth exists, but role taxonomy and portal access need normalization |
| LMS courses/progress | High | Existing course, lesson, enrollment, progress, quiz, certificate models are reusable |
| AI learning | High | GPT lesson and interview systems already exist |
| Course checkout/billing | Medium | Stripe course/event checkout exists; subscription/entitlement model needs expansion |
| Admin LMS/student progress | Medium-high | Academy admin and student progress pages exist but need MechaniX-oriented workflows |
| Community | Low | Discussion TypeScript types exist, but no meaningful UI/service/rules implementation found |
| Practice charting | None | No charting package, market data, layouts, replay, zones, drawing persistence, or simulated order ticket |
| Simulation/prop rules | None | No trading account model, fill engine, risk-rule engine, or challenge state |
| Markets/watchlists/alerts | Low | Notification service exists; no instruments, watchlists, alert rules, quotes, or market UI |
| Journal/track record | None | No executions, imports, performance metrics, tags, screenshots, or verified/manual distinction |
| Coach trading dashboard | Low | Student learning progress exists; no trading-data grants, submissions, or risk review |
| Live accounts/order execution | None | No broker adapters, credentials boundary, order state, reconciliation, or compliance flow |
| Order flow/depth | None | No L2/trade-tick storage, heatmap, footprint, cumulative delta, DOM, or big-trade detection |
| Scanner | None | No scan engine, setup rules, results, ranking, explanations, or alerts |
| Trade copier | None | No connected accounts or copy engine |
| Security/data architecture | Medium-low | Firestore fallback is broad; trading data needs relational/time-series stores and server-side mutations |

---

## 3. Feature-level gap analysis

### 3.1 Platform foundation

| PRD feature | Status | Current evidence | Gap / recommendation |
|---|---|---|---|
| Next.js App Router SaaS app | Available | `app/`, `package.json` | Reuse |
| TypeScript strict development | Available | `tsconfig.json`, typed modules | Reuse; keep new trading types strict |
| shadcn/Radix UI | Available | `components/ui/*` | Reuse for mocks and production |
| Design tokens | Partial | `app/globals.css` currently carries CurioQuest yellow/blue branding | Add isolated MechaniX tokens/theme; avoid breaking existing theme |
| Public/auth route separation | Available | `app/(marketing)`, `app/(portal)` | Keep MechaniX production inside portal; keep design gallery public and isolated |
| Role-gated navigation | Partial | `components/portal/portal-sidebar.tsx`, `lib/feature-visibility.ts` | Current nav reflects business/AI tutoring tools, not trader workflows; add MechaniX feature keys and simplified nav |
| Notifications | Partial | `lib/notification-service.ts`, `app/(portal)/portal/notifications/page.tsx` | Reuse service pattern; add trading alert types/preferences |

### 3.2 Identity, roles, and privacy

| PRD feature | Status | Current evidence | Gap / recommendation |
|---|---|---|---|
| Firebase Auth | Available | `contexts/user-profile-context.tsx`, `lib/firebase.ts` | Reuse for identity |
| User profile | Partial | `contexts/user-profile-context.tsx` | Profile is affiliate/business-oriented; add trader preferences, timezone, experience, market interests, risk acknowledgments |
| Canonical role model | Needs redesign | `UserProfile.role` uses `admin/affiliate/customer/team_member/client`; `TeamMemberDoc` uses `superadmin/admin/team/affiliate/consultant/client` | Introduce MechaniX roles and mapping layer: student/coach/mentor/moderator/admin/support/superadmin |
| Coach access grants | Missing | No grant model found | Add tenant-scoped grants with scope, expiry, revocation, audit |
| Tenant isolation | Missing | No tenant/organization model for trading | Add tenant model in Postgres; Firestore LMS can continue with user-scoped records initially |
| Firestore least privilege | Needs redesign | `firestore.rules` fallback around line 732 permits broad authenticated access | Add explicit rules for community/submissions/coach content; do not rely on fallback |

### 3.3 Learn / MechaniX Academy

| PRD feature | Status | Current evidence | Gap / recommendation |
|---|---|---|---|
| Course catalog | Available | `lib/firebase-lms.ts`, `app/(marketing)/academy/courses` | Rebrand and configure MechaniX categories |
| Modules/lessons | Available | `CourseModuleDoc`, `LessonDoc` in `lib/firebase-lms.ts` | Reuse |
| Video/text/quiz/download/assignment | Available/partial | `types/academy.ts`, lesson viewer | Assignment has display only; add file/chart submission and coach review |
| Live sessions | Partial | `WorkshopDoc`, workshops page | Current public workshops page uses hardcoded sample data; connect to LMS workshop records and registration flow |
| AI-guided lessons | Available | `components/academy/gpt-lesson-player.tsx`, `lib/gpt-lesson-*` | Reuse with trading-specific prompts/safety |
| Student interviews | Available | `components/academy/interview-player.tsx`, `lib/interview-*` | Reuse for learning-style onboarding or readiness interviews |
| Lesson progress | Available | `lib/firebase-lms-student.ts` | Reuse |
| Quiz attempts | Available | `QuizPlayer`, `submitQuizAttempt` | Reuse; add scenario/chart-based questions |
| Certificates | Available | `ensureCourseCertificate`, `app/certificate/[id]` | Reuse |
| Learning paths/tracks | Partial | Types and collection constants exist | No complete user-facing path UI found; build MechaniX track screen |
| Chart tasks | Missing | — | New content type/submission model required |

### 3.4 Community / Connect

| PRD feature | Status | Current evidence | Gap / recommendation |
|---|---|---|---|
| Discussion types | Partial | `DiscussionThread`, `DiscussionReply` in `types/academy.ts` | Types only; implement Firestore/Postgres service and UI |
| Community feed | Missing | No route/component found | Build post composer, categories, replies, reactions, search, moderation |
| Chart posts | Missing | — | Add chart snapshot/layout references and image attachments |
| Coach replies | Missing | `isInstructorReply` type exists | Role-labeled replies and notification flow required |
| Moderation | Missing | — | Add reports, hide/lock/pin, moderator tools, audit |

### 3.5 Practice chart and simulation

| PRD feature | Status | Current evidence | Gap / recommendation |
|---|---|---|---|
| Chart renderer | Missing | `recharts` exists for dashboards, but no financial charting package | Add `lightweight-charts`; use for mock and production renderer |
| Market data | Missing | — | Add provider adapter, normalized schema, websocket/REST ingestion, entitlement handling |
| Multi-market instruments | Missing | — | Add canonical instruments/provider mappings/sessions/calendars |
| Drawing tools/zones | Missing | — | Build custom plugin/state model for lines, rectangles, notes, supply/demand zones |
| Saved layouts | Missing | — | Persist user-specific layout/drawing documents server-side |
| Replay | Missing | — | Build replay cursor/session over historical bars |
| Simulated order ticket | Missing | — | Build account/order/position/fill engine |
| Prop challenge rules | Missing | — | Build versioned rule engine and admin editor |
| Order flow/depth | Missing | — | Requires L2/tick data, time-series schema, and separate later milestone |

### 3.6 Trade, journal, and performance

| PRD feature | Status | Current evidence | Gap / recommendation |
|---|---|---|---|
| Connected accounts | Missing | — | Build provider connection records and server-side token vault |
| Orders/positions/balances | Missing | — | Build relational schema and provider sync/reconciliation |
| Trading journal | Missing | — | Build journal entries linked to executions, notes, tags, screenshots, reviews |
| Track-record metrics | Missing | — | Compute from append-only executions; materialize reporting views |
| Verified/manual records | Missing | — | Add source and verification fields plus duplicate import rules |
| Mentor trading dashboard | Missing | — | Build grant-scoped student performance views |

### 3.7 Scanner and copier

| PRD feature | Status | Current evidence | Gap / recommendation |
|---|---|---|---|
| MechaniX scanner | Missing | — | Define deterministic rules, scoring, explanation, backtesting, alerts |
| Watchlist scanner alerts | Missing | — | Depends on market data, alert engine, scanner service |
| Trade copier | Missing | — | Depends on connected accounts, order engine, firm permissions, risk controls |

---

## 4. Database and architecture gaps

### 4.1 Firestore limitations

Firestore is acceptable for the existing LMS/community metadata at moderate scale, but it should not become the system of record for:

- Orders, executions, positions, balances, account ledger
- Broker/prop synchronization state
- High-frequency candles, ticks, order-book updates, footprints, liquidity history
- Scanner computations over large historical datasets
- Reconciliation and duplicate detection requiring relational joins/transactions

**Recommendation:** keep LMS on Firestore for now; add PostgreSQL for trading/account/journal state and TimescaleDB or ClickHouse for market/time-series data.

### 4.2 Required schema additions

New persistence must cover:

- `tenants`, `tenant_users`, `role_assignments`
- `coach_student_grants`
- `instruments`, `instrument_provider_mappings`, `market_sessions`, `market_calendars`
- `market_entitlements`, `provider_connections`
- `watchlists`, `watchlist_items`, `chart_layouts`, `chart_drawings`, `chart_alerts`
- `simulation_accounts`, `simulation_orders`, `simulation_fills`, `simulation_positions`, `prop_rule_sets`, `prop_rule_evaluations`
- `broker_accounts`, `orders`, `executions`, `positions`, `balance_snapshots`, `sync_runs`, `reconciliation_issues`
- `journal_entries`, `journal_attachments`, `trade_reviews`, `import_batches`
- `scanner_definitions`, `scanner_runs`, `scanner_results`
- `community_threads`, `community_replies`, `community_reactions`, `community_reports`
- `notifications`, `audit_events`, `billing_entitlements`

### 4.3 Current Firestore security gap

`firestore.rules` ends with a broad authenticated fallback. Before community/trading artifacts are added:

- Add explicit collection-level rules for user-generated LMS/community records.
- Keep sensitive GPT/interview data server-only as currently configured.
- Store no broker credentials or trading secrets in Firestore.
- Move all order, balance, account, and provider mutations behind server APIs.

---

## 5. Reuse versus build decisions

| Area | Decision | Rationale |
|---|---|---|
| LMS core | Reuse | Existing models and screens are substantial and aligned with course/progress needs |
| AI lesson/interview | Reuse | Differentiator already built; adapt prompts/content for MechaniX |
| Student progress admin | Reuse/extend | Good base for coach learning dashboard; add trading/journal widgets |
| Stripe checkout | Reuse/extend | Existing checkout patterns; add subscription/entitlement lifecycle |
| Firestore | Retain for LMS/community | Avoid disruptive migration; enforce tighter rules |
| Trading persistence | Build new | Requires transactional integrity, joins, high-volume time-series |
| Chart renderer | Add Lightweight Charts | Open-source and suitable for custom SaaS chart UI; not a Supercharts replacement |
| Community | Build | Types exist but no implemented product |
| Charting tools | Build custom MVP | Start with zones, lines, notes, markers; expand by phase |
| Scanner/copier | Build later | Depends on data/partner discovery and validation |

---

## 6. Prioritized backlog

### P0 — Planning/design only in this phase

- PRD, gap analysis, data architecture, project plan, screen specification.
- Public mock-screen gallery with static data.
- Lightweight Charts dependency and chart mock.

### P1 — Foundation MVP

- MechaniX navigation/theme and user onboarding.
- Rebrand/reconfigure existing LMS into MechaniX tracks.
- Community feed with posts/replies/moderation.
- Practice chart with static/delayed market data, drawings, zones, saved layouts.
- Simulated order ticket and basic practice account.
- Chart-task submissions and coach feedback.
- Firestore rules hardening and canonical roles.

### P2 — Performance and simulation

- Prop-firm rule engine and admin rule templates.
- Journal/track record, manual import, screenshots, tags, metrics.
- Mentor dashboard with grants and audit logs.
- Watchlists and alert engine.
- Replay and multi-pane chart improvements.

### P3 — Connected trading

- Market-data provider adapter(s).
- Broker/account connections and sync.
- Verified imports and reconciliation.
- Live order pilot with audit/risk controls.
- Compliance/legal/data licensing review.

### P4 — Intelligence and scale

- Order-flow datasets and visualizations.
- Scanner service and backtesting.
- Multi-account copier.
- Advanced saved layouts/multi-chart sync.
- Scale optimization and dedicated ingestion infrastructure.

---

## 7. Key implementation risks

1. **Scope risk:** the full developer brief is substantially larger than the four-month final proposal; staged delivery is mandatory.
2. **Chart expectation risk:** Lightweight Charts requires custom indicators, drawings, alerts, replay, DOM, and broker UI; it is not equivalent to TradingView Supercharts.
3. **Data risk:** multi-market normalized instruments and licensed data feeds require provider-specific modeling and legal terms.
4. **Security risk:** current broad Firestore fallback is unsuitable for sensitive student/trading records.
5. **Financial integrity risk:** balances/orders/fills cannot be client-mutated documents; server-side transactional services are required.
6. **Partner risk:** prop-firm APIs, broker execution, MT4/MT5 sync, and cross-platform copying may be restricted or unavailable.
7. **Role/privacy risk:** current role system must be normalized before coach access to sensitive performance data is safe.
