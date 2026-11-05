"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Landmark,
  Loader2,
  Search,
  Sparkles,
  ExternalLink,
  Bookmark,
  Trash2,
  KeyRound,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { authedJsonHeaders } from "@/lib/api-client";

// ---------- types (tolerant: GrantedAI fields are normalized loosely) ----------

interface GrantItem {
  id: string;
  name: string;
  funder?: string;
  amount?: string;
  deadline?: string;
  status?: string;
  summary?: string;
  url?: string;
  fitScore?: number;
}

interface FoundationItem {
  id: string;
  name: string;
  location?: string;
  focusAreas?: string;
  totalGiving?: string;
  url?: string;
}

interface SavedItem {
  id: string;
  externalId: string;
  name: string;
  funder?: string;
  amount?: string;
  deadline?: string;
  url?: string;
  notes?: string;
  source: string;
}

interface SearchMeta {
  total?: number;
  next_cursor?: string | null;
  ai_searches_used?: number;
  ai_searches_limit?: number;
}

type TabKey = "grants" | "foundations" | "discover" | "saved";

// ---------- normalization helpers ----------

function asString(value: unknown): string | undefined {
  if (typeof value === "string" && value.length > 0) return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asArray(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is Record<string, unknown> => asRecord(v) !== null);
  }
  const rec = asRecord(value);
  if (!rec) return [];
  for (const key of ["grants", "foundations", "results", "items", "opportunities"]) {
    const inner = rec[key];
    if (Array.isArray(inner)) {
      return inner.filter((v): v is Record<string, unknown> => asRecord(v) !== null);
    }
  }
  return [];
}

function fmtAmount(min: unknown, max: unknown, single: unknown): string | undefined {
  const one = asString(single);
  if (one) return one.startsWith("$") ? one : `$${one}`;
  const lo = asString(min);
  const hi = asString(max);
  if (lo && hi) return `$${lo} – $${hi}`;
  if (lo) return `$${lo}+`;
  if (hi) return `up to $${hi}`;
  return undefined;
}

function toGrant(rec: Record<string, unknown>): GrantItem {
  const funder = asRecord(rec.funder) || asRecord(rec.foundation);
  const score =
    typeof rec.fit_score === "number" ? rec.fit_score
    : typeof rec.fitScore === "number" ? rec.fitScore
    : typeof rec.score === "number" ? rec.score
    : undefined;
  return {
    id: asString(rec.id) || asString(rec.grant_id) || crypto.randomUUID(),
    name: asString(rec.name) || asString(rec.title) || "Untitled opportunity",
    funder: asString(rec.funder_name) || asString(funder?.name) || asString(rec.funder),
    amount: fmtAmount(rec.amount_min, rec.amount_max, rec.amount),
    deadline: asString(rec.deadline) || asString(rec.due_date) || asString(rec.close_date),
    status: asString(rec.status),
    summary: asString(rec.summary) || asString(rec.description),
    url: asString(rec.url) || asString(rec.link),
    fitScore: score,
  };
}

function toFoundation(rec: Record<string, unknown>): FoundationItem {
  const focus = Array.isArray(rec.focus_areas)
    ? (rec.focus_areas.filter((f) => typeof f === "string") as string[]).join(", ")
    : asString(rec.focus_areas);
  return {
    id: asString(rec.id) || asString(rec.ein) || crypto.randomUUID(),
    name: asString(rec.name) || "Unnamed foundation",
    location: [asString(rec.city), asString(rec.state)].filter(Boolean).join(", ") || undefined,
    focusAreas: focus,
    totalGiving: fmtAmount(undefined, undefined, rec.total_giving),
    url: asString(rec.website) || asString(rec.url),
  };
}

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
] as const;

// ---------- page ----------

