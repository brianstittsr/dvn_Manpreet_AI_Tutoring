# MechaniX Mock Screen Specification

**Version:** 1.0 draft  
**Route:** `/mechanix-design`  
**Purpose:** Public, static concept screens showing the proposed SaaS direction. No real market data, authentication, order routing, or account synchronization.

---

## 1. Design direction

Use the supplied screenshot as the starting visual reference:

- Light neutral application background (`#F4F7F4` / slate-green tint)
- White cards with subtle borders and soft shadows
- Emerald/forest green primary action color
- Dark forest left sidebar
- Compact SaaS density and modern rounded cards
- Top navigation with product areas: Learn, Practice, Trade, Community
- “Concept • illustrative data” badge visible throughout
- Chart-centric workspace with right-side order/context panel
- Progress rings, checklist states, badges, and segmented tabs

The mock should be isolated from the existing CurioQuest yellow/blue brand tokens.

---

## 2. Shared application shell

### Header

- MechaniX wordmark
- Product nav: Learn, Practice, Trade, Community
- Environment badge: `Concept • illustrative data`
- Notification and user avatar placeholders

### Sidebar

- Dashboard
- Learning
- Markets
- Watchlist
- Community
- Journal
- Scanner
- Settings

### Main region

Each screen uses a responsive grid:

- Desktop: sidebar + main content + optional right context panel
- Tablet: sidebar collapses or overlays
- Mobile: stacked cards, chart before secondary panels

---

## 3. Screen inventory

### 3.1 Unified Dashboard `/mechanix-design/dashboard`

**Purpose:** Show one connected learner/trader journey.

**Layout**

- Hero/summary strip: learning progress, practice streak, simulated P&L, coach feedback count
- Left: MechaniX Foundations track checklist
- Center: compact chart preview with demand zone and next practice task
- Right: today's routine, alerts, upcoming coaching session
- Bottom: community activity and journal reminders

**Sample content**

- `MechaniX Foundations — 72%`
- `Supply & Demand — 2/4`
- `Next: submit EURUSD demand-zone analysis`

---

### 3.2 Learning Track `/mechanix-design/learning`

**Purpose:** Course/track overview.

**Layout**

- Track header with progress ring and continue button
- Left: curriculum checklist (Mindset, Market Structure, Supply & Demand, Planning, Risk, Execution)
- Center: featured lesson card and module list
- Right: coach comments, upcoming live session, downloadable routine

---

### 3.3 Lesson Player + Chart Assignment `/mechanix-design/lesson`

**Purpose:** Show dynamic lesson with chart-evidence submission.

**Layout**

- Lesson header/progress
- Main: video/content panel plus lesson objectives
- Assignment card: “Mark demand zone and explain reaction”
- Embedded mini chart or linked chart state
- Right: rubric, coach feedback, submission status, attached files

---

### 3.4 Practice Workspace `/mechanix-design/practice`

**Purpose:** Closest match to supplied screenshot.

**Layout**

- Chart toolbar: symbol, timeframe, replay, indicators, layout, alerts
- Candlestick chart with volume, supply/demand zones, entry/SL/TP markers
- Chart bottom tabs: Analysis, Trade ideas, Notes, Lessons in focus
- Right: Simulation/Live segmented control and order ticket
- Bottom: community discussion preview and trending topics

**Order ticket fields**

- Buy/Sell
- Order type
- Price
- Volume/lots
- Stop loss
- Take profit
- Trade risk
- Reward approximation
- `Place Simulated Order`

---

### 3.5 Markets `/mechanix-design/markets`

**Purpose:** Multi-market discovery.

**Layout**

- Market summary cards: Forex, Futures, Stocks, Crypto
- Screener-like table with symbol, price, change, volume, session, data status
- Mini heatmap or sector/category cards
- Instrument preview panel with chart link and related lessons

---

### 3.6 Watchlist `/mechanix-design/watchlist`

**Purpose:** Saved symbols and alerts.

**Layout**

- Watchlist tabs: Majors, Futures, Crypto, Custom
- Table with price, day change, zone status, alert, last signal
- Right: create alert card and recently triggered alerts

