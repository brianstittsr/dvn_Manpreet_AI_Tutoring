/**
 * REA website-script export + static analysis API
 *
 * POST — staff only. Runs `rea export-web-scripts` on a previously saved
 * capture Evidence file (from /api/rea/capture with network bodies enabled),
 * writing the site's retained JavaScript under <REA_OUTPUT_DIR>/scripts/<name>/.
 * When `analyze` is true it then runs `rea analyze-javascript-application` on
 * the exported files and returns a compact per-file summary.
 *
 * The capture must have been recorded with response bodies selected
 * (includeNetworkBodies in /api/rea/capture), otherwise REA exports nothing.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { rateLimit } from "@/lib/rate-limit";
import {
  GPTLessonAuthError,
  isStaffRole,
  requireAuthenticatedActor,
} from "@/lib/gpt-lesson-server";
import { isPathInside, reaOutputDir, runRea } from "@/lib/rea";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  captureFile: z.string().min(1),
  name: z
    .string()
    .min(1)
    .max(48)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Name must be kebab-case (a-z, 0-9, hyphens)"),
  analyze: z.boolean().default(true),
});

function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

interface ExportScriptRecord {
  url?: string;
  source?: { kind?: string; status?: number };
  content?: {
    state?: string;
    relative_path?: string;
    bytes?: number;
    sha256?: string;
    redacted?: boolean;
  };
}

interface ExportNormalizedResult {
  analysis_input?: { input_path?: string; format?: string } | null;
  scripts?: ExportScriptRecord[];
  limitations?: string[];
  manifest?: { path?: string };
}

interface JsAssetNode {
  kind?: string;
  observations?: Array<{
    properties?: {
      path?: string;
      bytes?: number;
      parse_status?: string;
      analysis_coverage?: {
        syntax?: { status?: string; error_count?: number };
        semantics?: { unknown_findings?: number };
      };
    };
  }>;
}

interface AnalysisEvidence {
  evidence_id?: string;
  normalized_result?: {
    graph?: { nodes?: JsAssetNode[] };
  };
  limitations?: string[];
}

function summarizeAnalysis(evidence: AnalysisEvidence) {
  const nodes = evidence.normalized_result?.graph?.nodes ?? [];
  const files = nodes
    .filter((n) => n.kind === "javascript-asset")
    .map((n) => {
      const props = n.observations?.[0]?.properties ?? {};
      return {
        path: props.path ?? null,
        bytes: props.bytes ?? null,
        parseStatus: props.parse_status ?? null,
        syntaxErrors: props.analysis_coverage?.syntax?.error_count ?? null,
        unknownFindings: props.analysis_coverage?.semantics?.unknown_findings ?? null,
      };
    });
  return {
    evidenceId: evidence.evidence_id ?? null,
    fileCount: files.length,
    files: files.slice(0, 50),
    limitations: evidence.limitations ?? [],
  };
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { scope: "rea-scripts", limit: 10, windowMs: 60_000 });
  if (limited) return limited;

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
    const { captureFile, name, analyze } = parsed.data;

    const capturesRoot = path.join(reaOutputDir(), "captures");
    if (!isPathInside(captureFile, capturesRoot) || !existsSync(captureFile)) {
      return jsonError(
        "captureFile must be a file under the REA captures directory (run a capture first)",
        400
      );
    }

    const outDir = path.join(reaOutputDir(), "scripts", name);
    if (existsSync(outDir)) {
      return jsonError(
        `Output directory already exists: ${outDir}. Choose another name.`,
        409
      );
    }

    const exported = await runRea(
      ["export-web-scripts", captureFile, outDir, "--format", "json"],
      180_000
    );
    if (!exported.ok) {
      return NextResponse.json(
        { error: exported.error || "REA script export failed", details: exported.json ?? null },
        { status: 502 }
      );
    }

    const exportResult = (exported.json as { normalized_result?: ExportNormalizedResult })
      .normalized_result ?? {};
    const scripts = (exportResult.scripts ?? []).map((s) => ({
      url: s.url ?? null,
      status: s.source?.status ?? null,
      state: s.content?.state ?? null,
      relativePath: s.content?.relative_path ?? null,
      bytes: s.content?.bytes ?? null,
      redacted: s.content?.redacted ?? null,
    }));
    const analysisInput = exportResult.analysis_input?.input_path ?? null;

    let analysis: ReturnType<typeof summarizeAnalysis> | null = null;
    let analysisFile: string | null = null;
    if (analyze && analysisInput) {
      const analyzed = await runRea(
        ["analyze-javascript-application", analysisInput, "--format", "json"],
        300_000
      );
      if (analyzed.ok) {
        const evidence = analyzed.json as AnalysisEvidence;
        analysisFile = path.join(outDir, "analysis-evidence.json");
        writeFileSync(analysisFile, JSON.stringify(evidence, null, 2), "utf8");
        analysis = summarizeAnalysis(evidence);
      }
    }

    return NextResponse.json({
      ok: true,
      outputDir: outDir,
      manifestPath: exportResult.manifest?.path ?? null,
      scriptCount: scripts.length,
      scripts: scripts.slice(0, 100),
      analysisInput,
      analysisFile,
      analysis,
      limitations: exportResult.limitations ?? [],
    });
  } catch (error) {
    if (error instanceof GPTLessonAuthError) {
      return jsonError(error.message, error.status);
    }
    console.error("REA script export error:", error);
    return jsonError("REA script export failed", 500);
  }
}
