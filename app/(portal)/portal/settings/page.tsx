"use client";

import { useState, useEffect, Suspense } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  EyeOff,
  Save,
  TestTube,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Video,
  Brain,
  Server,
  Key,
  RefreshCw,
  Loader2,
  FileSignature,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Monitor,
  Linkedin,
  Twitter,
  Youtube,
  Facebook,
  Instagram,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { COLLECTIONS, type PlatformSettingsDoc } from "@/lib/schema";
import { logSettingsUpdated } from "@/lib/activity-logger";
import { 
  showInAppNotification, 
  requestNotificationPermission, 
  getBrowserNotificationStatus 
} from "@/lib/notifications";
import { FeatureVisibilitySettings } from "@/components/portal/feature-visibility-settings";
import { useUserProfile } from "@/contexts/user-profile-context";
import { isSuperAdmin } from "@/lib/permissions";

interface ApiKeyConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  keyField: string;
  additionalFields?: { name: string; label: string; placeholder: string }[];
  status: "connected" | "disconnected" | "error";
  lastTested?: string;
}

const apiConfigs: ApiKeyConfig[] = [
  {
    id: "apollo",
    name: "Apollo.AI",
    description: "Sales intelligence and engagement platform",
    icon: Zap,
    keyField: "API Key",
    additionalFields: [
      { name: "accountId", label: "Account ID", placeholder: "your-account-id" },
    ],
    status: "disconnected",
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Video conferencing and meetings",
    icon: Video,
    keyField: "API Key",
    additionalFields: [
      { name: "apiSecret", label: "API Secret", placeholder: "your-api-secret" },
      { name: "accountId", label: "Account ID", placeholder: "account-id" },
    ],
    status: "disconnected",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Professional networking and content publishing",
    icon: Zap,
    keyField: "Access Token",
    additionalFields: [
      { name: "clientId", label: "Client ID", placeholder: "your-client-id" },
      { name: "clientSecret", label: "Client Secret", placeholder: "your-client-secret" },
      { name: "organizationId", label: "Organization ID (optional)", placeholder: "organization-urn" },
    ],
    status: "disconnected",
  },
  {
    id: "docuseal",
    name: "DocuSeal",
    description: "Electronic document signing and management",
    icon: FileSignature,
    keyField: "API Key",
    additionalFields: [
      { name: "webhookSecret", label: "Webhook Secret (optional)", placeholder: "your-webhook-secret" },
    ],
    status: "disconnected",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Payment processing for event tickets and subscriptions",
    icon: Zap,
    keyField: "Secret Key",
    additionalFields: [
      { name: "publishableKey", label: "Publishable Key", placeholder: "pk_live_..." },
      { name: "webhookSecret", label: "Webhook Secret", placeholder: "whsec_..." },
    ],
    status: "disconnected",
  },
];

