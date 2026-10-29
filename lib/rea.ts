/**
 * REA (Reverse Engineer Anything) server-side helpers.
 *
 * Spawns the local REA CLI (scripts/rea.mjs) and returns parsed JSON output.
 * REA is a local-only tool — these routes only work on a host where the REA
 * repository is installed (local dev machine, self-hosted server), never on
 * serverless deployments without it.
 *
 * Configure via environment:
 *   REA_HOME           — path to the cloned rea repo (default: sibling checkout)
 *   REA_CHROMIUM_PATH  — explicit Chrome/Chromium exe for browser scenarios
 *   REA_OUTPUT_DIR     — where capture Evidence + env bundles are written
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";

const execFileAsync = promisify(execFile);

const DEFAULT_REA_HOME = "C:\\Users\\Buyer\\Documents\\CascadeProjects\\rea";

/** Resolved REA repo root, or null when no usable installation is found. */
export function reaHome(): string | null {
  const candidates = [process.env.REA_HOME, DEFAULT_REA_HOME].filter(
    (c): c is string => Boolean(c)
  );
  for (const home of candidates) {
    if (existsSync(path.join(home, "scripts", "rea.mjs"))) return home;
  }
  return null;
}

/** Directory where capture Evidence and environment bundles are persisted. */
export function reaOutputDir(): string {
  const dir = process.env.REA_OUTPUT_DIR || path.join(os.homedir(), "rea-captures");
  return dir;
}

/**
 * Best available Chrome/Chromium executable for browser scenarios, preferring
 * REA_CHROMIUM_PATH then the newest installed Playwright chromium build.
 */
export function chromiumExecutable(): string | null {
  const override = process.env.REA_CHROMIUM_PATH;
  if (override && existsSync(override)) return override;

  const playwrightDir = path.join(os.homedir(), "AppData", "Local", "ms-playwright");
  if (!existsSync(playwrightDir)) return null;

  const candidates = readdirSync(playwrightDir)
    .filter((dir) => dir.startsWith("chromium-"))
    .map((dir) => {
      const exe = path.join(playwrightDir, dir, "chrome-win64", "chrome.exe");
      return { exe, version: Number(dir.replace("chromium-", "")) || 0 };
    })
    .filter((c) => existsSync(c.exe))
    .sort((a, b) => a.version - b.version);

  return candidates.at(-1)?.exe ?? null;
}

export interface ReaRunResult {
  ok: boolean;
  /** Parsed JSON from stdout (success Evidence or REA error object). */
  json: unknown;
  error?: string;
  /** Non-JSON stdout, when REA produced output we could not parse. */
  raw?: string;
}

/**
 * Run the REA CLI with JSON output. Nonzero exits that still produced JSON
 * errors are surfaced via `ok: false` with `json` set to the error object.
 */
export async function runRea(args: string[], timeoutMs = 180_000): Promise<ReaRunResult> {
  const home = reaHome();
  if (!home) {
    return {
      ok: false,
      json: null,
      error:
        "REA is not installed on this host. Clone morluto/rea and set REA_HOME in .env.local. Browser cloning only works when the app server runs on a machine with REA (e.g. npm run dev locally).",
    };
  }

  const entry = path.join(home, "scripts", "rea.mjs");
  try {
    const { stdout } = await execFileAsync(process.execPath, [entry, ...args], {
      timeout: timeoutMs,
      maxBuffer: 64 * 1024 * 1024,
      windowsHide: true,
    });
    const trimmed = stdout.trim();
    try {
      return { ok: true, json: JSON.parse(trimmed) };
    } catch {
      return { ok: false, json: null, error: "REA returned non-JSON output", raw: trimmed.slice(0, 4000) };
    }
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; message?: string; killed?: boolean };
    if (e.stdout) {
      try {
        const parsed = JSON.parse(e.stdout) as { error?: string; message?: string };
        return {
          ok: false,
          json: parsed,
          error: parsed.error || parsed.message || "REA command failed",
        };
      } catch {
        /* fall through */
      }
    }
    return {
      ok: false,
      json: null,
      error: e.killed ? "REA command timed out" : e.message || "REA command failed",
    };
  }
}

/** Write a JSON payload to a temp file and return its path. */
export function writeTempJson(payload: unknown, prefix = "rea-input"): string {
  const file = path.join(os.tmpdir(), `${prefix}-${randomUUID()}.json`);
  writeFileSync(file, JSON.stringify(payload, null, 2), "utf8");
  return file;
}

/** Persist an Evidence record under <output>/captures/ and return the path. */
export function saveEvidence(evidence: { evidence_id?: string }, fallbackId: string): string {
  const dir = path.join(reaOutputDir(), "captures");
  mkdirSync(dir, { recursive: true });
  const id = (evidence.evidence_id || fallbackId).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
  const file = path.join(dir, `${id}.json`);
  writeFileSync(file, JSON.stringify(evidence, null, 2), "utf8");
  return file;
}

/** True when `candidate` resolves inside `root` (path traversal guard). */
export function isPathInside(candidate: string, root: string): boolean {
  const rel = path.relative(path.resolve(root), path.resolve(candidate));
  return rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel);
}
