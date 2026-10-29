import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import {
  GPTLessonAuthError,
  isStaffRole,
  requireAdminDb,
  requireAuthenticatedActor,
} from "@/lib/gpt-lesson-server";

export const dynamic = "force-dynamic";

const llmConfigSchema = z.object({
  provider: z.string().min(1).max(80),
  model: z.string().min(1).max(120),
  apiKey: z.string().max(500).optional(),
  clearApiKey: z.boolean().optional(),
  ollamaUrl: z.string().max(500).optional(),
  useOllama: z.boolean().optional(),
  baseUrl: z.string().max(500).optional(),
  useOpenAICompatible: z.boolean().optional(),
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

async function getSecretConfig(): Promise<Record<string, unknown>> {
  const db = requireAdminDb();
  const secretSnap = await db.collection("platformSecrets").doc("global").get();
  const secretConfig = secretSnap.exists ? secretSnap.data()?.llmConfig : null;
  if (secretConfig) return secretConfig as Record<string, unknown>;

  const settingsSnap = await db.collection("platformSettings").doc("global").get();
  const legacyConfig = settingsSnap.exists ? settingsSnap.data()?.llmConfig : null;
  return (legacyConfig || {}) as Record<string, unknown>;
}

function publicConfig(config: Record<string, unknown>) {
  return {
    provider: typeof config.provider === "string" ? config.provider : "openai",
    model: typeof config.model === "string" ? config.model : "gpt-4o",
    apiKey: "",
    hasApiKey: typeof config.apiKey === "string" && config.apiKey.length > 0,
    ollamaUrl: typeof config.ollamaUrl === "string" ? config.ollamaUrl : "http://localhost:11434",
    useOllama: config.useOllama === true,
    baseUrl: typeof config.baseUrl === "string" ? config.baseUrl : "",
    useOpenAICompatible: config.useOpenAICompatible === true,
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await requireStaffActor(request);
    return NextResponse.json({ data: publicConfig(await getSecretConfig()) });
  } catch (error: unknown) {
    if (error instanceof GPTLessonAuthError) {
      return jsonError(error.message, error.status);
    }
    console.error("LLM settings GET error:", error);
    return jsonError("Unable to load LLM settings", 500);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await requireStaffActor(request);
    const body = llmConfigSchema.parse(await request.json());
    const existing = await getSecretConfig();
    const apiKey = body.clearApiKey
      ? ""
      : body.apiKey && body.apiKey.trim()
        ? body.apiKey.trim()
        : typeof existing.apiKey === "string"
          ? existing.apiKey
          : "";

    const llmConfig = {
      provider: body.provider,
      model: body.model,
      apiKey,
      ollamaUrl: body.ollamaUrl || "http://localhost:11434",
      useOllama: body.useOllama || false,
      baseUrl: body.baseUrl || "",
      useOpenAICompatible: body.useOpenAICompatible || false,
      updatedAt: Timestamp.now(),
    };

    const db = requireAdminDb();
    await db.collection("platformSecrets").doc("global").set(
      { llmConfig, updatedAt: Timestamp.now() },
      { merge: true }
    );
    await db.collection("platformSettings").doc("global").set(
      {
        llmConfig: {
          provider: llmConfig.provider,
          model: llmConfig.model,
          apiKey: "",
          apiKeyStoredSeparately: true,
          ollamaUrl: llmConfig.ollamaUrl,
          useOllama: llmConfig.useOllama,
          baseUrl: llmConfig.baseUrl,
          useOpenAICompatible: llmConfig.useOpenAICompatible,
        },
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    return NextResponse.json({ data: publicConfig(llmConfig) });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return jsonError("Invalid LLM settings", 400);
    }
    if (error instanceof GPTLessonAuthError) {
      return jsonError(error.message, error.status);
    }
    console.error("LLM settings POST error:", error);
    return jsonError("Unable to save LLM settings", 500);
  }
}
