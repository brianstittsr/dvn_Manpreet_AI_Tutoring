/**
 * Integration settings API
 *
 * Credentials (API keys, client secrets, webhook secrets) are stored in the
 * server-only `platformSecrets` collection. Non-secret configuration (IDs,
 * URLs, connection status) is kept in `platformSettings` for portal display.
 *
 * GET  — staff only; returns config with secret fields masked (****last4).
 * POST — staff only; persists new secrets to platformSecrets and sanitized
 *        config to platformSettings. Masked or empty secret fields keep their
 *        stored values.
 */

import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import {
  GPTLessonAuthError,
  isStaffRole,
  requireAdminDb,
  requireAuthenticatedActor,
} from "@/lib/gpt-lesson-server";
import {
  getServerApiKeys,
  getServerIntegrationSecrets,
  isMaskedSecret,
  maskSecret,
  SECRET_INTEGRATION_FIELDS,
} from "@/lib/integration-secrets";

export const dynamic = "force-dynamic";

const PROVIDERS = Object.keys(SECRET_INTEGRATION_FIELDS);

/** Fields that stay client-readable (non-secret) per provider. */
const PUBLIC_INTEGRATION_FIELDS: Record<string, readonly string[]> = {
  apollo: ["accountId"],
  zoom: ["accountId"],
  docuseal: [],
  stripe: ["publishableKey"],
  linkedin: ["clientId", "organizationId"],
};

const integrationEntrySchema = z.record(z.string(), z.string());
const requestBodySchema = z.object({
  integrations: z.record(z.string(), integrationEntrySchema).optional(),
  apiKeys: z.record(z.string(), z.string()).optional(),
});

function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

async function requireStaffActor(request: NextRequest) {
  const actor = await requireAuthenticatedActor(request);
  if (!isStaffRole(actor.teamMember.role)) {
    throw new GPTLessonAuthError("Administrator access is required", 403);
  }
  return actor;
}

async function readPublicIntegrations(): Promise<Record<string, Record<string, unknown>>> {
  const db = requireAdminDb();
  const snap = await db.collection("platformSettings").doc("global").get();
  if (!snap.exists) return {};
  const data = snap.data() as { integrations?: Record<string, Record<string, unknown>> } | undefined;
  return data?.integrations ?? {};
}

function publicIntegrations(
  settings: Record<string, Record<string, unknown>>,
  secrets: Record<string, Record<string, string>>
): Record<string, Record<string, unknown>> {
  const result: Record<string, Record<string, unknown>> = {};
  const providers = new Set([...PROVIDERS, ...Object.keys(settings), ...Object.keys(secrets)]);

  for (const provider of providers) {
    const merged: Record<string, unknown> = {};
    const publicFields = new Set(PUBLIC_INTEGRATION_FIELDS[provider] ?? []);
    const secretFields = new Set(SECRET_INTEGRATION_FIELDS[provider] ?? []);

    for (const [key, value] of Object.entries(settings[provider] ?? {})) {
      if (!secretFields.has(key)) {
        merged[key] = value;
      }
    }
    for (const field of publicFields) {
      if (!(field in merged)) merged[field] = "";
    }
    for (const field of secretFields) {
      merged[field] = "";
      merged[`has${field[0].toUpperCase()}${field.slice(1)}`] =
        Boolean(secrets[provider]?.[field]);
    }
    result[provider] = merged;
  }
  return result;
}

