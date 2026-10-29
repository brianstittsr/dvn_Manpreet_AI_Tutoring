/**
 * REA browser-scenario capture API
 *
 * POST — staff only. Runs `rea capture-browser-scenario` on the host machine
 * against a caller-supplied URL and returns a summarized Evidence view plus
 * the path where the complete Evidence record was saved (usable as input to
 * /api/rea/environment).
 *
 * Requires a local REA installation; returns 503 when REA is not on this host.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rm } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { rateLimit } from "@/lib/rate-limit";
import {
  GPTLessonAuthError,
  isStaffRole,
  requireAuthenticatedActor,
} from "@/lib/gpt-lesson-server";
import {
  chromiumExecutable,
  isPathInside,
  reaOutputDir,
  runRea,
  saveEvidence,
  writeTempJson,
} from "@/lib/rea";
import os from "node:os";

export const dynamic = "force-dynamic";

const actionStepSchema = z.object({
  step_id: z.string().min(1),
  action: z.enum([
    "goto",
    "click",
    "fill",
    "press",
    "select_option",
    "check",
    "uncheck",
    "wait_for",
    "request",
    "wait_for_timeout",
  ]),
  timeout_ms: z.number().int().min(1).max(120_000).optional(),
  duration_ms: z.number().int().min(0).max(120_000).optional(),
  locator: z
    .object({
      kind: z.enum(["css", "role", "text", "label", "placeholder", "xpath"]),
      selector: z.string().optional(),
      role: z.string().optional(),
      name: z.string().optional(),
    })
    .passthrough()
    .optional(),
  url: z.string().optional(),
  key: z.string().optional(),
  value: z
    .object({
      source: z.enum(["literal", "secret"]),
      value: z.string().optional(),
      secret_id: z.string().optional(),
    })
    .optional(),
  option: z.string().optional(),
  checked: z.boolean().optional(),
  state: z.enum(["visible", "hidden", "attached", "detached"]).optional(),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).optional(),
  path: z.string().optional(),
  expected_status: z.array(z.number().int()).optional(),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.unknown().optional(),
  save_response: z
    .object({
      method: z.string(),
      path: z.string(),
      save: z.array(z.object({ name: z.string(), json_pointer: z.string() })),
    })
    .optional(),
});

const requestSchema = z.object({
  url: z.string().url().refine((u) => /^https?:\/\//.test(u), {
    message: "URL must start with http:// or https://",
  }),
  waitMs: z.number().int().min(0).max(60_000).default(3000),
  actions: z.array(actionStepSchema).max(30).optional(),
  includeDom: z.boolean().default(true),
  includeNetworkBodies: z.boolean().default(false),
  viewport: z
    .object({ width: z.number().int().min(320).max(3840), height: z.number().int().min(240).max(2160) })
    .optional(),
});

function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

interface ReaEvidenceArtifact {
  state?: string;
  value?: { bytes?: number; text?: string };
}

interface ReaEvidenceStep {
  step_id?: string;
  action?: string;
  status?: string;
  elapsed_ms?: number;
  before_url?: { url?: string };
  after_url?: { url?: string; origin?: string };
  artifacts?: {
    accessibility?: ReaEvidenceArtifact;
    dom?: ReaEvidenceArtifact;
    screenshot?: ReaEvidenceArtifact;
  };
  error?: string | null;
}

interface ReaCaptureEvidence {
  evidence_id?: string;
  operation?: string;
  confidence?: string;
  limitations?: string[];
  normalized_result?: {
    browser?: { product?: string; version?: string; headless?: boolean };
    duration_ms?: number;
    steps?: ReaEvidenceStep[];
    events?: { retained?: number; dropped?: number; items?: unknown[] };
  };
}

function summarize(evidence: ReaCaptureEvidence) {
  const nr = evidence.normalized_result;
  const steps = (nr?.steps ?? []).map((s) => ({
    stepId: s.step_id ?? null,
    action: s.action ?? null,
    status: s.status ?? null,
    elapsedMs: s.elapsed_ms ?? null,
    url: s.after_url?.url ?? null,
    hasAccessibility: s.artifacts?.accessibility?.state === "captured",
    hasDom: s.artifacts?.dom?.state === "captured",
    error: s.error ?? null,
  }));

  // Latest captured accessibility text — the closest thing to "the page's
  // readable outline" for cloning decisions.
  const lastA11y = [...(nr?.steps ?? [])]
    .reverse()
    .find((s) => s.artifacts?.accessibility?.value?.text);

  const domBytes = (nr?.steps ?? []).reduce(
    (max, s) => Math.max(max, s.artifacts?.dom?.value?.bytes ?? 0),
    0
  );

  return {
    browser: nr?.browser ?? null,
    durationMs: nr?.duration_ms ?? null,
    stepCount: steps.length,
    steps,
    accessibilityText: lastA11y?.artifacts?.accessibility?.value?.text?.slice(0, 12_000) ?? null,
    domBytes,
    eventsRetained: nr?.events?.retained ?? null,
    confidence: evidence.confidence ?? null,
    limitations: evidence.limitations ?? [],
  };
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { scope: "rea-capture", limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  let scenarioPath: string | null = null;
  try {
    const actor = await requireAuthenticatedActor(request);
    if (!isStaffRole(actor.teamMember.role)) {
      return jsonError("Administrator access is required", 403);
    }

    const body = await request.json().catch(() => null);
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid request", 400);
    }
    const { url, waitMs, actions, includeDom, includeNetworkBodies, viewport } = parsed.data;

    const executablePath = chromiumExecutable();
    if (!executablePath) {
      return jsonError(
        "No Chromium executable found for REA browser scenarios. Install Playwright chromium or set REA_CHROMIUM_PATH in .env.local.",
        503
      );
    }

    const scenario = {
      browser: { mode: "launch", executable_path: executablePath.replace(/\\/g, "/") },
      start_url: { url },
      environment: viewport ? { viewport } : undefined,
      capture: {
        after_each_step: ["accessibility"],
        at_end: includeDom ? ["dom", "accessibility"] : ["accessibility"],
        network: {
          request_body: false,
          response_body: includeNetworkBodies,
          header_values: false,
        },
      },
      actions: actions ?? [
        { step_id: "settle", action: "wait_for_timeout", duration_ms: waitMs },
      ],
    };

    scenarioPath = writeTempJson(scenario, "rea-scenario");
    const result = await runRea(
      ["capture-browser-scenario", scenarioPath, "--format", "json"],
      240_000
    );

    if (!result.ok) {
      const reaErr = result.json as { error?: string; details?: { issues?: unknown[] } } | null;
      return NextResponse.json(
        {
          error: result.error || "REA capture failed",
          details: reaErr?.details?.issues ?? null,
        },
        { status: 502 }
      );
    }

    const evidence = result.json as ReaCaptureEvidence;
    const captureFile = saveEvidence(
      evidence as { evidence_id?: string },
      randomUUID()
    );
    if (!isPathInside(captureFile, reaOutputDir())) {
      return jsonError("Failed to persist capture output", 500);
    }

    return NextResponse.json({
      ok: true,
      evidenceId: evidence.evidence_id ?? null,
      captureFile,
      outputDir: reaOutputDir(),
      summary: summarize(evidence),
    });
  } catch (error) {
    if (error instanceof GPTLessonAuthError) {
      return jsonError(error.message, error.status);
    }
    console.error("REA capture error:", error);
    return jsonError("REA capture failed", 500);
  } finally {
    if (scenarioPath) {
      rm(scenarioPath, { force: true }).catch(() => undefined);
    }
  }
}

// Surface a liveness signal for the admin UI without running a browser.
export async function GET() {
  const home = (await import("@/lib/rea")).reaHome();
  return NextResponse.json({
    reaInstalled: Boolean(home),
    reaHome: home,
    chromium: chromiumExecutable(),
    outputDir: reaOutputDir(),
    platform: os.platform(),
  });
}
