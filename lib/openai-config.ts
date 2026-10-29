import OpenAI from "openai";
import type { PlatformSettingsDoc } from "@/lib/schema";

type StoredLLMConfig = NonNullable<PlatformSettingsDoc["llmConfig"]> & {
  apiKeyStoredSeparately?: boolean;
  migratedFromPlatformSettings?: boolean;
};

interface LinkedInIntegrationConfig {
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  organizationId?: string;
}

type SettingsDoc = PlatformSettingsDoc & {
  integrations?:
    | (NonNullable<PlatformSettingsDoc["integrations"]> & {
        linkedin?: LinkedInIntegrationConfig;
      })
    | undefined;
};

interface SecretSettingsDoc {
  llmConfig?: StoredLLMConfig;
}

async function getIntegrationSecrets(provider: string): Promise<Record<string, string>> {
  try {
    const { getIntegrationSecrets: load } = await import("@/lib/integration-secrets");
    return await load(provider);
  } catch {
    return {};
  }
}

// Cache settings to avoid repeated Firebase reads
let cachedSettings: SettingsDoc | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60000; // 1 minute cache

/**
 * Get all platform settings from Firebase (cached)
 * Uses dynamic import to avoid issues with Firebase in API routes
 * Falls back to Firebase Admin SDK for server-side access
 */
async function getSettings(): Promise<SettingsDoc | null> {
  // Check cache first
  if (cachedSettings && Date.now() - cacheTimestamp < CACHE_DURATION) {
    console.log("[openai-config] Using cached settings");
    return cachedSettings;
  }

  // On the server, go straight to the Admin SDK. The client SDK would issue an
  // unauthenticated request that Firestore rules now correctly deny.
  if (typeof window === "undefined") {
    try {
      const { adminDb } = await import("@/lib/firebase-admin");
      const { COLLECTIONS } = await import("@/lib/schema");

      if (adminDb) {
        const docSnap = await adminDb.collection(COLLECTIONS.PLATFORM_SETTINGS).doc("global").get();
        if (docSnap.exists) {
          cachedSettings = docSnap.data() as SettingsDoc;
          cacheTimestamp = Date.now();
          return cachedSettings;
        }
      }
    } catch (adminError) {
      console.error("[openai-config] Error fetching settings via Admin SDK:", adminError);
    }
    return null;
  }

  // Try Firebase Client SDK first
  try {
    console.log("[openai-config] Attempting to fetch from Firebase Client SDK...");
    const { db } = await import("@/lib/firebase");
    const { doc, getDoc } = await import("firebase/firestore");
    const { COLLECTIONS } = await import("@/lib/schema");
    
    console.log("[openai-config] Firebase client db exists:", !!db);
    
    if (db) {
      const docRef = doc(db, COLLECTIONS.PLATFORM_SETTINGS, "global");
      console.log("[openai-config] Fetching document from client SDK...");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        cachedSettings = docSnap.data() as SettingsDoc;
        cacheTimestamp = Date.now();
        console.log("[openai-config] Settings fetched successfully via client SDK, has llmConfig:", !!cachedSettings?.llmConfig);
        return cachedSettings;
      } else {
        console.log("[openai-config] Settings document does not exist in client SDK");
      }
    } else {
      console.log("[openai-config] Firebase client db is null, trying Admin SDK...");
    }
  } catch (error) {
    console.error("[openai-config] Error fetching from Firebase Client SDK:", error);
    console.log("[openai-config] Falling back to Admin SDK...");
  }

  // Fallback: Try Firebase Admin SDK
  try {
    console.log("[openai-config] Attempting to fetch from Firebase Admin SDK...");
    const { adminDb } = await import("@/lib/firebase-admin");
    const { COLLECTIONS } = await import("@/lib/schema");
    
    console.log("[openai-config] Firebase adminDb exists:", !!adminDb);
    
    if (adminDb) {
      const docRef = adminDb.collection(COLLECTIONS.PLATFORM_SETTINGS).doc("global");
      console.log("[openai-config] Fetching document from Admin SDK...");
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        cachedSettings = docSnap.data() as SettingsDoc;
        cacheTimestamp = Date.now();
        console.log("[openai-config] Settings fetched successfully via Admin SDK, has llmConfig:", !!cachedSettings?.llmConfig);
        return cachedSettings;
      } else {
        console.log("[openai-config] Settings document does not exist in Admin SDK");
      }
    } else {
      console.log("[openai-config] Firebase Admin SDK not available");
    }
  } catch (adminError) {
    console.error("[openai-config] Error fetching from Firebase Admin SDK:", adminError);
  }

  console.log("[openai-config] All Firebase SDKs failed, returning null");
  return null;
}