function maskApiKeys(apiKeys: Record<string, unknown>): Record<string, unknown> {
  const masked: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(apiKeys)) {
    if (typeof value === "string") {
      masked[key] = maskSecret(value);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      masked[key] = maskApiKeys(value as Record<string, unknown>);
    } else {
      masked[key] = value;
    }
  }
  return masked;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await requireStaffActor(request);
    const [settings, secrets, apiKeys] = await Promise.all([
      readPublicIntegrations(),
      getServerIntegrationSecrets(),
      getServerApiKeys(),
    ]);
    return NextResponse.json({
      data: {
        integrations: publicIntegrations(settings, secrets),
        apiKeys: maskApiKeys(apiKeys),
      },
    });
  } catch (error: unknown) {
    if (error instanceof GPTLessonAuthError) {
      return jsonError(error.message, error.status);
    }
    console.error("Integration settings GET error:", error);
    return jsonError("Unable to load integration settings", 500);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await requireStaffActor(request);
    const body = requestBodySchema.parse(await request.json());
    const db = requireAdminDb();

    const existingSecrets = await getServerIntegrationSecrets();
    const existingApiKeys = await getServerApiKeys();

    const secretsUpdate: Record<string, string> = {};
    const settingsUpdate: Record<string, unknown> = {};

    if (body.integrations) {
      for (const [provider, entry] of Object.entries(body.integrations)) {
        const secretFields = new Set(SECRET_INTEGRATION_FIELDS[provider] ?? []);
        const publicFields = new Set(PUBLIC_INTEGRATION_FIELDS[provider] ?? []);

        for (const [field, rawValue] of Object.entries(entry)) {
          const value = rawValue.trim();
          if (secretFields.has(field)) {
            if (value && !isMaskedSecret(value)) {
              secretsUpdate[`integrations.${provider}.${field}`] = value;
            }
            // Always keep the client-readable field blank.
            settingsUpdate[`integrations.${provider}.${field}`] = "";
          } else if (publicFields.has(field) || field === "status") {
            settingsUpdate[`integrations.${provider}.${field}`] = value;
          }
        }
      }
    }

    if (body.apiKeys) {
      for (const [name, rawValue] of Object.entries(body.apiKeys)) {
        const value = rawValue.trim();
        if (value && !isMaskedSecret(value)) {
          secretsUpdate[`apiKeys.${name}`] = value;
        }
      }
      settingsUpdate.apiKeys = {};
    }

    if (Object.keys(secretsUpdate).length > 0) {
      await db.collection("platformSecrets").doc("global").set(
        { ...dotMerge(secretsUpdate, existingSecrets, existingApiKeys), updatedAt: Timestamp.now() },
        { merge: true }
      );
    }
    if (Object.keys(settingsUpdate).length > 0) {
      settingsUpdate.secretsStoredSeparately = true;
      settingsUpdate.updatedAt = Timestamp.now();
      await db.collection("platformSettings").doc("global").set(settingsUpdate, { merge: true });
    }

    const [settings, secrets, apiKeys] = await Promise.all([
      readPublicIntegrations(),
      getServerIntegrationSecrets(),
      getServerApiKeys(),
    ]);
    return NextResponse.json({
      data: {
        integrations: publicIntegrations(settings, secrets),
        apiKeys: maskApiKeys(apiKeys),
      },
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return jsonError("Invalid integration settings", 400);
    }
    if (error instanceof GPTLessonAuthError) {
      return jsonError(error.message, error.status);
    }
    console.error("Integration settings POST error:", error);
    return jsonError("Unable to save integration settings", 500);
  }
}

/**
 * Expand dotted update paths ("integrations.apollo.apiKey") into a nested
 * object merged over the existing secrets so unrelated entries are preserved.
 */
function dotMerge(
  updates: Record<string, string>,
  existingSecrets: Record<string, Record<string, string>>,
  existingApiKeys: Record<string, unknown>
): Record<string, unknown> {
  const root: Record<string, unknown> = {
    integrations: { ...existingSecrets },
    apiKeys: { ...existingApiKeys },
  };

  for (const [path, value] of Object.entries(updates)) {
    const [top, second, third] = path.split(".");
    if (top === "integrations" && second && third) {
      const providers = root.integrations as Record<string, Record<string, string>>;
      providers[second] = { ...(providers[second] ?? {}), [third]: value };
    } else if (top === "apiKeys" && second) {
      const apiKeys = root.apiKeys as Record<string, unknown>;
      apiKeys[second] = value;
    }
  }

  return root;
}