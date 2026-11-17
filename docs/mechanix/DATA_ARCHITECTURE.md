# MechaniX Data Architecture

**Version:** 1.0 draft  
**Date:** November 15, 2026

This document defines the recommended persistence and integration architecture for a multi-user, multi-market MechaniX platform. It intentionally separates the existing LMS workload from trading-grade data requirements.

---

## 1. Architectural principle

Do not force all product data into Firestore. Use a **hybrid persistence model**:

| Data class | Recommended store | Reason |
|---|---|---|
| Courses, modules, lessons, enrollments, progress | Firestore initially | Already implemented and adequate for moderate LMS workloads |
| Community threads/replies | Firestore or Postgres | Firestore can work if explicit rules and moderation are added; Postgres simplifies joins/reporting |
| User profile/preferences | Firestore + replicated identity reference | Existing profile pattern can be extended |
| Tenancy, roles, grants, entitlements | PostgreSQL | Strong relational constraints and authorization semantics |
| Connected accounts, orders, executions, positions | PostgreSQL | Financial consistency, transactions, unique constraints, joins, auditability |
| Journal entries/metadata | PostgreSQL | Relational reporting, filtering, account linkage |
| Journal screenshots/files | Object storage | Large binary assets |
| Candles/ticks/order book/footprints | TimescaleDB or ClickHouse | High-volume append/time-partition workloads |
| Realtime quote state/cache | Redis | Low-latency latest values and websocket fanout |
| Provider ingestion/events | Queue/event bus | Retry, ordering, replay, outbox, worker isolation |
| Secrets/provider tokens | KMS/secrets manager | Never client-readable |
| Audit/security events | PostgreSQL append-only | Queryable immutable history |

---

## 2. Target architecture

```text
                         ┌─────────────────────────────┐
                         │ Next.js MechaniX Web App   │
                         │ Learn | Practice | Trade   │
                         └──────────────┬──────────────┘
                                        │
                    ┌───────────────────┼────────────────────┐
                    │                   │                    │
             Firebase Auth        Firestore LMS         MechaniX API
             identity             courses/progress      server-only
                    │                   │                    │
                    │                   │        ┌───────────▼───────────┐
                    │                   │        │ PostgreSQL trading DB │
                    │                   │        │ tenants/users/accounts│
                    │                   │        │ orders/fills/journal  │
                    │                   │        └───────────┬───────────┘
                    │                   │                    │
                    │                   │        ┌───────────▼───────────┐
                    │                   │        │ Time-series store     │
                    │                   │        │ candles/ticks/depth   │
                    │                   │        └───────────┬───────────┘
                    │                   │                    │
                    │                   │        ┌───────────▼───────────┐
                    │                   │        │ Redis + queue         │
                    │                   │        │ quotes/jobs/outbox    │
                    │                   │        └───────────┬───────────┘
                    │                   │                    │
                    │                   │        Market-data providers
                    │                   │        Broker/prop integrations
                    │                   │
                    └──────────── Stable user_id / tenant_id ────────────┘
```

---

## 3. Identity and tenancy model

### 3.1 Identity strategy

- Keep Firebase Auth as the external identity provider initially.
- Every Firebase-authenticated user maps to a durable internal `user_id`.
- New trading tables use internal `tenant_id`, `user_id`, and account IDs rather than Firebase document IDs alone.
- A background provisioning job creates the internal user and tenant membership on first authenticated API call or signup.

### 3.2 Suggested core tables

#### `tenants`

Represents a customer organization, cohort, school, or isolated workspace.

Key fields:

- `id`
- `name`
- `slug`
- `type` (`individual`, `cohort`, `organization`, `internal`)
- `status`
- `created_at`, `updated_at`

#### `tenant_users`

Maps users to tenants and default membership state.

Key fields:

- `tenant_id`
- `user_id`
- `status` (`active`, `invited`, `suspended`, `removed`)
- `joined_at`, `removed_at`
- Unique `(tenant_id, user_id)`

#### `role_assignments`

Normalized role grants.

Key fields:

- `tenant_id`
- `user_id`
- `role` (`student`, `coach`, `mentor`, `community_moderator`, `admin`, `support`, `superadmin`)
- `scope` (`tenant`, `cohort`, `course`, `account`, `custom`)
- `scope_id`
- `granted_by`, `expires_at`, `revoked_at`

#### `coach_student_grants`

Controls sensitive student-performance visibility.

Key fields:

- `tenant_id`
- `student_user_id`
- `coach_user_id`
- `permissions` (`learning`, `practice`, `journal`, `track_record`, `risk_metrics`, `private_notes`)
- `status` (`active`, `revoked`, `expired`)
- `granted_by`, `granted_at`, `expires_at`, `revoked_at`

Every sensitive view should validate the grant server-side and emit an audit event.

---

## 4. Multi-market instrument model

### 4.1 Canonical instrument

A canonical instrument decouples the product from provider-specific symbols.

#### `instruments`

- `id`
- `asset_class` (`forex`, `future`, `stock`, `crypto`, `cfd`, `option`, `index`)
- `base_symbol`
- `quote_currency`
- `name`
- `exchange`
- `country`
- `timezone`
- `tick_size`
- `tick_value`
- `contract_size`
- `margin_requirement`
- `precision`
- `is_active`
- `metadata`

#### `instrument_provider_mappings`

- `instrument_id`
- `provider` (`massive`, `databento`, `rithmic`, `tradovate`, `mt4`, `mt5`, `manual`, etc.)
- `provider_symbol`
- `provider_exchange`
- `data_rights` (`internal_only`, `display_allowed`, `redistribution_allowed`, `delayed`, `realtime`)
- `entitlement_required`
- `is_primary`

#### `market_sessions`

- `instrument_id`
- `session_type` (`regular`, `pre`, `post`, `overnight`, `crypto_24_7`)
- `day_of_week`
- `open_time`, `close_time`
- `timezone`

#### `market_calendars`

- `market` / `exchange`
- `date`
- `status` (`open`, `closed`, `half_day`, `holiday`)
- `open_at`, `close_at`

### 4.2 Market-specific handling

| Market | Required handling |
|---|---|
| Forex | Pair precision, sessions, rollover times, quote/base currency, fractional pips |
| Futures | Contract months, rollovers, tick size/value, exchange calendars, day/session boundaries, margin |
| Stocks | Corporate actions, exchange calendars, extended hours, splits, symbol changes |
| Crypto | 24/7 sessions, exchange-specific symbols, fragmented liquidity, precision |
| Prop/instrument overlays | Contract limits, firm-specific tradable universe, restrictions by account type |

---

## 5. Trading-domain schema

### 5.1 Accounts and connections

#### `trading_accounts`

- `id`
- `tenant_id`
- `owner_user_id`
- `provider`
- `provider_account_id`
- `account_type` (`practice`, `prop_challenge`, `prop_funded`, `live`, `demo`)
- `environment` (`simulation`, `sandbox`, `live`)
- `display_name`
- `currency`
- `status`
- `permissions`
- `last_synced_at`
- `created_at`, `updated_at`

#### `provider_connections`

Stores non-secret connection metadata only.

- `id`
- `tenant_id`
- `user_id`
- `provider`
- `external_account_id`
- `status`
- `scopes`
- `secret_reference` — pointer to KMS/secrets manager entry, not the token
- `expires_at`
- `last_error`
- `last_success_at`

#### `sync_runs`

- `id`
- `connection_id`
- `account_id`
- `started_at`, `finished_at`
- `status`
- `records_seen`, `records_created`, `records_updated`, `duplicates_ignored`
- `error`
- `checksum`

### 5.2 Orders and executions

#### `orders`

- `id`
- `tenant_id`
- `account_id`
- `user_id`
- `instrument_id`
- `provider_order_id`
- `client_order_id` / `idempotency_key`
- `side`
- `type` (`market`, `limit`, `stop`, `stop_limit`, `bracket`)
- `status` (`draft`, `submitted`, `accepted`, `partially_filled`, `filled`, `cancelled`, `rejected`, `expired`)
- `quantity`, `filled_quantity`
- `limit_price`, `stop_price`
- `time_in_force`
- `submitted_at`, `updated_at`
- `source` (`simulation`, `api`, `import`, `manual`)
- `risk_snapshot`