export default function GrantResearchPage() {
  const [keyConfigured, setKeyConfigured] = useState<boolean | null>(null);
  const [envKey, setEnvKey] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [savingKey, setSavingKey] = useState(false);

  const [tab, setTab] = useState<TabKey>("grants");
  const [query, setQuery] = useState("");
  const [state, setState] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [grants, setGrants] = useState<GrantItem[]>([]);
  const [foundations, setFoundations] = useState<FoundationItem[]>([]);
  const [meta, setMeta] = useState<SearchMeta>({});
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  const apiFetch = useCallback(
    async (path: string, init?: RequestInit): Promise<{ data?: unknown; meta?: SearchMeta; error?: string }> => {
      const headers = await authedJsonHeaders();
      const res = await fetch(path, {
        ...init,
        headers: { ...headers, ...(init?.headers as Record<string, string> | undefined) },
      });
      return (await res.json().catch(() => ({}))) as { data?: unknown; meta?: SearchMeta; error?: string };
    },
    []
  );

  // ---- config ----
  const loadConfig = useCallback(async () => {
    const res = await apiFetch("/api/grantedai/config");
    const data = asRecord(res.data);
    setKeyConfigured(Boolean(data?.configured));
    setEnvKey(Boolean(data?.envKeyConfigured));
  }, [apiFetch]);

  const saveKey = async () => {
    if (!keyInput.trim()) return;
    setSavingKey(true);
    try {
      const res = await apiFetch("/api/settings/integrations", {
        method: "POST",
        body: JSON.stringify({ integrations: { grantedai: { apiKey: keyInput.trim() } } }),
      });
      if (res.error) throw new Error(res.error);
      toast.success("GrantedAI API key saved");
      setKeyInput("");
      await loadConfig();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save key");
    } finally {
      setSavingKey(false);
    }
  };

  // ---- saved ----
  const loadSaved = useCallback(async () => {
    const res = await apiFetch("/api/grantedai/saved");
    const items = Array.isArray(res.data)
      ? res.data.filter((v): v is SavedItem => asRecord(v) !== null)
      : [];
    setSaved(items.map((s) => ({ ...s })));
  }, [apiFetch]);

  useEffect(() => {
    loadConfig();
    loadSaved();
  }, [loadConfig, loadSaved]);

  // ---- search ----
  const runSearch = useCallback(
    async (nextOffset: number) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (state !== "all") params.set("state", state);
        params.set("limit", String(limit));
        params.set("offset", String(nextOffset));

        const endpoint =
          tab === "grants" ? "/api/grantedai/grants"
          : tab === "foundations" ? "/api/grantedai/foundations"
          : "/api/grantedai/discover";
        const res = await apiFetch(`${endpoint}?${params.toString()}`);
        if (res.error) throw new Error(res.error);

        if (tab === "foundations") {
          setFoundations(asArray(res.data).map(toFoundation));
          setGrants([]);
        } else {
          setGrants(asArray(res.data).map(toGrant));
          setFoundations([]);
        }
        setMeta(res.meta ?? {});
        setOffset(nextOffset);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Search failed";
        setError(message);
        setGrants([]);
        setFoundations([]);
      } finally {
        setLoading(false);
      }
    },
    [apiFetch, query, state, tab]
  );

  const saveGrant = async (g: GrantItem | FoundationItem, source: SavedItem["source"]) => {
    setSavingId(g.id);
    try {
      const grantLike = g as GrantItem;
      const res = await apiFetch("/api/grantedai/saved", {
        method: "POST",
        body: JSON.stringify({
          externalId: g.id,
          name: g.name,
          funder: grantLike.funder,
          amount: grantLike.amount,
          deadline: grantLike.deadline,
          summary: grantLike.summary,
          url: g.url,
          fitScore: grantLike.fitScore,
          source,
        }),
      });
      if (res.error) throw new Error(res.error);
      toast.success("Saved to your list");
      await loadSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSavingId(null);
    }
  };

  const removeSaved = async (id: string) => {
    try {
      const res = await apiFetch("/api/grantedai/saved", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      if (res.error) throw new Error(res.error);
      setSaved((prev) => prev.filter((s) => s.id !== id));
      toast.success("Removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not remove");
    }
  };

  const isSaved = (externalId: string, source: string) =>
    saved.some((s) => s.externalId === externalId && s.source === source);

  // ---------- render ----------

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Grant Research</h1>
        <p className="text-muted-foreground">
          Search grants and funders via the GrantedAI Data API.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4" /> API Connection
          </CardTitle>
          <CardDescription>
            Key is stored server-side only and never sent to browsers.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="grantedai-key">
              {keyConfigured ? "Replace GrantedAI API key" : "GrantedAI API key"}
            </Label>
            <Input
              id="grantedai-key"
              type="password"
              placeholder="ga_live_..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
            />
          </div>
          <Button onClick={saveKey} disabled={savingKey || !keyInput.trim()}>
            {savingKey ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save key
          </Button>
          <Badge variant={keyConfigured ? "default" : "secondary"}>
            {keyConfigured === null ? "Checking…" : keyConfigured ? `Connected${envKey ? " (env)" : ""}` : "Not configured"}
          </Badge>
        </CardContent>
      </Card>

      {keyConfigured === false && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>API key required</AlertTitle>
          <AlertDescription>
            Paste a GrantedAI API key above (or set <code>GRANTEDAI_API_KEY</code> on the
            server) to enable grant search.
          </AlertDescription>
        </Alert>
      )}

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as TabKey);
          setError(null);
          setOffset(0);
        }}
      >
        <TabsList>
          <TabsTrigger value="grants">
            <Landmark className="mr-2 h-4 w-4" /> Grants
          </TabsTrigger>
          <TabsTrigger value="foundations">Foundations</TabsTrigger>
          <TabsTrigger value="discover">
            <Sparkles className="mr-2 h-4 w-4" /> AI Discover
          </TabsTrigger>
          <TabsTrigger value="saved">
            <Bookmark className="mr-2 h-4 w-4" /> Saved ({saved.length})
          </TabsTrigger>
        </TabsList>

        {tab !== "saved" && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="grant-q">
                {tab === "discover"
                  ? "Describe who you're seeking funding for"
                  : "Search query"}
              </Label>
              <Input
                id="grant-q"
                placeholder={
                  tab === "discover"
                    ? "e.g. STEM education programs for underserved youth"
                    : "e.g. youth education, literacy, STEM"
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch(0)}
              />
            </div>
            <div className="w-full space-y-1.5 sm:w-40">
              <Label>State</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger>
                  <SelectValue placeholder="All states" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All states</SelectItem>
                  {US_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => runSearch(0)} disabled={loading || !keyConfigured}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : tab === "discover" ? (
                <Sparkles className="mr-2 h-4 w-4" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              {tab === "discover" ? "Discover" : "Search"}
            </Button>
          </div>
        )}

        <TabsContent value="grants" className="mt-4">
          <ResultsSection
            loading={loading}
            error={error}
            meta={meta}
            emptyHint="Run a search to find grant opportunities."
          >
            {grants.map((g) => (
              <GrantCard
                key={g.id}
                grant={g}
                saved={isSaved(g.id, "grant")}
                saving={savingId === g.id}
                onSave={() => saveGrant(g, "grant")}
              />
            ))}
          </ResultsSection>
        </TabsContent>

        <TabsContent value="foundations" className="mt-4">
          <ResultsSection
            loading={loading}
            error={error}
            meta={meta}
            emptyHint="Run a search to find foundations and funders."
          >
            {foundations.map((f) => (
              <Card key={f.id}>
                <CardContent className="flex items-start justify-between gap-4 pt-4">
                  <div className="space-y-1">
                    <p className="font-medium">{f.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {[f.location, f.focusAreas, f.totalGiving ? `${f.totalGiving} giving` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {f.url && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={f.url} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isSaved(f.id, "foundation") || savingId === f.id}
                      onClick={() => saveGrant(f, "foundation")}
                    >
                      {savingId === f.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Bookmark className="mr-2 h-4 w-4" />
                      )}
                      {isSaved(f.id, "foundation") ? "Saved" : "Save"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ResultsSection>
        </TabsContent>

        <TabsContent value="discover" className="mt-4">
          {meta.ai_searches_limit !== undefined && (
            <p className="mb-3 text-xs text-muted-foreground">
              AI searches used this period: {meta.ai_searches_used ?? 0}/{meta.ai_searches_limit}
            </p>
          )}
          <ResultsSection
            loading={loading}
            error={error}
            meta={meta}
            emptyHint="Describe your organization or program and let GrantedAI find matching funders."
          >
            {grants.map((g) => (
              <GrantCard
                key={g.id}
                grant={g}
                saved={isSaved(g.id, "discover")}
                saving={savingId === g.id}
                onSave={() => saveGrant(g, "discover")}
              />
            ))}
          </ResultsSection>
        </TabsContent>

        <TabsContent value="saved" className="mt-4">
          <div className="space-y-3">
            {saved.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nothing saved yet — bookmark grants or funders from search results.
              </p>
            )}
            {saved.map((s) => (
              <Card key={s.id}>
                <CardContent className="flex items-start justify-between gap-4 pt-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{s.name}</p>
                      <Badge variant="outline">{s.source}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {[s.funder, s.amount, s.deadline ? `Due ${s.deadline}` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {s.url && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={s.url} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => removeSaved(s.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {saved.length > 0 && (
              <Button variant="outline" size="sm" onClick={loadSaved}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {tab !== "saved" && grants.length + foundations.length > 0 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={offset === 0 || loading}
            onClick={() => runSearch(Math.max(0, offset - limit))}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Showing {offset + 1}–{offset + grants.length + foundations.length}
            {typeof meta.total === "number" ? ` of ${meta.total}` : ""}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={loading || grants.length + foundations.length < limit}
            onClick={() => runSearch(offset + limit)}
          >
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------- subcomponents ----------

function ResultsSection({
  loading,
  error,
  meta,
  emptyHint,
  children,
}: {
  loading: boolean;
  error: string | null;
  meta: SearchMeta;
  emptyHint: string;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Searching GrantedAI…
      </div>
    );
  }
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Search failed</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  const isEmpty = !children || (Array.isArray(children) && children.length === 0);
  return (
    <div className="space-y-3">
      {isEmpty ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{emptyHint}</p>
      ) : (
        children
      )}
      {typeof meta.total === "number" && meta.total === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">No results matched.</p>
      )}
    </div>
  );
}

function GrantCard({
  grant,
  saved,
  saving,
  onSave,
}: {
  grant: GrantItem;
  saved: boolean;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 pt-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{grant.name}</p>
            {typeof grant.fitScore === "number" && (
              <Badge variant="secondary">Fit {Math.round(grant.fitScore)}</Badge>
            )}
            {grant.status && <Badge variant="outline">{grant.status}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">
            {[grant.funder, grant.amount, grant.deadline ? `Due ${grant.deadline}` : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {grant.summary && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{grant.summary}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          {grant.url && (
            <Button variant="ghost" size="icon" asChild>
              <a href={grant.url} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" disabled={saved || saving} onClick={onSave}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bookmark className="mr-2 h-4 w-4" />
            )}
            {saved ? "Saved" : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
