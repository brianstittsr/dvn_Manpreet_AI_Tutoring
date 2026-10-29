/**
 * Shared LLM runtime for AI-guided learning features (GPT lessons, student
 * interviews). Resolves the configured provider (OpenAI / Ollama /
 * OpenAI-compatible) and executes structured-JSON chat calls with graceful
 * degradation when no provider is available.
 */

import OpenAI from "openai";
import { z } from "zod";
import { createOpenAIClient, getLLMConfig } from "./openai-config";

export interface LLMRuntime {
  client: OpenAI | null;
  provider: string | null;
  model: string | null;
  providerDegraded: boolean;
}

export interface StructuredJsonResult<T> {
  data: T | null;
  provider: string | null;
  model: string | null;
  providerDegraded: boolean;
}

export async function getLLMRuntime(): Promise<LLMRuntime> {
  const config = await getLLMConfig();
  if (!config) {
    return { client: null, provider: null, model: null, providerDegraded: true };
  }

  const provider = config.provider || "openai";
  if (!["openai", "ollama", "openai-compatible"].includes(provider)) {
    return { client: null, provider, model: null, providerDegraded: true };
  }

  const client = await createOpenAIClient();
  if (!client) {
    return { client: null, provider, model: null, providerDegraded: true };
  }

  let model = config.model || "gpt-4o";
  if (provider === "ollama" && model === "gpt-4o") {
    model = "llama3";
  }

  if (provider === "openai-compatible" && model === "gpt-4o") {
    try {
      const models = await client.models.list();
      model = models.data[0]?.id || "";
    } catch (error) {
      console.error("Unable to detect OpenAI-compatible models:", error);
      model = "";
    }
  }

  return {
    client,
    provider,
    model: model || null,
    providerDegraded: !model,
  };
}

function parseJsonObject(raw: string): unknown {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response did not contain a JSON object");
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function callStructuredJson<T>(
  schema: z.ZodType<T>,
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1200
): Promise<StructuredJsonResult<T>> {
  const runtime = await getLLMRuntime();
  if (!runtime.client || !runtime.model) {
    return {
      data: null,
      provider: runtime.provider,
      model: runtime.model,
      providerDegraded: true,
    };
  }

  try {
    const completion = await runtime.client.chat.completions.create({
      model: runtime.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: maxTokens,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty model response");

    return {
      data: schema.parse(parseJsonObject(content)),
      provider: runtime.provider,
      model: runtime.model,
      providerDegraded: false,
    };
  } catch (error) {
    console.error("Structured LLM call failed:", error);
    return {
      data: null,
      provider: runtime.provider,
      model: runtime.model,
      providerDegraded: true,
    };
  }
}