async function getServerLLMSettings(): Promise<SecretSettingsDoc | null> {
  try {
    const { adminDb } = await import("@/lib/firebase-admin");
    if (!adminDb) return null;

    const secretSnap = await adminDb.collection("platformSecrets").doc("global").get();
    if (secretSnap.exists) {
      return (secretSnap.data() || null) as SecretSettingsDoc | null;
    }

    const settingsSnap = await adminDb.collection("platformSettings").doc("global").get();
    if (!settingsSnap.exists) return null;
    const settings = settingsSnap.data() as PlatformSettingsDoc;
    const legacyConfig = settings.llmConfig;
    if (!legacyConfig?.apiKey) return { llmConfig: legacyConfig };

    const secretConfig: StoredLLMConfig = { ...legacyConfig, migratedFromPlatformSettings: true };
    await adminDb.collection("platformSecrets").doc("global").set(
      { llmConfig: secretConfig, updatedAt: new Date() },
      { merge: true }
    );
    await adminDb.collection("platformSettings").doc("global").set(
      {
        llmConfig: {
          ...legacyConfig,
          apiKey: "",
          apiKeyStoredSeparately: true,
        },
      },
      { merge: true }
    );
    return { llmConfig: secretConfig };
  } catch (error) {
    console.error("[openai-config] Error fetching server-side LLM settings:", error);
    return null;
  }
}

/**
 * Get LLM configuration from Firebase settings (Settings > LLM Configuration, primary) or
 * environment variables (fallback). Returns full configuration including provider, API key,
 * and base URL for OpenAI-compatible endpoints.
 */
export async function getLLMConfig(): Promise<{
  provider: string;
  apiKey: string;
  baseUrl?: string;
  model?: string;
} | null> {
  console.log("[getLLMConfig] Checking server-side Firebase settings...");

  try {
    const settings = await getServerLLMSettings();
    const llmConfig = settings?.llmConfig;
    if (llmConfig?.apiKey && llmConfig.apiKey.trim().length > 0) {
      return {
        provider: llmConfig.provider || "openai",
        apiKey: llmConfig.apiKey,
        baseUrl: llmConfig.baseUrl || llmConfig.ollamaUrl,
        model: llmConfig.model || "gpt-4o",
      };
    }
  } catch (error) {
    console.error("[getLLMConfig] Error fetching from Firebase:", error);
  }

  console.log("[getLLMConfig] Firebase settings not found, checking environment variables...");

  // Fallback: Environment variables (useful as a deployment-level default)
  const envKey = process.env.OPENAI_API_KEY;
  const envProvider = process.env.LLM_PROVIDER || "openai";
  const envBaseUrl = process.env.LLM_BASE_URL;
  const envModel = process.env.LLM_MODEL || "gpt-4o";

  console.log("[getLLMConfig] Env vars - provider:", envProvider, "apiKey exists:", !!envKey, "baseUrl:", envBaseUrl);

  if (envKey && envKey.trim().length > 0) {
    console.log("[getLLMConfig] Using environment variables");
    return {
      provider: envProvider,
      apiKey: envKey,
      baseUrl: envBaseUrl,
      model: envModel,
    };
  }

  console.log("[getLLMConfig] No LLM configuration found anywhere");
  return null;
}

/**
 * Get OpenAI API key (legacy function for backward compatibility)
 * @deprecated Use getLLMConfig instead
 */
export async function getOpenAIApiKey(): Promise<string | null> {
  const config = await getLLMConfig();
  return config?.apiKey || null;
}

/**
 * Get Apollo API key from Firebase settings
 */
export async function getApolloApiKey(): Promise<{ apiKey: string; accountId?: string } | null> {
  const [settings, secrets] = await Promise.all([getSettings(), getIntegrationSecrets("apollo")]);

  const apiKey = secrets.apiKey || settings?.integrations?.apollo?.apiKey;
  if (apiKey) {
    return {
      apiKey,
      accountId: settings?.integrations?.apollo?.accountId,
    };
  }

  // Fallback: Environment variable
  if (process.env.APOLLO_API_KEY) {
    return {
      apiKey: process.env.APOLLO_API_KEY,
      accountId: process.env.APOLLO_ACCOUNT_ID,
    };
  }

  return null;
}

