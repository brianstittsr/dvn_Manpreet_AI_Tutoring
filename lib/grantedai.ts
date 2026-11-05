/**
 * GrantedAI Data API — server-only client.
 *
 * Wraps https://grantedai.com/api/v1 (grants, foundations, semantic search,
 * AI discovery). The API key is read from server-only platformSecrets
 * (integrations.grantedai.apiKey) with GRANTEDAI_API_KEY env fallback.
 */

const GRANTEDAI_BASE_URL = "https://grantedai.com/api/v1";

export interface GrantedAiMeta {
  total?: number;
  offset?: number;
  limit?: number;
  next_cursor?: string | null;
  cache_hit?: boolean;
  ai_searches_used?: number;
  ai_searches_limit?: number;
}

export interface GrantedAiResponse<T = unknown> {
  data: T;
  meta?: GrantedAiMeta;
  rateLimit?: string;
}

export class GrantedAiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "GrantedAiError";
  }
}

/** Resolve the GrantedAI key: platformSecrets first, env var fallback. */
export async function getGrantedAiApiKey(): Promise<string | null> {
  try {
    const { getIntegrationSecrets } = await import("@/lib/integration-secrets");
    const secrets = await getIntegrationSecrets("grantedai");
    if (secrets.apiKey && secrets.apiKey.trim().length > 0) {
      return secrets.apiKey;
    }
  } catch (error) {
    console.error("[grantedai] failed to read integration secrets:", error);
  }
  const envKey = process.env.GRANTEDAI_API_KEY;
  return envKey && envKey.trim().length > 0 ? envKey : null;
}

/** Whether any GrantedAI credential is configured. */
export async function hasGrantedAiKey(): Promise<boolean> {
  return (await getGrantedAiApiKey()) !== null;
}

/**
 * GET against the GrantedAI API. `path` is the /api/v1-relative path
 * (e.g. "/grants", "/foundations/abc-123/grants"). Params with empty or
 * undefined values are dropped.
 */
export async function grantedAiGet<T = unknown>(
  path: string,
  params: Record<string, string | number | undefined> = {}
): Promise<GrantedAiResponse<T>> {
  const apiKey = await getGrantedAiApiKey();
  if (!apiKey) {
    throw new GrantedAiError(
      503,
      "GrantedAI is not configured — add an API key in Grant Research settings"
    );
  }

  const url = new URL(`${GRANTEDAI_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const body = (await response.json().catch(() => null)) as {
    data?: T;
    meta?: GrantedAiMeta;
    error?: { message?: string; status?: number };
  } | null;

  if (!response.ok) {
    const message =
      body?.error?.message || `GrantedAI request failed (${response.status})`;
    throw new GrantedAiError(body?.error?.status || response.status, message);
  }

  return {
    data: body?.data as T,
    meta: body?.meta,
    rateLimit: response.headers.get("X-RateLimit-Limit") || undefined,
  };
}