---

### 3.7 Opportunity Scanner `/mechanix-design/scanner`

**Purpose:** MechaniX Four Filter dashboard.

**Layout**

- Filter bar: market, timeframe, direction, score, watchlist
- Results table:
  - Instrument
  - Direction
  - Timeframe
  - Zone
  - Freshness
  - Trapped Participants
  - Math ≥ 1:2
  - Score
  - Chart link
- Right: selected setup explanation and chart thumbnail
- Clear disclaimer: educational potential setups, not recommendations

---

### 3.8 Trade / Accounts `/mechanix-design/trade`

**Purpose:** Connected-account and execution future-state mock.

**Layout**

- Account cards: Practice, Prop Challenge, Live (locked/disabled future state)
- Positions/orders/balances tabs
- Order ticket and account health/sync status
- Compliance banner: live trading subject to partner approval

---

### 3.9 Journal / Track Record `/mechanix-design/journal`

**Purpose:** Performance and reflection.

**Layout**

- KPI cards: Net P&L, win rate, drawdown, profit factor, average R
- Equity curve placeholder
- Trade table with verified/manual/simulated badges
- Trade detail drawer: notes, screenshots, tags, checklist, coach comments

---

### 3.10 Community `/mechanix-design/community`

**Purpose:** Discussion and coaching.

**Layout**

- Category tabs: All, Chart Analysis, Learning Questions, Trade Planning
- Composer: title/body/chart attach/tags
- Feed cards with author, badge, chart image, replies
- Right: trending topics, top contributors, community guidelines

---

### 3.11 Coach Dashboard `/mechanix-design/coach`

**Purpose:** Mentor visibility and review workflow.

**Layout**

- Review queue: chart submissions, quiz issues, rule warnings
- Student table with course progress, practice submissions, journal discipline
- Student detail panel: permission scope, recent work, feedback composer
- Access grant/revocation status and audit hint

---

### 3.12 Admin / Rules / Integrations `/mechanix-design/admin`

**Purpose:** Operational configuration.

**Layout**

- Tabs: Curriculum, Prop Rules, Instruments, Integrations, Roles
- Prop-rule editor cards with version/status
- Provider-symbol mapping table
- Integration status cards for data, broker, Stripe, email
- Audit log preview

---

### 3.13 Settings / Billing `/mechanix-design/settings`

**Purpose:** Account and entitlement management.

**Layout**

- Profile/preferences
- Notification channels
- Connected accounts/integrations
- Subscription/entitlement card
- Privacy and coach access grants
- Danger zone/disconnect controls

---

## 4. Reusable mock components

- `MechanixShell`
- `MockChart`
- `OrderTicket`
- `WatchlistPanel`
- `LearningProgressCard`
- `CommunityFeed`
- `ScannerTable`
- `JournalTable`
- `AccountsPanel`
- `CoachReviewPanel`
- `RulesAdminPanel`
- Shared `ScreenFrame`, `StatCard`, `SectionCard`, `StatusPill`, `MockTable`

---

## 5. Static data requirements

Use illustrative EURUSD, GBPUSD, ES, NQ, AAPL, BTCUSD, ETHUSD records.

Data must be marked:

- `Concept`
- `Illustrative data`
- `Simulation`
- `Not live market data`
- `Future integration` where applicable

No calls to Firebase, market-data providers, Stripe, auth, brokers, or external APIs.

---

## 6. Accessibility requirements

- Semantic landmarks: header, nav, main, section
- Buttons/controls have labels
- Chart has text alternative and data summary
- Contrast-aware green/red usage; status also uses text/icons
- Keyboard-accessible screen selector and tabs
- Responsive at desktop and mobile widths

---

## 7. Route behavior

- `/mechanix-design` redirects or renders the dashboard/index.
- `/mechanix-design/[screen]` renders each configured screen.
- Unknown screen slugs render a design index/not-found state.
- Screen selector links between all routes.
- Metadata should label the area as a concept gallery, not production trading.