/**
 * Get Zoom config from Firebase settings
 */
export async function getZoomConfig(): Promise<{ apiKey: string; apiSecret?: string; accountId?: string } | null> {
  const [settings, secrets] = await Promise.all([getSettings(), getIntegrationSecrets("zoom")]);

  const apiKey = secrets.apiKey || settings?.integrations?.zoom?.apiKey;
  if (apiKey) {
    return {
      apiKey,
      apiSecret: secrets.apiSecret || settings?.integrations?.zoom?.apiSecret,
      accountId: settings?.integrations?.zoom?.accountId,
    };
  }

  // Fallback: Environment variables
  if (process.env.ZOOM_API_KEY) {
    return {
      apiKey: process.env.ZOOM_API_KEY,
      apiSecret: process.env.ZOOM_API_SECRET,
      accountId: process.env.ZOOM_ACCOUNT_ID,
    };
  }

  return null;
}

/**
 * Get DocuSeal config from Firebase settings
 */
export async function getDocuSealConfig(): Promise<{ apiKey: string; webhookSecret?: string } | null> {
  const [settings, secrets] = await Promise.all([getSettings(), getIntegrationSecrets("docuseal")]);

  const apiKey = secrets.apiKey || settings?.integrations?.docuseal?.apiKey;
  if (apiKey) {
    return {
      apiKey,
      webhookSecret: secrets.webhookSecret || settings?.integrations?.docuseal?.webhookSecret,
    };
  }

  // Fallback: Environment variable
  if (process.env.DOCUSEAL_API_KEY) {
    return {
      apiKey: process.env.DOCUSEAL_API_KEY,
      webhookSecret: process.env.DOCUSEAL_WEBHOOK_SECRET,
    };
  }

  return null;
}

/**
 * Get LinkedIn config from Firebase settings
 */
export async function getLinkedInConfig(): Promise<{ accessToken: string; clientId?: string; clientSecret?: string; organizationId?: string } | null> {
  const [settings, secrets] = await Promise.all([getSettings(), getIntegrationSecrets("linkedin")]);

  const accessToken = secrets.apiKey || settings?.integrations?.linkedin?.apiKey;
  if (accessToken) {
    return {
      accessToken,
      clientId: settings?.integrations?.linkedin?.clientId,
      clientSecret: secrets.clientSecret || settings?.integrations?.linkedin?.clientSecret,
      organizationId: settings?.integrations?.linkedin?.organizationId,
    };
  }

  // Fallback: Environment variables
  if (process.env.LINKEDIN_ACCESS_TOKEN) {
    return {
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      organizationId: process.env.LINKEDIN_ORGANIZATION_ID,
    };
  }

  return null;
}

/**
 * Create an OpenAI client with the configured API key and base URL
 */
export async function createOpenAIClient(): Promise<OpenAI | null> {
  try {
    const config = await getLLMConfig();
    
    if (!config) {
      console.log("No LLM configuration found");
      return null;
    }

    console.log("[createOpenAIClient] Creating client with provider:", config.provider, "baseUrl:", config.baseUrl);

    const clientConfig: {
      apiKey: string;
      baseURL?: string;
      defaultHeaders?: Record<string, string>;
    } = { apiKey: config.apiKey };
    
    // Add base URL for OpenAI-compatible endpoints
    if (config.baseUrl && config.provider !== "openai") {
      clientConfig.baseURL = config.baseUrl;
    }
    
    // Add default headers for Ollama
    if (config.provider === "ollama") {
      clientConfig.defaultHeaders = {
        "HTTP-Referer": "https://svp-platform.com",
        "User-Agent": "SVP-Platform/1.0"
      };
    }

    return new OpenAI(clientConfig);
  } catch (error) {
    console.error("Error creating OpenAI client:", error);
    return null;
  }
}

/**
 * Clear the cached settings (call this when settings are updated)
 */
export function clearSettingsCache(): void {
  cachedSettings = null;
  cacheTimestamp = 0;
}
