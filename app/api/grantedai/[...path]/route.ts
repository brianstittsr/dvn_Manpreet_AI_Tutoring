import { NextRequest, NextResponse } from "next/server";
import {
  GPTLessonAuthError,
  isStaffRole,
  requireAuthenticatedActor,
} from "@/lib/gpt-lesson-server";
import { grantedAiGet, hasGrantedAiKey, GrantedAiError } from "@/lib/grantedai";

export const dynamic = "force-dynamic";

/**
 * GET /api/grantedai/[...path] — staff-only proxy to the GrantedAI Data API.
 *
 * Allowlisted paths (query params pass through):
 *   config                      → local: { configured, envKey }
 *   grants                      → GET /api/v1/grants
 *   grants/:id                  → GET /api/v1/grants/:id
 *   foundations                 → GET /api/v1/foundations
 *   foundations/:id             → GET /api/v1/foundations/:id
 *   foundations/:id/grants      → GET /api/v1/foundations/:id/grants
 *   search                      → GET /api/v1/search   (q required)
 *   discover                    → GET /api/v1/discover (q required)
 */

const SAFE_ID = /^[A-Za-z0-9_-]{1,120}$/;

function isAllowedPath(segments: string[]): boolean {
  if (segments.length === 1) {
    return ["grants", "foundations", "search", "discover"].includes(segments[0]);
  }
  if (segments.length === 2) {
    return (
      ["grants", "foundations"].includes(segments[0]) && SAFE_ID.test(segments[1])
    );
  }
  if (segments.length === 3) {
    return (
      segments[0] === "foundations" &&
      SAFE_ID.test(segments[1]) &&
      segments[2] === "grants"
    );
  }
  return false;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  try {
    const actor = await requireAuthenticatedActor(req);
    if (!isStaffRole(actor.teamMember.role)) {
      throw new GPTLessonAuthError("Staff access is required", 403);
    }

    const { path } = await ctx.params;

    // Local status check (not proxied upstream)
    if (path.length === 1 && path[0] === "config") {
      return NextResponse.json({
        data: {
          configured: await hasGrantedAiKey(),
          envKeyConfigured: Boolean(process.env.GRANTEDAI_API_KEY?.trim()),
        },
      });
    }

    if (!isAllowedPath(path)) {
      return NextResponse.json({ error: "Unknown GrantedAI endpoint" }, { status: 404 });
    }

    const params: Record<string, string> = {};
    req.nextUrl.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const result = await grantedAiGet(`/${path.join("/")}`, params);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof GPTLessonAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof GrantedAiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[grantedai] proxy error:", error);
    return NextResponse.json({ error: "GrantedAI request failed" }, { status: 500 });
  }
}
