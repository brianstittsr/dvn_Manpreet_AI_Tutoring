/**
 * Server-only integration secrets
 *
 * Third-party credentials (API keys, client secrets, webhook secrets) live in
 * `platformSecrets/global`, which is denied to all clients by Firestore rules.
 * Non-secret configuration (IDs, URLs, connection status) stays in
 * `platformSettings/global.integrations` so authenticated portal screens can
 * still render it.
 *
 * On first access this module lazily migrates any secrets still stored in the
 * client-readable settings document, then scrubs them from it.
 */

const SECRETS_COLLECTION = "platformSecrets";
const SETTINGS_COLLECTION = "platformSettings";
const GLOBAL_DOC = "global";

/** Secret field names per integration provider. */
export const SECRET_INTEGRATION_FIELDS: Record<string, readonly string[]> = {
  apollo: ["apiKey"],
  zoom: ["apiKey", "apiSecret"],
  docuseal: ["apiKey", "webhookSecret"],
  stripe: ["secretKey", "webhookSecret"],
  linkedin: ["apiKey", "clientSecret"],
};

export type IntegrationSecrets = Record<string, Record<string, string>>;

interface SecretsDoc {
  integrations?: IntegrationSecrets;
  apiKeys?: Record<string, unknown>;
}

async function getDb() {
  const { adminDb } = await import("@/lib/firebase-admin");
  return adminDb;
}

function isNonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * Read the secrets document, lazily migrating any credentials still present in
 * the client-readable platformSettings document.
 */
export async function getServerIntegrationSecrets(): Promise<IntegrationSecrets> {
  const db = await getDb();
  if (!db) return {};

  const secretSnap = await db.collection(SECRETS_COLLECTION).doc(GLOBAL_DOC).get();
  const existing = (secretSnap.exists ? secretSnap.data() : undefined) as SecretsDoc | undefined;

  // Lazy migration from the legacy client-readable location. Any secret fields
  // still present in platformSettings are copied over and scrubbed.
  const settingsSnap = await db.collection(SETTINGS_COLLECTION).doc(GLOBAL_DOC).get();
  if (!settingsSnap.exists) return existing?.integrations ?? {};

  const settings = settingsSnap.data() as { integrations?: Record<string, Record<string, unknown>> } | undefined;
  const legacyIntegrations = settings?.integrations ?? {};

  const migrated: IntegrationSecrets = { ...(existing?.integrations ?? {}) };
  const scrub: Record<string, string> = {};
  let found = false;

  for (const [provider, fields] of Object.entries(SECRET_INTEGRATION_FIELDS)) {
    const legacy = legacyIntegrations[provider];
    if (!legacy) continue;

    for (const field of fields) {
      const value = legacy[field];
      if (isNonEmpty(value)) {
        if (migrated[provider]?.[field] !== value) {
          migrated[provider] = { ...(migrated[provider] ?? {}), [field]: value };
        }
        scrub[`integrations.${provider}.${field}`] = "";
        found = true;
      }
    }
  }

  if (found) {
    await db.collection(SECRETS_COLLECTION).doc(GLOBAL_DOC).set(
      { integrations: migrated, updatedAt: new Date() },
      { merge: true }
    );
    await db.collection(SETTINGS_COLLECTION).doc(GLOBAL_DOC).set(
      { ...scrub, secretsStoredSeparately: true, updatedAt: new Date() },
      { merge: true }
    );
  }

  return migrated;
}

/** Secret fields for a single provider (e.g. "apollo", "stripe"). */
export async function getIntegrationSecrets(provider: string): Promise<Record<string, string>> {
  const secrets = await getServerIntegrationSecrets();
  return secrets[provider] ?? {};
}

/**
 * The free-form `apiKeys` map historically stored in
 * platformSettings. Moved to platformSecrets; lazy migration included.
 */
export async function getServerApiKeys(): Promise<Record<string, unknown>> {
  const db = await getDb();
  if (!db) return {};

  const secretSnap = await db.collection(SECRETS_COLLECTION).doc(GLOBAL_DOC).get();
  const existing = (secretSnap.exists ? secretSnap.data() : undefined) as SecretsDoc | undefined;

  const settingsSnap = await db.collection(SETTINGS_COLLECTION).doc(GLOBAL_DOC).get();
  if (!settingsSnap.exists) return existing?.apiKeys ?? {};

  const legacy = (settingsSnap.data() as { apiKeys?: Record<string, unknown> } | undefined)?.apiKeys;
  if (!legacy || Object.keys(legacy).length === 0) {
    return existing?.apiKeys ?? {};
  }

  const merged = { ...legacy, ...(existing?.apiKeys ?? {}) };
  await db.collection(SECRETS_COLLECTION).doc(GLOBAL_DOC).set(
    { apiKeys: merged, updatedAt: new Date() },
    { merge: true }
  );
  await db.collection(SETTINGS_COLLECTION).doc(GLOBAL_DOC).set(
    { apiKeys: {}, updatedAt: new Date() },
    { merge: true }
  );

  return merged;
}

/** Convenience accessor for a single apiKeys entry that is `{ apiKey: string }`. */
export async function getApiKeyValue(name: string): Promise<string | null> {
  const apiKeys = await getServerApiKeys();
  const entry = apiKeys[name];
  if (isNonEmpty(entry)) return entry;
  if (entry && typeof entry === "object") {
    const key = (entry as Record<string, unknown>).apiKey;
    if (isNonEmpty(key)) return key;
  }
  return null;
}

const MASK_PREFIX = "****";

export function maskSecret(value: unknown): string {
  if (!isNonEmpty(value)) return "";
  return value.length > 4 ? `${MASK_PREFIX}${value.slice(-4)}` : MASK_PREFIX;
}

export function isMaskedSecret(value: unknown): boolean {
  return typeof value === "string" && value.startsWith(MASK_PREFIX);
}
