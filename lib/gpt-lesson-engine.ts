import OpenAI from "openai";
import { z } from "zod";
import { createOpenAIClient, getLLMConfig } from "./openai-config";
import {
  buildAssessmentPrompt,
  buildHintPrompt,
  buildRubricPrompt,
  buildStagePrompt,
  buildTutorSystemPrompt,
} from "./gpt-lesson-prompts";
import type { GPTLessonConfig, GPTLessonStage } from "@/types/academy";
import {
  GPT_LEARNING_DIMENSIONS,
  type GPTDimensionScore,
  type GPTLearningDimension,
  type GPTQuizItem,
  type GPTSafetyResult,
} from "./gpt-lesson-types";
import { coerceModelSafety } from "./gpt-lesson-safety";

const dimensionEvidenceSchema = z.object({
  independentProblemSolving: z.string().optional().default(""),
  reasoningExplanation: z.string().optional().default(""),
  aiVerification: z.string().optional().default(""),
  learningReflection: z.string().optional().default(""),
  transferToNewSituations: z.string().optional().default(""),
});

const safetySchema = z.object({
  severity: z.enum(["none", "low", "medium", "high"]).optional().default("none"),
  category: z.string().nullable().optional().default(null),
});

const stageResponseSchema = z.object({
  assistantMessage: z.string().min(1),
  readyToAdvance: z.boolean().optional().default(false),
  hint: z.string().nullable().optional().default(null),
  followUpQuestion: z.string().nullable().optional().default(null),
  evidence: dimensionEvidenceSchema.optional().default({
    independentProblemSolving: "",
    reasoningExplanation: "",
    aiVerification: "",
    learningReflection: "",
    transferToNewSituations: "",
  }),
  safety: safetySchema.optional().default({ severity: "none", category: null }),
});

const hintResponseSchema = z.object({
  hint: z.string().min(1),
  assistantMessage: z.string().optional().default(""),
  safety: safetySchema.optional().default({ severity: "none", category: null }),
});

const quizItemSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  correctOptionIndex: z.number().int().min(0).max(3),
  explanation: z.string().nullable().optional().default(null),
});

const assessmentSchema = z.object({
  transferPrompt: z.string().min(1),
  quizItems: z.array(quizItemSchema).length(3),
});

const dimensionScoreSchema = z.object({
  score: z.number().int().min(0).max(4).nullable(),
  evidence: z.string().optional().default(""),
});

const rubricSchema = z.object({
  dimensionScores: z.object({
    independentProblemSolving: dimensionScoreSchema,
    reasoningExplanation: dimensionScoreSchema,
    aiVerification: dimensionScoreSchema,
    learningReflection: dimensionScoreSchema,
    transferToNewSituations: dimensionScoreSchema,
  }),
  summary: z.string().optional().default(""),
  safety: safetySchema.optional().default({ severity: "none", category: null }),
});

export type GPTStageAIResult = z.infer<typeof stageResponseSchema> & {
  provider: string | null;
  model: string | null;
  providerDegraded: boolean;
  safetyResult: GPTSafetyResult;
};

export type GPTHintAIResult = z.infer<typeof hintResponseSchema> & {
  provider: string | null;
  model: string | null;
  providerDegraded: boolean;
  safetyResult: GPTSafetyResult;
};

export interface GPTAssessmentContent {
  transferPrompt: string;
  quizItems: GPTQuizItem[];
  provider: string | null;
  model: string | null;
  providerDegraded: boolean;
}

export interface GPTAssessmentScoreResult {
  quizScorePercentage: number;
  dimensionScores: Record<GPTLearningDimension, GPTDimensionScore>;
  compositeScorePercentage: number | null;
  summary: string;
  provider: string | null;
  model: string | null;
  providerDegraded: boolean;
  safetyResult: GPTSafetyResult;
}

interface LLMRuntime {
  client: OpenAI | null;
  provider: string | null;
  model: string | null;
  providerDegraded: boolean;
}

async function getLLMRuntime(): Promise<LLMRuntime> {
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

async function callStructuredJson<T>(
  schema: z.ZodType<T>,
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1200
): Promise<{ data: T | null; provider: string | null; model: string | null; providerDegraded: boolean }> {
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
    console.error("GPT lesson structured LLM call failed:", error);
    return {
      data: null,
      provider: runtime.provider,
      model: runtime.model,
      providerDegraded: true,
    };
  }
}