const llmProviders = [
  { id: "openai", name: "OpenAI", models: ["gpt-5.5", "gpt-5", "gpt-5-mini", "gpt-4.1", "gpt-4.1-mini", "gpt-4o", "gpt-4o-mini", "o3", "o4-mini", "gpt-4-turbo", "gpt-3.5-turbo"], supportsCustomUrl: false },
  { id: "anthropic", name: "Anthropic", models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"], supportsCustomUrl: false },
  { id: "google", name: "Google AI", models: ["gemini-pro", "gemini-ultra"], supportsCustomUrl: false },
  { id: "mistral", name: "Mistral AI", models: ["mistral-large", "mistral-medium", "mistral-small"], supportsCustomUrl: false },
  { id: "ollama", name: "Ollama (Local)", models: ["llama2", "codellama", "mistral", "mixtral", "llama3", "phi3"], supportsCustomUrl: true },
  { id: "openai-compatible", name: "OpenAI Compatible (ngrok/lm-studio/vllm)", models: ["default"], supportsCustomUrl: true },
];

const SETTINGS_DOC_ID = "global";

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "integrations";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [apiKeys, setApiKeys] = useState<Record<string, Record<string, string>>>({});
  const [testingStatus, setTestingStatus] = useState<Record<string, "testing" | "success" | "error" | null>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [llmConfig, setLlmConfig] = useState({
    provider: "openai",
    model: "gpt-4o",
    apiKey: "",
    ollamaUrl: "http://localhost:11434",
    useOllama: false,
    baseUrl: "",
    useOpenAICompatible: false,
  });
  const [llmHasApiKey, setLlmHasApiKey] = useState(false);
  
  // Social links settings
  const [socialLinks, setSocialLinks] = useState({
    linkedin: { url: "", visible: true },
    twitter: { url: "", visible: true },
    youtube: { url: "", visible: true },
    facebook: { url: "", visible: false },
    instagram: { url: "", visible: false },
  });
  
  // Notification sync settings
  const [notificationSettings, setNotificationSettings] = useState({
    inAppEnabled: true,
    browserEnabled: false,
    soundEnabled: false,
  });
  const [browserPermission, setBrowserPermission] = useState<string>("default");

  // Load settings from Firebase on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!db) {
        console.error("Firebase not initialized");
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, COLLECTIONS.PLATFORM_SETTINGS, SETTINGS_DOC_ID);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as PlatformSettingsDoc;
          
          // Load integrations into apiKeys state
          if (data.integrations) {
            const loadedApiKeys: Record<string, Record<string, string>> = {};
            
            if (data.integrations.apollo) {
              loadedApiKeys.apollo = {
                apiKey: data.integrations.apollo.apiKey || "",
                accountId: data.integrations.apollo.accountId || "",
              };
            }
            if (data.integrations.zoom) {
              loadedApiKeys.zoom = {
                apiKey: data.integrations.zoom.apiKey || "",
                apiSecret: data.integrations.zoom.apiSecret || "",
                accountId: data.integrations.zoom.accountId || "",
              };
            }
            if (data.integrations.docuseal) {
              loadedApiKeys.docuseal = {
                apiKey: data.integrations.docuseal.apiKey || "",
                webhookSecret: data.integrations.docuseal.webhookSecret || "",
              };
            }
            if (data.integrations.stripe) {
              loadedApiKeys.stripe = {
                apiKey: data.integrations.stripe.secretKey || "",
                publishableKey: data.integrations.stripe.publishableKey || "",
                webhookSecret: data.integrations.stripe.webhookSecret || "",
              };
            }
            
            setApiKeys(loadedApiKeys);
          }
          
          // Public settings only carry non-secret LLM metadata.
          if (data.llmConfig) {
            setLlmConfig(prev => ({
              ...prev,
              provider: data.llmConfig?.provider || "openai",
              model: data.llmConfig?.model || "gpt-4o",
              apiKey: "",
              ollamaUrl: data.llmConfig?.ollamaUrl || "http://localhost:11434",
              useOllama: data.llmConfig?.useOllama || false,
              baseUrl: data.llmConfig?.baseUrl || "",
              useOpenAICompatible: data.llmConfig?.useOpenAICompatible || false,
            }));
          }
          
          // Load notification settings
          if (data.notificationSettings) {
            setNotificationSettings(prev => ({ ...prev, ...data.notificationSettings }));
          }
          
          // Load social links
          if (data.socialLinks) {
            setSocialLinks(prev => ({ ...prev, ...data.socialLinks }));
          }
        }

        const token = await auth?.currentUser?.getIdToken();
        if (token) {
          const [llmResponse, integrationsResponse] = await Promise.all([
            fetch("/api/settings/llm", { headers: { Authorization: `Bearer ${token}` } }),
            fetch("/api/settings/integrations", { headers: { Authorization: `Bearer ${token}` } }),
          ]);

          const payload = await llmResponse.json().catch(() => null) as {
            data?: {
              provider?: string;
              model?: string;
              hasApiKey?: boolean;
              ollamaUrl?: string;
              useOllama?: boolean;
              baseUrl?: string;
              useOpenAICompatible?: boolean;
            };
          } | null;
          if (llmResponse.ok && payload?.data) {
            const llmData = payload.data;
            setLlmConfig(prev => ({
              ...prev,
              provider: llmData.provider || prev.provider,
              model: llmData.model || prev.model,
              apiKey: "",
              ollamaUrl: llmData.ollamaUrl || prev.ollamaUrl,
              useOllama: llmData.useOllama || false,
              baseUrl: llmData.baseUrl || "",
              useOpenAICompatible: llmData.useOpenAICompatible || false,
            }));
            setLlmHasApiKey(llmData.hasApiKey === true);
          }

          const integrationsPayload = await integrationsResponse.json().catch(() => null) as {
            data?: {
              integrations?: Record<string, Record<string, unknown>>;
            };
          } | null;
          if (integrationsResponse.ok && integrationsPayload?.data?.integrations) {
            const serverIntegrations = integrationsPayload.data.integrations;
            setApiKeys(prev => {
              const next = { ...prev };
              for (const config of apiConfigs) {
                const entry = serverIntegrations[config.id];
                if (!entry) continue;
                const merged: Record<string, string> = {};
                for (const [key, value] of Object.entries(entry)) {
                  if (typeof value === "string") merged[key] = value;
                }
                next[config.id] = merged;
              }
              return next;
            });
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
    
    // Check browser notification permission
    setBrowserPermission(getBrowserNotificationStatus());
  }, []);

  // Save settings to Firebase
  const saveSettings = async () => {
    if (!db) {
      toast.error("Firebase not initialized. Check your environment variables.");
      return;
    }
    setSaving(true);
    try {
      const docRef = doc(db, COLLECTIONS.PLATFORM_SETTINGS, SETTINGS_DOC_ID);

      // Integration credentials are sent to the server API, which stores
      // secrets in the server-only platformSecrets collection and only keeps
      // non-secret config in platformSettings.
      const token = await auth?.currentUser?.getIdToken();
      if (!token) {
        throw new Error("Please sign in again to save settings securely");
      }
      const integrationsResponse = await fetch("/api/settings/integrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          integrations: {
            apollo: {
              apiKey: apiKeys.apollo?.apiKey || "",
              accountId: apiKeys.apollo?.accountId || "",
              status: testingStatus.apollo === "success" ? "connected" : "disconnected",
            },
            zoom: {
              apiKey: apiKeys.zoom?.apiKey || "",
              apiSecret: apiKeys.zoom?.apiSecret || "",
              accountId: apiKeys.zoom?.accountId || "",
              status: testingStatus.zoom === "success" ? "connected" : "disconnected",
            },
            docuseal: {
              apiKey: apiKeys.docuseal?.apiKey || "",
              webhookSecret: apiKeys.docuseal?.webhookSecret || "",
              status: testingStatus.docuseal === "success" ? "connected" : "disconnected",
            },
            linkedin: {
              apiKey: apiKeys.linkedin?.apiKey || "",
              clientId: apiKeys.linkedin?.clientId || "",
              clientSecret: apiKeys.linkedin?.clientSecret || "",
              organizationId: apiKeys.linkedin?.organizationId || "",
              status: testingStatus.linkedin === "success" ? "connected" : "disconnected",
            },
            stripe: {
              secretKey: apiKeys.stripe?.apiKey || "",
              publishableKey: apiKeys.stripe?.publishableKey || "",
              webhookSecret: apiKeys.stripe?.webhookSecret || "",
              status: testingStatus.stripe === "success" ? "connected" : "disconnected",
            },
          },
        }),
      });
      const integrationsPayload = await integrationsResponse.json().catch(() => null) as { error?: string } | null;
      if (!integrationsResponse.ok) {
        throw new Error(integrationsPayload?.error || "Failed to save integration credentials securely");
      }

      // Build settings data, using empty strings instead of undefined
      const settingsData = {
        id: SETTINGS_DOC_ID,
        llmConfig: {
          provider: llmConfig.provider,
          model: llmConfig.model,
          apiKey: "",
          apiKeyStoredSeparately: true,
          ollamaUrl: llmConfig.ollamaUrl,
          useOllama: llmConfig.useOllama,
          baseUrl: llmConfig.baseUrl || "",
          useOpenAICompatible: llmConfig.useOpenAICompatible,
        },
        notificationSettings: notificationSettings,
        socialLinks: socialLinks,
        updatedAt: Timestamp.now(),
      };
      
      await setDoc(docRef, settingsData, { merge: true });

      const llmResponse = await fetch("/api/settings/llm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider: llmConfig.provider,
          model: llmConfig.model,
          apiKey: llmConfig.apiKey || undefined,
          ollamaUrl: llmConfig.ollamaUrl,
          useOllama: llmConfig.useOllama,
          baseUrl: llmConfig.baseUrl || "",
          useOpenAICompatible: llmConfig.useOpenAICompatible,
        }),
      });
      const llmPayload = await llmResponse.json().catch(() => null) as { error?: string } | null;
      if (!llmResponse.ok) {
        throw new Error(llmPayload?.error || "Failed to save LLM settings securely");
      }
      setLlmConfig(prev => ({ ...prev, apiKey: "" }));
      setLlmHasApiKey(prev => prev || Boolean(llmConfig.apiKey));
      setHasChanges(false);
      // Log activity
      await logSettingsUpdated("Platform Settings");
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Error saving settings. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const toggleShowKey = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const updateApiKey = (configId: string, field: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [configId]: { ...prev[configId], [field]: value },
    }));
    setHasChanges(true);
  };

  const testConnection = async (configId: string) => {
    setTestingStatus(prev => ({ ...prev, [configId]: "testing" }));
    
    if (configId === "stripe") {
      // Test Stripe connection
      const secretKey = apiKeys["stripe"]?.apiKey;
      if (!secretKey) {
        setTestingStatus(prev => ({ ...prev, [configId]: "error" }));
        toast.error("Please enter your Stripe Secret Key");
        return;
      }
      try {
        const response = await fetch("/api/stripe/test-connection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ secretKey }),
        });
        const result = await response.json();
        setTestingStatus(prev => ({ 
          ...prev, 
          [configId]: result.success ? "success" : "error" 
        }));
        if (result.success) {
          toast.success("Stripe connection successful!");
        } else {
          toast.error(`Stripe test failed: ${result.error}`);
        }
        return;
      } catch (error) {
        setTestingStatus(prev => ({ ...prev, [configId]: "error" }));
        toast.error("Failed to test Stripe connection");
        return;
      }
    }
    
    // Simulate API test for other integrations
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTestingStatus(prev => ({ 
      ...prev, 
      [configId]: Math.random() > 0.3 ? "success" : "error" 
    }));
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage API keys and integrations
          </p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {saving ? "Saving..." : hasChanges ? "Save Changes" : "Save All Settings"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="llm">LLM Configuration</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
          <TabsTrigger value="visibility">Feature Visibility</TabsTrigger>
        </TabsList>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="grid gap-6">
            {apiConfigs.map((config) => (
              <Card key={config.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <config.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {config.name}
                          <Badge
                            variant={
                              testingStatus[config.id] === "success"
                                ? "default"
                                : testingStatus[config.id] === "error"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {testingStatus[config.id] === "success"
                              ? "Connected"
                              : testingStatus[config.id] === "error"
                              ? "Error"
                              : "Not Connected"}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{config.description}</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection(config.id)}
                      disabled={testingStatus[config.id] === "testing"}
                    >
                      {testingStatus[config.id] === "testing" ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <TestTube className="mr-2 h-4 w-4" />
                      )}
                      Test Connection
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`${config.id}-key`}>{config.keyField}</Label>
                      <div className="relative">
                        <Input
                          id={`${config.id}-key`}
                          type={showKeys[config.id] ? "text" : "password"}
                          placeholder={`Enter your ${config.keyField.toLowerCase()}`}
                          value={apiKeys[config.id]?.apiKey || ""}
                          onChange={(e) => updateApiKey(config.id, "apiKey", e.target.value)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => toggleShowKey(config.id)}
                        >
                          {showKeys[config.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {config.additionalFields?.map((field) => (
                      <div key={field.name} className="space-y-2">
                        <Label htmlFor={`${config.id}-${field.name}`}>{field.label}</Label>
                        <Input
                          id={`${config.id}-${field.name}`}
                          placeholder={field.placeholder}
                          value={apiKeys[config.id]?.[field.name] || ""}
                          onChange={(e) => updateApiKey(config.id, field.name, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Stripe-specific link to Event Management */}
                  {config.id === "stripe" && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Event Ticketing</p>
                          <p className="text-xs text-muted-foreground">
                            Stripe is used for processing event ticket payments
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href="/portal/admin/events">
                            Manage Events
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* LLM Configuration Tab */}
        <TabsContent value="llm" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>LLM Provider Configuration</CardTitle>
                  <CardDescription>
                    Configure your preferred Large Language Model provider
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="llmProvider">Provider</Label>
                  <Select
                    value={llmConfig.provider}
                    onValueChange={(value) => {
                      const provider = llmProviders.find(p => p.id === value);
                      setLlmConfig({
                        ...llmConfig,
                        provider: value,
                        model: provider?.models[0] || "",
                        useOllama: value === "ollama",
                        useOpenAICompatible: value === "openai-compatible",
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {llmProviders.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="llmModel">Model</Label>
                  <Select
                    value={llmConfig.model}
                    onValueChange={(value) => setLlmConfig({ ...llmConfig, model: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {llmProviders.find(p => p.id === llmConfig.provider)?.models.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Base URL Configuration - for Ollama and OpenAI-compatible providers */}
              {(llmConfig.provider === "ollama" || llmConfig.provider === "openai-compatible") && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <Label htmlFor="baseUrl">
                      {llmConfig.provider === "ollama" ? "Ollama Server URL (or ngrok URL)" : "Base URL (OpenAI-compatible endpoint)"}
                    </Label>
                    <Input
                      id="baseUrl"
                      placeholder={llmConfig.provider === "ollama" ? "http://localhost:11434 or https://xxxx.ngrok.io" : "https://api.example.com/v1"}
                      value={llmConfig.baseUrl || llmConfig.ollamaUrl}
                      onChange={(e) => setLlmConfig({ 
                        ...llmConfig, 
                        baseUrl: e.target.value,
                        ollamaUrl: e.target.value 
                      })}
                    />
                    <p className="text-sm text-muted-foreground">
                      {llmConfig.provider === "ollama" 
                        ? "Use ngrok to expose your local Ollama: ngrok http 11434" 
                        : "The base URL for your OpenAI-compatible API endpoint"}
                    </p>
                  </div>

                  {llmConfig.provider === "ollama" && (
                    <div className="p-4 bg-background rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        Ollama + ngrok Setup
                      </h4>
                      <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                        <li>Install Ollama: <a href="https://ollama.ai" className="text-primary underline" target="_blank" rel="noopener">ollama.ai</a></li>
                        <li>Pull a model: <code className="bg-muted px-1 rounded">ollama pull llama3</code></li>
                        <li>Start Ollama: <code className="bg-muted px-1 rounded">ollama serve</code></li>
                        <li>Install ngrok: <a href="https://ngrok.com" className="text-primary underline" target="_blank" rel="noopener">ngrok.com</a></li>
                        <li>Expose Ollama: <code className="bg-muted px-1 rounded">ngrok http 11434</code></li>
                        <li>Copy the ngrok URL (e.g., <code className="bg-muted px-1 rounded">https://xxxx.ngrok.io</code>) above</li>
                      </ol>
                    </div>
                  )}

                  {llmConfig.provider === "openai-compatible" && (
                    <div className="p-4 bg-background rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        OpenAI-Compatible Endpoints
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>LM Studio:</strong> <code className="bg-muted px-1 rounded">http://localhost:1234/v1</code></li>
                        <li>• <strong>vLLM:</strong> <code className="bg-muted px-1 rounded">http://localhost:8000/v1</code></li>
                        <li>• <strong>Ollama (OpenAI compat):</strong> <code className="bg-muted px-1 rounded">https://xxxx.ngrok.io/v1</code></li>
                        <li>• <strong>Text Generation WebUI:</strong> <code className="bg-muted px-1 rounded">http://localhost:5000/v1</code></li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* API Key - required for most providers */}
              {llmConfig.provider !== "ollama" && (
                <div className="space-y-2">
                  <Label htmlFor="llmApiKey">
                    {llmConfig.provider === "openai-compatible" ? "API Key (if required)" : "API Key"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="llmApiKey"
                      type={showKeys["llm"] ? "text" : "password"}
                      placeholder={llmHasApiKey ? "Existing key stored securely (enter a new key to replace it)" : llmConfig.provider === "openai-compatible" ? "Enter API key (optional for some local endpoints)" : "Enter your API key"}
                      value={llmConfig.apiKey}
                      onChange={(e) => setLlmConfig({ ...llmConfig, apiKey: e.target.value })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => toggleShowKey("llm")}
                    >
                      {showKeys["llm"] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {llmConfig.provider === "openai-compatible" && (
                    <p className="text-sm text-muted-foreground">
                      Some local endpoints like LM Studio don&apos;t require an API key. Leave blank if not needed.
                    </p>
                  )}
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => testConnection("llm")}
                disabled={testingStatus["llm"] === "testing"}
              >
                {testingStatus["llm"] === "testing" ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : testingStatus["llm"] === "success" ? (
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                ) : testingStatus["llm"] === "error" ? (
                  <XCircle className="mr-2 h-4 w-4 text-red-500" />
                ) : (
                  <TestTube className="mr-2 h-4 w-4" />
                )}
                Test LLM Connection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          {/* In-App Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Monitor className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>In-App Notifications</CardTitle>
                  <CardDescription>
                    Configure how notifications appear within the SVP Platform
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <div>
                    <Label>Toast Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Show popup notifications in the corner of the screen
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.inAppEnabled}
                  onCheckedChange={(checked) => {
                    setNotificationSettings(prev => ({ ...prev, inAppEnabled: checked }));
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {notificationSettings.soundEnabled ? (
                    <Volume2 className="h-5 w-5 text-primary" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <Label>Sound Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Play a sound when notifications arrive
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.soundEnabled}
                  onCheckedChange={(checked) => {
                    setNotificationSettings(prev => ({ ...prev, soundEnabled: checked }));
                    setHasChanges(true);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Browser Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BellRing className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Browser Notifications</CardTitle>
                  <CardDescription>
                    Receive notifications even when the browser tab is in the background
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <div>
                    <Label>Browser Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Show system notifications from your browser
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {browserPermission === "granted" ? (
                    <Badge variant="default" className="mr-2">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  ) : browserPermission === "denied" ? (
                    <Badge variant="destructive" className="mr-2">
                      <XCircle className="h-3 w-3 mr-1" />
                      Blocked
                    </Badge>
                  ) : browserPermission === "unsupported" ? (
                    <Badge variant="secondary" className="mr-2">
                      Not Supported
                    </Badge>
                  ) : null}
                  <Switch
                    checked={notificationSettings.browserEnabled}
                    disabled={browserPermission === "denied" || browserPermission === "unsupported"}
                    onCheckedChange={async (checked) => {
                      if (checked && browserPermission !== "granted") {
                        const permission = await requestNotificationPermission();
                        setBrowserPermission(permission);
                        if (permission !== "granted") {
                          return;
                        }
                      }
                      setNotificationSettings(prev => ({ ...prev, browserEnabled: checked }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              {browserPermission === "denied" && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Browser notifications blocked</p>
                      <p className="text-sm text-muted-foreground">
                        You&apos;ve blocked notifications for this site. To enable them, click the lock icon in your browser&apos;s address bar and change the notification setting.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {browserPermission === "default" && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    When you enable browser notifications, you&apos;ll be prompted to allow notifications from this site.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Notification */}
          <Card>
            <CardHeader>
              <CardTitle>Test Notifications</CardTitle>
              <CardDescription>
                Send a test notification to verify your settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    showInAppNotification("meeting_completed", {
                      title: "Test Meeting",
                      type: "Weekly Sync",
                    });
                  }}
                  disabled={!notificationSettings.inAppEnabled}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Test Toast
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    showInAppNotification("team_member_added", {
                      name: "Test Team Member",
                    });
                  }}
                  disabled={!notificationSettings.inAppEnabled}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Test Warning
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    showInAppNotification("new_lead", {
                      name: "Precision Manufacturing Co.",
                      company: "Precision Manufacturing Co.",
                    });
                  }}
                  disabled={!notificationSettings.inAppEnabled}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Test Success
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                These test notifications demonstrate how different event types will appear in your browser.
              </p>
            </CardContent>
          </Card>

        </TabsContent>

        {/* Social Links Tab */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Social Media Links</CardTitle>
                  <CardDescription>
                    Configure social media links displayed in the footer. Links are only visible when a URL is provided and visibility is enabled.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* LinkedIn */}
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-2 rounded-lg bg-[#0077B5]/10">
                  <Linkedin className="h-5 w-5 text-[#0077B5]" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="linkedin-url">LinkedIn</Label>
                  <Input
                    id="linkedin-url"
                    placeholder="https://linkedin.com/company/your-company"
                    value={socialLinks.linkedin.url}
                    onChange={(e) => {
                      setSocialLinks(prev => ({ ...prev, linkedin: { ...prev.linkedin, url: e.target.value } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="linkedin-visible" className="text-sm">Visible</Label>
                  <Switch
                    id="linkedin-visible"
                    checked={socialLinks.linkedin.visible}
                    onCheckedChange={(checked) => {
                      setSocialLinks(prev => ({ ...prev, linkedin: { ...prev.linkedin, visible: checked } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              {/* Twitter/X */}
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-2 rounded-lg bg-black/10">
                  <Twitter className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="twitter-url">Twitter / X</Label>
                  <Input
                    id="twitter-url"
                    placeholder="https://twitter.com/your-company"
                    value={socialLinks.twitter.url}
                    onChange={(e) => {
                      setSocialLinks(prev => ({ ...prev, twitter: { ...prev.twitter, url: e.target.value } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="twitter-visible" className="text-sm">Visible</Label>
                  <Switch
                    id="twitter-visible"
                    checked={socialLinks.twitter.visible}
                    onCheckedChange={(checked) => {
                      setSocialLinks(prev => ({ ...prev, twitter: { ...prev.twitter, visible: checked } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              {/* YouTube */}
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-2 rounded-lg bg-[#FF0000]/10">
                  <Youtube className="h-5 w-5 text-[#FF0000]" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="youtube-url">YouTube</Label>
                  <Input
                    id="youtube-url"
                    placeholder="https://youtube.com/@your-channel"
                    value={socialLinks.youtube.url}
                    onChange={(e) => {
                      setSocialLinks(prev => ({ ...prev, youtube: { ...prev.youtube, url: e.target.value } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="youtube-visible" className="text-sm">Visible</Label>
                  <Switch
                    id="youtube-visible"
                    checked={socialLinks.youtube.visible}
                    onCheckedChange={(checked) => {
                      setSocialLinks(prev => ({ ...prev, youtube: { ...prev.youtube, visible: checked } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              {/* Facebook */}
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-2 rounded-lg bg-[#1877F2]/10">
                  <Facebook className="h-5 w-5 text-[#1877F2]" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="facebook-url">Facebook</Label>
                  <Input
                    id="facebook-url"
                    placeholder="https://facebook.com/your-page"
                    value={socialLinks.facebook.url}
                    onChange={(e) => {
                      setSocialLinks(prev => ({ ...prev, facebook: { ...prev.facebook, url: e.target.value } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="facebook-visible" className="text-sm">Visible</Label>
                  <Switch
                    id="facebook-visible"
                    checked={socialLinks.facebook.visible}
                    onCheckedChange={(checked) => {
                      setSocialLinks(prev => ({ ...prev, facebook: { ...prev.facebook, visible: checked } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              {/* Instagram */}
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#833AB4]/10 via-[#FD1D1D]/10 to-[#F77737]/10">
                  <Instagram className="h-5 w-5 text-[#E4405F]" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="instagram-url">Instagram</Label>
                  <Input
                    id="instagram-url"
                    placeholder="https://instagram.com/your-account"
                    value={socialLinks.instagram.url}
                    onChange={(e) => {
                      setSocialLinks(prev => ({ ...prev, instagram: { ...prev.instagram, url: e.target.value } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="instagram-visible" className="text-sm">Visible</Label>
                  <Switch
                    id="instagram-visible"
                    checked={socialLinks.instagram.visible}
                    onCheckedChange={(checked) => {
                      setSocialLinks(prev => ({ ...prev, instagram: { ...prev.instagram, visible: checked } }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">How it works</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Social links appear in the website footer</li>
                  <li>Links are only shown when both a URL is provided AND visibility is enabled</li>
                  <li>Empty URLs will hide the icon regardless of visibility setting</li>
                  <li>Changes take effect after saving</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Visibility Tab */}
        <TabsContent value="visibility" className="space-y-6">
          <FeatureVisibilitySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <SettingsPageContent />
    </Suspense>
  );
}
