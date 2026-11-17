# MechaniX Admin Panel — Implementation Plan

Status: **P1 prototype shipped** (concept UI at `/mechanix-design/admin-*`, all simulated).

Scope: staff-facing tools for coaches and admins — learner gating, course building,
review workflow, market connectors, and the platform's architecture contract.

## 1. Staff login & roles

- Dedicated `admin-login` view mirroring the learner login pattern: email/password + SSO
  (Google / SAML), "Staff access — coaches & admins" badge.
- Roles (concept): `learner | coach | admin` (+ read-only analyst). Every staff action is
  scoped by role — coaches see assigned learners only; admins see cohorts and connectors.
- P2: real auth via the single-identity model (see §5, principle 1); role claims on the
  session, enforced server-side on every route/action.

## 2. Student manager & gating (`admin-students`)

- Roster: learner, level chip (L1/L2/Prop), course %, quiz status, chart evidence,
  readiness badge (Ready/Gated), last active, risk flag. Filter by level.
- Detail drawer: the four level-acceptance criteria reused from the learner dashboard —
  course ≥ 70%, scenario quiz passed, chart evidence, routine streak ≥ 3 — plus journal
  summary (net R, win rate) and coach-grant status.
- Actions: **Message student** (simulated toast), **Assign review** → writes to the shared
  `coachSubmissions` queue so it surfaces in `admin-review`.
- P2: gating transitions become server workflows; readiness computed server-side so
  coach overrides are auditable.

## 3. Course builder (`admin-course`)

- Tree: modules → lessons with type icons (video, reading, quiz block).
- Lesson editor: title + type switch; video → upload placeholder + URL; reading →
  rich body textarea; quiz → full question editor.
- Question types: **Multiple choice** (2–4 options + correct radio), **Yes-No**,
  **Image question** (upload placeholder + alt), **Fill in the blank** (accepted answers
  + case-sensitivity). Each question: prompt, explanation, difficulty pill, tags.
- **Interactive chat mode**: delivers the quiz as chat-style Q&A — bot bubbles ask,
  learner answers via option buttons / yes-no / text; correct → green ✓ + explanation,
  wrong → retry hint. The right column is a live functional preview.
- **Spaced repetition**: retake interval (1d/3d/7d), mastery threshold slider, max
  attempts. On completion the learner gets a "Review again in N days" schedule card.

### Pedagogy rationale

- **Retrieval practice**: recalling answers (esp. fill-in-the-blank) beats re-reading for
  durable learning — chat mode makes recall feel low-stakes and conversational.
- **Interleaving**: mixing question types/topics inside one quiz forces discrimination
  between concepts, not pattern matching.
- **Spacing**: re-surfacing the quiz at increasing intervals (1d → 3d → 7d) fights the
  forgetting curve; the schedule card makes the next rep explicit.
- **Mastery thresholds**: passing ≠ done — re-tests continue until ≥ threshold so Level
  acceptance reflects retention, not a lucky pass.

## 4. Market connectors (`admin-connectors`)

- Cards per market: Forex/FX_IDC, Futures/CME, Crypto/Binance-sim, Stocks/NASDAQ-sim —
  status chip (Connected/Simulated), instrument count from the canonical `SYMBOLS`
  groups, sample identifier mapping (`FX:EURUSD → EURUSD`), mock latency, Sync button.
- **Normalization rule**: learners and records reference canonical instruments only;
  provider ids map server-side (architecture principle 2).

## 5. Architecture principles (`admin-architecture`)

The seven platform requirements, rendered as a doc view and treated as build gates:

1. **Single identity** w/ tenant/role/ownership boundaries → `users.tenantId` +
   `role: learner|coach|admin` on every record.
2. **Instruments normalized**, provider ids mapped server-side → connector mapping.
3. **Simulated/manual/imported/verified/live** records separated & labeled → journal
   `TradeSource` badges.
4. **Financial mutations as server workflows** w/ idempotency + immutable audit →
   copier/grant audit logs.
5. **Secrets only via approved secret handling** → no credentials in client or records.
6. **Versioned rules/disclosures/content** → scanner rules, prop rules, lessons carry
   version tags.
7. **Market data separated** from account/journal records → independent retention & perf.

## 6. Coach test → review → follow-up workflow

End-to-end loop the admin views wire together:

1. **Assign** — coach picks a learner in `admin-students` → task lands in the review queue.
2. **Submit** — learner completes the task (chart markup, quiz remediation, trade plan).
3. **Rubric review** — coach scores the submission (rubric exists in Community → Coach).
4. **Approve / Request changes** — `admin-review` row actions set status; a change note
   travels with the request.
5. **Follow-up** — canned templates ("tighten your invalidation", "re-do the RR math —
   lesson 3.2", "schedule a 1:1") or a custom note → sent to the learner, logged.
6. **Re-check** — the learner resubmits; the loop repeats until approved, then gating
  criteria update in `admin-students`.

## 7. Phased rollout

| Phase | Scope |
|-------|-------|
| **P1 — done** | Concept UI: staff login, roster+gating drawer, course builder with chat-quiz preview, review queue + follow-ups, connector cards, architecture doc. All simulated, "Concept" labeling. |
| **P2 — backend** | Single-identity auth + staff roles; server-side readiness/gating workflows; persistent course/quiz schema (versioned content, principle 6); review queue persistence + follow-up messaging; immutable audit for staff actions (principle 4). |
| **P3 — integrations** | Real SSO (Google/SAML), real provider connectors feeding canonical instruments (principle 2), LMS roster sync, notification delivery for assignments/follow-ups, analytics on mastery/spaced-repetition outcomes. |

## Out of scope (P1)

Real auth, persistence, file uploads, live market feeds, and any financial mutation —
everything is illustrative data behind the Concept label.