function fallbackStageMessage(config: GPTLessonConfig, stage: GPTLessonStage): string {
  switch (stage) {
    case "notice":
      return `What do you already notice or know about ${config.topicArea}?`;
    case "try":
      return `Try to explain or solve one example related to ${config.topicArea} before asking for help.`;
    case "challenge":
      return `Now apply ${config.topicArea} to a slightly new situation. What would you try first, and why?`;
    case "verify":
      return "Check your reasoning. What evidence shows that your answer makes sense?";
    case "reflect":
      return "What changed in your understanding? Separately rate your confidence from 1 to 5.";
    case "transfer":
      return `Without help, apply ${config.topicArea} to a new situation and explain why your answer works.`;
  }
}

export async function generateStageTurn(input: {
  config: GPTLessonConfig;
  stage: GPTLessonStage;
  learnerResponse: string | null;
  hintsUsed: number;
}): Promise<GPTStageAIResult> {
  const { config, stage, learnerResponse, hintsUsed } = input;
  const result = await callStructuredJson(
    stageResponseSchema,
    buildTutorSystemPrompt(config),
    buildStagePrompt(config, stage, learnerResponse, hintsUsed)
  );

  if (!result.data) {
    return {
      assistantMessage: fallbackStageMessage(config, stage),
      readyToAdvance: false,
      hint: null,
      followUpQuestion: null,
      evidence: {
        independentProblemSolving: "",
        reasoningExplanation: "",
        aiVerification: "",
        learningReflection: "",
        transferToNewSituations: "",
      },
      safety: { severity: "none", category: null },
      provider: result.provider,
      model: result.model,
      providerDegraded: true,
      safetyResult: { severity: "none", category: null, message: null },
    };
  }

  return {
    ...result.data,
    provider: result.provider,
    model: result.model,
    providerDegraded: result.providerDegraded,
    safetyResult: coerceModelSafety(result.data.safety),
  };
}

export async function generateHint(input: {
  config: GPTLessonConfig;
  stage: GPTLessonStage;
  learnerResponse: string | null;
  hintsUsed: number;
}): Promise<GPTHintAIResult> {
  const { config, stage, learnerResponse, hintsUsed } = input;
  const result = await callStructuredJson(
    hintResponseSchema,
    buildTutorSystemPrompt(config),
    buildHintPrompt(config, stage, learnerResponse, hintsUsed),
    700
  );

  if (!result.data) {
    return {
      hint: "Break the problem into what you know, what the question asks, and one strategy that connects them.",
      assistantMessage: "Use the hint, then try the step yourself.",
      safety: { severity: "none", category: null },
      provider: result.provider,
      model: result.model,
      providerDegraded: true,
      safetyResult: { severity: "none", category: null, message: null },
    };
  }

  return {
    ...result.data,
    provider: result.provider,
    model: result.model,
    providerDegraded: result.providerDegraded,
    safetyResult: coerceModelSafety(result.data.safety),
  };
}

function fallbackAssessment(config: GPTLessonConfig): GPTAssessmentContent {
  return {
    transferPrompt: `Describe a new real-world situation where ${config.topicArea} matters. Explain how you would apply the concept and why your choice fits the learning objective.`,
    quizItems: [
      {
        id: "q1",
        question: `Which response best demonstrates understanding of ${config.topicArea}?`,
        options: [
          "Repeating a definition",
          "Applying the idea and explaining why it works",
          "Copying an example without changes",
          "Choosing the first plausible answer",
        ],
        correctOptionIndex: 1,
        explanation: "Understanding is shown by applying and justifying the idea.",
      },
      {
        id: "q2",
        question: "What is the strongest evidence that a learner understands a concept?",
        options: [
          "They feel confident",
          "They use AI wording",
          "They transfer the idea to a new situation and justify it",
          "They finish quickly",
        ],
        correctOptionIndex: 2,
        explanation: "Independent transfer and justification are stronger evidence than confidence.",
      },
      {
        id: "q3",
        question: "When an answer may be wrong, what should a learner do first?",
        options: [
          "Ask for the final answer",
          "Check the reasoning and evidence",
          "Guess again immediately",
          "Skip the task",
        ],
        correctOptionIndex: 1,
        explanation: "Verification means checking reasoning before seeking an answer.",
      },
    ],
    provider: null,
    model: null,
    providerDegraded: true,
  };
}

