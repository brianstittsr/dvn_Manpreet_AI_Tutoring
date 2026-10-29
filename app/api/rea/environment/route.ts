/**
 * REA AgentEnv bundle build API
 *
 * POST — staff only. Runs `rea environment-build` on a previously saved
 * capture Evidence file (from /api/rea/capture) and writes an agent
 * environment bundle under <REA_OUTPUT_DIR>/envs/<name>/.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { existsSync, readdirSync } from "node:fs";
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
  dryRun: z.boolean().default(false),
});

function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { scope: "rea-environment", limit: 10, windowMs: 60_000 });
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
    const { captureFile, name, dryRun } = parsed.data;

    // Only allow capture files this server wrote under the output directory.
    const capturesRoot = path.join(reaOutputDir(), "captures");
    if (!isPathInside(captureFile, capturesRoot) || !existsSync(captureFile)) {
      return jsonError(
        "captureFile must be a file under the REA captures directory (run a capture first)",
        400
      );
    }

    const outDir = path.join(reaOutputDir(), "envs", name);
    if (!dryRun && existsSync(outDir) && readdirSync(outDir).length > 0) {
      return jsonError(
        `Environment directory already exists and is not empty: ${outDir}. Choose another name.`,
        409
      );
    }

    const args = ["environment-build", captureFile];
    if (dryRun) {
      args.push("--dry-run");
    } else {
      args.push(outDir);
    }
    args.push("--name", name, "--format", "json");

    const result = await runRea(args, 300_000);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || "REA environment build failed", details: result.json ?? null },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      dryRun,
      bundleDir: dryRun ? null : outDir,
      result: result.json,
    });
  } catch (error) {
    if (error instanceof GPTLessonAuthError) {
      return jsonError(error.message, error.status);
    }
    console.error("REA environment build error:", error);
    return jsonError("REA environment build failed", 500);
  }
}
