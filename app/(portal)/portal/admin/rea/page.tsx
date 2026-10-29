"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Globe,
  Loader2,
  Play,
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FolderOutput,
  ClipboardCopy,
  MonitorDown,
  FileCode2,
} from "lucide-react";
import { authedJsonHeaders } from "@/lib/api-client";

interface ReaHealth {
  reaInstalled: boolean;
  reaHome: string | null;
  chromium: string | null;
  outputDir: string;
}

interface CaptureStep {
  stepId: string | null;
  action: string | null;
  status: string | null;
  elapsedMs: number | null;
  url: string | null;
  hasAccessibility: boolean;
  hasDom: boolean;
  error: string | null;
}

interface CaptureSummary {
  browser: { product?: string; version?: string; headless?: boolean } | null;
  durationMs: number | null;
  stepCount: number;
  steps: CaptureStep[];
  accessibilityText: string | null;
  domBytes: number;
  eventsRetained: number | null;
  confidence: string | null;
  limitations: string[];
}

interface CaptureResult {
  evidenceId: string | null;
  captureFile: string;
  outputDir: string;
  summary: CaptureSummary;
}

export default function ReaAdminPage() {
  const [health, setHealth] = useState<ReaHealth | null>(null);
  const [healthError, setHealthError] = useState(false);

  const [url, setUrl] = useState("");
  const [waitSeconds, setWaitSeconds] = useState(3);
  const [includeDom, setIncludeDom] = useState(true);
  const [includeNetworkBodies, setIncludeNetworkBodies] = useState(true);
  const [actionsJson, setActionsJson] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [capture, setCapture] = useState<CaptureResult | null>(null);

  const [envName, setEnvName] = useState("");
  const [buildingEnv, setBuildingEnv] = useState(false);
  const [envResult, setEnvResult] = useState<{ bundleDir: string | null; result: unknown } | null>(null);

  const [scriptsName, setScriptsName] = useState("");
  const [exportingScripts, setExportingScripts] = useState(false);
  const [scriptsResult, setScriptsResult] = useState<{
    outputDir: string;
    scriptCount: number;
    scripts: { url: string | null; relativePath: string | null; bytes: number | null }[];
    analysisFile: string | null;
    analysis: { fileCount: number; files: { path: string | null; bytes: number | null; parseStatus: string | null }[] } | null;
  } | null>(null);

  useEffect(() => {
    fetch("/api/rea/capture")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealthError(true));
  }, []);

  const runCapture = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      toast.error("Enter a URL to capture");
      return;
    }
    let actions: unknown[] | undefined;
    if (actionsJson.trim()) {
      try {
        const parsed = JSON.parse(actionsJson);
        if (!Array.isArray(parsed)) throw new Error("not an array");
        actions = parsed;
      } catch {
        toast.error("Advanced actions must be a JSON array of step objects");
        return;
      }
    }

    setCapturing(true);
    setCapture(null);
    setEnvResult(null);
    setScriptsResult(null);
    try {
      const res = await fetch("/api/rea/capture", {
        method: "POST",
        headers: await authedJsonHeaders(),
        body: JSON.stringify({
          url: trimmedUrl,
          waitMs: waitSeconds * 1000,
          actions,
          includeDom,
          includeNetworkBodies,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Capture failed");
        return;
      }
      setCapture(data);
      toast.success("Page captured");
    } catch {
      toast.error("Capture request failed");
    } finally {
      setCapturing(false);
    }
  };

  const buildEnvironment = async () => {
    if (!capture?.captureFile) {
      toast.error("Run a capture first");
      return;
    }
    const name = envName.trim() || `env-${Date.now().toString(36)}`;
    setBuildingEnv(true);
    setEnvResult(null);
    try {
      const res = await fetch("/api/rea/environment", {
        method: "POST",
        headers: await authedJsonHeaders(),
        body: JSON.stringify({ captureFile: capture.captureFile, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Environment build failed");
        return;
      }
      setEnvResult({ bundleDir: data.bundleDir, result: data.result });
      toast.success("Environment bundle written");
    } catch {
      toast.error("Environment build request failed");
    } finally {
      setBuildingEnv(false);
    }
  };

  const exportScripts = async () => {
    if (!capture?.captureFile) {
      toast.error("Run a capture first");
      return;
    }
    const name = scriptsName.trim() || `site-${Date.now().toString(36)}`;
    setExportingScripts(true);
    setScriptsResult(null);
    try {
      const res = await fetch("/api/rea/scripts", {
        method: "POST",
        headers: await authedJsonHeaders(),
        body: JSON.stringify({ captureFile: capture.captureFile, name, analyze: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Script export failed");
        return;
      }
      setScriptsResult(data);
      toast.success(
        data.scriptCount > 0
          ? `Exported ${data.scriptCount} script${data.scriptCount === 1 ? "" : "s"}`
          : "Export finished — no scripts were retained in this capture"
      );
    } catch {
      toast.error("Script export request failed");
    } finally {
      setExportingScripts(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success("Copied"));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-slate-900 text-white">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">REA Web Cloner</h1>
          <p className="text-sm text-slate-600">
            Capture a live website with REA — page structure, network calls, and agent-environment bundles for cloning functionality.
          </p>
        </div>
      </div>

      {healthError || (health && !health.reaInstalled) ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>REA is not available on this host</AlertTitle>
          <AlertDescription>
            This module runs the REA CLI on the machine serving this app. It works when you run{" "}
            <code className="font-mono text-xs">npm run dev</code> locally with the{" "}
            <code className="font-mono text-xs">rea</code> repo installed — not on Vercel. Set{" "}
            <code className="font-mono text-xs">REA_HOME</code> in .env.local if REA lives elsewhere.
          </AlertDescription>
        </Alert>
      ) : (
        health && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
              <span>REA: <code className="font-mono">{health.reaHome}</code></span>
              <span>Chromium: <code className="font-mono">{health.chromium ?? "not found"}</code></span>
              <span>Output: <code className="font-mono">{health.outputDir}</code></span>
            </AlertDescription>
          </Alert>
        )
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MonitorDown className="w-5 h-5" />
            Capture a Page
          </CardTitle>
          <CardDescription>
            Launch a headless browser, load the page, and record its structure and network activity as Evidence.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="rea-url">Page URL</Label>
              <Input
                id="rea-url"
                placeholder="https://example.com/dashboard"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2 w-32">
              <Label htmlFor="rea-wait">Settle (sec)</Label>
              <Input
                id="rea-wait"
                type="number"
                min={0}
                max={60}
                value={waitSeconds}
                onChange={(e) => setWaitSeconds(Math.max(0, Math.min(60, Number(e.target.value) || 0)))}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={includeDom} onCheckedChange={(c) => setIncludeDom(c === true)} />
              Capture DOM snapshot
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={includeNetworkBodies} onCheckedChange={(c) => setIncludeNetworkBodies(c === true)} />
              Record network response bodies{" "}
              <span className="text-xs text-slate-500">(required for env bundles &amp; script export)</span>
            </label>
          </div>

          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="px-0 text-slate-600">
                <ChevronDown className={`w-4 h-4 mr-1 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
                Advanced: custom action steps (JSON)
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <Textarea
                rows={6}
                className="font-mono text-xs"
                placeholder='[{"step_id":"click-login","action":"click","timeout_ms":15000,"locator":{"kind":"role","role":"button","name":"Log in"}}]'
                value={actionsJson}
                onChange={(e) => setActionsJson(e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">
                Leave empty for a plain load + settle. Actions: goto, click, fill, press, select_option,
                check, uncheck, wait_for, request, wait_for_timeout.
              </p>
            </CollapsibleContent>
          </Collapsible>

          <Button onClick={runCapture} disabled={capturing || !health?.reaInstalled}>
            {capturing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Capturing…</>
            ) : (
              <><Play className="w-4 h-4 mr-2" /> Run Capture</>
            )}
          </Button>
        </CardContent>
      </Card>

      {capture && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Capture Results
              {capture.summary.confidence && (
                <Badge variant="secondary">{capture.summary.confidence}</Badge>
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span className="font-mono text-xs break-all">{capture.captureFile}</span>
              <button onClick={() => copy(capture.captureFile)} className="shrink-0 text-slate-500 hover:text-slate-800">
                <ClipboardCopy className="w-4 h-4" />
              </button>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3 text-sm">
              {capture.summary.browser && (
                <Badge variant="outline">
                  {capture.summary.browser.product} {capture.summary.browser.version}
                </Badge>
              )}
              <Badge variant="outline">{capture.summary.stepCount} steps</Badge>
              {capture.summary.durationMs != null && (
                <Badge variant="outline">{(capture.summary.durationMs / 1000).toFixed(1)}s</Badge>
              )}
              {capture.summary.domBytes > 0 && (
                <Badge variant="outline">{Math.round(capture.summary.domBytes / 1024)} KB DOM</Badge>
              )}
              {capture.summary.eventsRetained != null && capture.summary.eventsRetained > 0 && (
                <Badge variant="outline">{capture.summary.eventsRetained} network events</Badge>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Steps</h3>
              <div className="border rounded-md divide-y text-sm">
                {capture.summary.steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2">
                    {s.error ? (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    )}
                    <span className="font-mono text-xs w-40 truncate">{s.stepId}</span>
                    <span className="text-slate-500 text-xs w-28">{s.action}</span>
                    <span className="text-slate-400 text-xs flex-1 truncate">{s.url}</span>
                    <span className="text-slate-400 text-xs">{s.elapsedMs}ms</span>
                  </div>
                ))}
              </div>
            </div>

            {capture.summary.accessibilityText && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Page outline (accessibility tree)</h3>
                <pre className="text-xs bg-slate-50 border rounded-md p-3 max-h-72 overflow-auto whitespace-pre-wrap font-mono">
                  {capture.summary.accessibilityText}
                </pre>
              </div>
            )}

            {capture.summary.limitations.length > 0 && (
              <details className="text-xs text-slate-500">
                <summary className="cursor-pointer font-semibold">Limitations ({capture.summary.limitations.length})</summary>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {capture.summary.limitations.map((l, i) => <li key={i}>{l}</li>)}
                </ul>
              </details>
            )}
          </CardContent>
        </Card>
      )}

      {capture && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOutput className="w-5 h-5" />
              Build Agent Environment
            </CardTitle>
            <CardDescription>
              Turn this capture into an AgentEnv bundle — a replayable environment of the
              site&apos;s reads and writes that an agent can run locally to study how it works.
              Requires a capture recorded with network response bodies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-end">
              <div className="space-y-2">
                <Label htmlFor="rea-env-name">Environment name (kebab-case)</Label>
                <Input
                  id="rea-env-name"
                  placeholder="my-captured-site"
                  value={envName}
                  onChange={(e) => setEnvName(e.target.value)}
                />
              </div>
              <Button onClick={buildEnvironment} disabled={buildingEnv} variant="secondary">
                {buildingEnv ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Building…</>
                ) : (
                  "Build Bundle"
                )}
              </Button>
            </div>

            {envResult && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Environment bundle written</AlertTitle>
                <AlertDescription className="space-y-2">
                  {envResult.bundleDir && (
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs break-all">{envResult.bundleDir}</code>
                      <button onClick={() => copy(envResult.bundleDir!)} className="shrink-0 text-slate-500 hover:text-slate-800">
                        <ClipboardCopy className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <details>
                    <summary className="cursor-pointer text-xs font-semibold">Build report (JSON)</summary>
                    <pre className="text-xs bg-slate-50 border rounded-md p-3 mt-2 max-h-64 overflow-auto font-mono">
                      {JSON.stringify(envResult.result, null, 2)}
                    </pre>
                  </details>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
      {capture && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode2 className="w-5 h-5" />
              Export Site Scripts
            </CardTitle>
            <CardDescription>
              Extract the JavaScript the page actually loaded into a local folder, then run REA&apos;s
              static analyzer to map its modules — the raw material for cloning functionality.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-end">
              <div className="space-y-2">
                <Label htmlFor="rea-scripts-name">Export name (kebab-case)</Label>
                <Input
                  id="rea-scripts-name"
                  placeholder="my-site-scripts"
                  value={scriptsName}
                  onChange={(e) => setScriptsName(e.target.value)}
                />
              </div>
              <Button onClick={exportScripts} disabled={exportingScripts} variant="secondary">
                {exportingScripts ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Exporting…</>
                ) : (
                  "Export & Analyze"
                )}
              </Button>
            </div>

            {scriptsResult && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>
                  {scriptsResult.scriptCount > 0
                    ? `${scriptsResult.scriptCount} script${scriptsResult.scriptCount === 1 ? "" : "s"} exported`
                    : "No scripts retained in this capture"}
                </AlertTitle>
                <AlertDescription className="space-y-2">
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-xs break-all">{scriptsResult.outputDir}</code>
                    <button onClick={() => copy(scriptsResult.outputDir)} className="shrink-0 text-slate-500 hover:text-slate-800">
                      <ClipboardCopy className="w-4 h-4" />
                    </button>
                  </div>
                  {scriptsResult.scriptCount === 0 && (
                    <p className="text-xs">
                      Re-run the capture with &quot;Record network response bodies&quot; checked — script
                      bytes are only exported when the capture retains them.
                    </p>
                  )}
                  {scriptsResult.scripts.length > 0 && (
                    <ul className="text-xs font-mono space-y-1 max-h-40 overflow-auto">
                      {scriptsResult.scripts.map((s, i) => (
                        <li key={i} className="truncate">
                          {s.url} <span className="text-slate-400">({s.bytes} B)</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {scriptsResult.analysis && (
                    <details>
                      <summary className="cursor-pointer text-xs font-semibold">
                        Static analysis — {scriptsResult.analysis.fileCount} files
                      </summary>
                      <ul className="text-xs font-mono space-y-1 mt-2 max-h-40 overflow-auto">
                        {scriptsResult.analysis.files.map((f, i) => (
                          <li key={i} className="truncate">
                            {f.path} <span className="text-slate-400">({f.bytes} B, {f.parseStatus})</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