#### `executions`

Append-only fill records.

- `id`
- `tenant_id`
- `account_id`
- `order_id`
- `instrument_id`
- `provider_execution_id`
- `side`
- `quantity`
- `price`
- `fees`
- `liquidity`
- `executed_at`
- `source`
- `import_batch_id`
- Unique provider identity where available

#### `positions`

Derived/materialized state, not the source of truth.

- `tenant_id`
- `account_id`
- `instrument_id`
- `net_quantity`
- `average_price`
- `realized_pnl`
- `unrealized_pnl`
- `currency`
- `last_execution_id`
- `updated_at`

#### `account_balance_snapshots`

- `tenant_id`
- `account_id`
- `as_of`
- `cash_balance`
- `equity`
- `buying_power`
- `margin_used`
- `currency`
- `source`

### 5.3 Order-state consistency

- All order changes occur through server-side services.
- Use an explicit order-state machine and reject invalid transitions.
- `client_order_id`/`idempotency_key` prevents duplicate submissions.
- Provider executions are append-only; corrections create compensating records.
- Positions are derived and rebuildable from executions.
- Reconciliation jobs compare local orders/positions/balances with provider snapshots and create `reconciliation_issues`.

---

## 6. Simulation and prop-rule schema

#### `simulation_accounts`

- `tenant_id`
- `owner_user_id`
- `name`
- `account_type`
- `starting_balance`
- `current_balance`
- `currency`
- `leverage`
- `commission_model`
- `slippage_model`
- `status`

#### `prop_rule_sets`

- `id`
- `tenant_id`
- `firm_name`
- `name`
- `version`
- `status`
- `rules_json`
- `created_by`
- `created_at`
- `published_at`

#### `prop_rule_evaluations`

- `tenant_id`
- `simulation_account_id`
- `rule_set_id`
- `as_of`
- `status`
- `metrics_json`
- `breaches_json`
- `equity_snapshot_id`
- `evaluated_at`

Rules must be versioned; historical evaluations point to the exact rule version used.

---

## 7. Journal and track-record schema

#### `journal_entries`

- `tenant_id`
- `owner_user_id`
- `account_id`
- `instrument_id`
- `linked_order_id`, `linked_execution_id`
- `entry_type` (`trade`, `note`, `review`, `lesson_submission`)
- `source` (`manual`, `imported`, `verified`, `simulated`)
- `setup_type`
- `strategy_tags`
- `checklist_json`
- `thesis`, `notes`, `mistakes`, `emotions`
- `rating`
- `created_at`, `updated_at`

#### `journal_attachments`

- `journal_entry_id`
- `file_id` / object-storage path
- `kind` (`chart_snapshot`, `screenshot`, `pdf`, `video`, `other`)
- `metadata`

#### `import_batches`

- `account_id`
- `source`
- `status`
- `started_at`, `completed_at`
- `records_seen`, `created`, `duplicates`, `errors`

#### `trade_reviews`

- `tenant_id`
- `journal_entry_id` or `execution_id`
- `reviewer_user_id`
- `status`
- `feedback`
- `reviewed_at`

---

## 8. Market-data schema

### 8.1 Time-series tables

Use TimescaleDB hypertables or ClickHouse tables partitioned by time and ordered by instrument/time.

#### `ohlc_bars`

- `instrument_id`
- `time`
- `timeframe`
- `open`, `high`, `low`, `close`
- `volume`
- `provider`
- `quality` (`official`, `derived`, `delayed`, `estimated`)

#### `trade_ticks`

- `instrument_id`
- `time`
- `price`
- `quantity`
- `side`
- `provider_trade_id`
- `provider`

#### `order_book_snapshots`

- `instrument_id`
- `time`
- `sequence`
- `levels_json` or normalized side/price/quantity rows
- `provider`

#### `order_book_deltas`

- `instrument_id`
- `time`
- `sequence`
- `side`
- `price`
- `quantity_delta`
- `action`
- `provider`