export async function generateAssessment(config: GPTLessonConfig): Promise<GPTAssessmentContent> {
  const result = await callStructuredJson(
    assessmentSchema,
    buildTutorSystemPrompt(config),
    buildAssessmentPrompt(config),
    1400
  );

  if (!result.data) {
    return fallbackAssessment(config);
  }

  return {
    transferPrompt: result.data.transferPrompt,
    quizItems: result.data.quizItems,
    provider: result.provider,
    model: result.model,
    providerDegraded: result.providerDegraded,
  };
}

function toDimensionScore(value: { score: number | null; evidence?: string }): GPTDimensionScore {
  if (value.score === null) {
    return {
      score: null,
      status: "insufficient",
      evidence: value.evidence || "Insufficient evidence",
    };
  }

  return {
    score: value.score,
    status: value.score >= 3 ? "demonstrated" : "developing",
    evidence: value.evidence || "No evidence note supplied",
  };
}

function insufficientDimensions(): Record<GPTLearningDimension, GPTDimensionScore> {
  return GPT_LEARNING_DIMENSIONS.reduce(
    (acc, dimension) => ({
      ...acc,
      [dimension]: { score: null, status: "insufficient", evidence: "Insufficient evidence" },
    }),
    {} as Record<GPTLearningDimension, GPTDimensionScore>
  );
}

export function calculateCompositeScore(
  scores: Record<GPTLearningDimension, GPTDimensionScore>
): number | null {
  const weights: Record<GPTLearningDimension, number> = {
    independentProblemSolving: 0.3,
    reasoningExplanation: 0.25,
    aiVerification: 0.2,
    learningReflection: 0.15,
    transferToNewSituations: 0.1,
  };

  if (GPT_LEARNING_DIMENSIONS.some((dimension) => scores[dimension].score === null)) {
    return null;
  }

  const total = GPT_LEARNING_DIMENSIONS.reduce(
    (sum, dimension) => sum + (scores[dimension].score || 0) * weights[dimension],
    0
  );
  return Math.round(total * 25);
}

export async function scoreAssessment(input: {
  config: GPTLessonConfig;
  transferPrompt: string;
  transferResponse: string;
  quizItems: GPTQuizItem[];
  quizAnswers: number[];
}): Promise<GPTAssessmentScoreResult> {
  const { config, transferPrompt, transferResponse, quizItems, quizAnswers } = input;
  const correctCount = quizItems.reduce(
    (count, item, index) => count + (quizAnswers[index] === item.correctOptionIndex ? 1 : 0),
    0
  );
  const quizScorePercentage = quizItems.length
    ? Math.round((correctCount / quizItems.length) * 100)
    : 0;

  const result = await callStructuredJson(
    rubricSchema,
    buildTutorSystemPrompt(config),
    buildRubricPrompt(config, transferPrompt, transferResponse),
    1400
  );

  if (!result.data) {
    return {
      quizScorePercentage,
      dimensionScores: insufficientDimensions(),
      compositeScorePercentage: null,
      summary: "AI rubric scoring was unavailable; instructor review is required.",
      provider: result.provider,
      model: result.model,
      providerDegraded: true,
      safetyResult: { severity: "none", category: null, message: null },
    };
  }

  const data = result.data;
  const dimensionScores = GPT_LEARNING_DIMENSIONS.reduce(
    (acc, dimension) => ({
      ...acc,
      [dimension]: toDimensionScore(data.dimensionScores[dimension]),
    }),
    {} as Record<GPTLearningDimension, GPTDimensionScore>
  );

  return {
    quizScorePercentage,
    dimensionScores,
    compositeScorePercentage: calculateCompositeScore(dimensionScores),
    summary: data.summary,
    provider: result.provider,
    model: result.model,
    providerDegraded: result.providerDegraded,
    safetyResult: coerceModelSafety(data.safety),
  };
}

export function assessmentPassed(input: {
  quizScorePercentage: number;
  dimensionScores: Record<GPTLearningDimension, GPTDimensionScore>;
  config: GPTLessonConfig;
}): boolean {
  const { quizScorePercentage, dimensionScores, config } = input;
  if (quizScorePercentage < config.quizPassingPercentage) return false;

  return GPT_LEARNING_DIMENSIONS.every((dimension) => {
    const score = dimensionScores[dimension].score;
    return score !== null && score >= config.rubricPassingScore;
  });
}