### 8.2 Derived datasets

- `footprint_bars`
- `cumulative_delta`
- `volume_profile`
- `liquidity_heatmap_cells`
- `scanner_features`
- `big_trade_events`

Derived data should record the source window, algorithm version, and input-quality flags.

---

## 9. Community and learning Firestore changes

If community remains in Firestore, add explicit collections and rules for:

- `community_threads`
- `community_replies`
- `community_reactions`
- `community_reports`
- `chart_submissions`
- `coach_feedback`
- `chart_layout_refs`

Rules should enforce:

- Authenticated read only where appropriate.
- Author/admin/moderator update permissions.
- Locked-thread write denial.
- No privilege escalation through client-supplied `isInstructorReply` or moderator flags.
- No broad fallback access for new collections.

---

## 10. Security and authorization

1. API validates Firebase ID token and loads internal user/tenant context.
2. Authorization layer checks role, tenant membership, account ownership, and coach grants.
3. Postgres row-level security may supplement service-layer checks but should not replace them.
4. All provider credentials live in a secrets manager/KMS; database stores only `secret_reference`.
5. Sensitive reads and writes emit `audit_events` with actor, action, entity, tenant, timestamp, IP/user agent, and reason.
6. Public/community content permissions must be separate from private journal/trading permissions.
7. Rate-limit order, alert, sync, and scanner endpoints.
8. Use environment separation for development, staging, and production credentials.

---

## 11. Ingestion and integration patterns

### Provider ingestion

- Provider-specific adapters normalize data into canonical instruments and event schemas.
- Queue messages include provider, symbol mapping, sequence, timestamp, and payload checksum.
- Workers write snapshots/deltas, update Redis latest quotes, and publish normalized websocket events.
- Sequence gaps trigger resync/snapshot recovery.
- Provider outages update health state and show stale-data labels in UI.

### Broker/account synchronization

- Scheduled and webhook-driven sync paths.
- Import batches record counts, checksums, errors, and duplicates.
- Execution identity uses provider IDs; fallback deduplication uses account, instrument, timestamp, quantity, price, and order reference.
- Reconciliation runs compare remote and local state.

### Outbox pattern

- Trading state changes write domain event records in the same transaction as state updates.
- Event workers deliver notifications, update reporting projections, and trigger alert/scanner evaluation.

---

## 12. Retention and privacy

| Data | Recommended retention |
|---|---|
| LMS progress | Life of account plus business/legal requirements |
| Community content | Until deleted/moderated, subject to audit retention |
| Audit/security events | Minimum 1–7 years depending on legal advice |
| Candles | Long-term by timeframe; aggregate downsample for older data |
| Tick/order-book data | Short-to-medium retention unless licensed/needed for replay |
| Journal media | User-controlled retention plus backup policy |
| Broker tokens | Until disconnect, then revoke and delete/purge secrets |
| Coach access | Immediate revocation; grant history retained |

Users should be able to revoke coach access and disconnect accounts. Historical verified trade records should not be silently altered; corrections should be auditable.

---

## 13. Migration approach

1. Keep existing Firebase Auth/Firestore LMS operational.
2. Add internal user/tenant provisioning tables.
3. Add Postgres trading schema for all new domains.
4. Add time-series store only when real market-data requirements are confirmed.
5. Add community collections with explicit Firestore rules or migrate community to Postgres if relational permissions become complex.
6. Add provider adapters behind server APIs; no direct client calls to brokers/data providers.
7. Backfill only where needed; avoid a big-bang migration of existing LMS data.
8. Run dual-read validation only if any existing records are migrated.

---

## 14. Key technical decisions still required

- Managed Postgres provider and region.
- TimescaleDB versus ClickHouse based on query patterns and operational comfort.
- Redis/queue provider (Upstash, managed Redis + BullMQ, Cloud Tasks/Pub/Sub, etc.).
- Object storage strategy for journal/chart attachments.
- Broker/data-provider adapter interface and entitlement model.
- Whether community remains in Firestore or joins the Postgres trading domain.
- Backup, disaster recovery, PII retention, and audit-retention requirements.
