import type { GPTLessonConfig, GPTLessonStage, GPTTutorPersona } from "@/types/academy";

export const GPT_LESSON_PROMPT_VERSION = "gpt-lesson-v1";
export const GPT_LESSON_RULES_VERSION = "learning-cycle-v1";
export const GPT_LESSON_RUBRIC_VERSION = "aicenter4u-evidence-v1";

const PERSONA_INSTRUCTIONS: Record<Exclude<GPTTutorPersona, "custom">, string> = {
  generic:
    "You are a precise, encouraging learning coach. Adapt explanations to the topic and learner responses.",
  math:
    "You are a Math Coach. Emphasize representations, worked reasoning, checking strategies, and common misconceptions without doing the learner's work for them.",
  reading:
    "You are a Reading Coach. Emphasize evidence from text, vocabulary in context, inference, and explanation of reasoning.",
  lifeSkills:
    "You are a Life Skills Coach. Emphasize practical judgment, safe decision-making, realistic scenarios, and reflection.",
};

const STAGE_INSTRUCTIONS: Record<GPTLessonStage, string> = {
  notice:
    "Help the learner notice the important idea. Ask what they already know or observe. Do not teach the full answer yet.",
  try:
    "Ask the learner to attempt a small unaided task before receiving substantial help. Wait for their reasoning. Do not solve it for them.",
  challenge:
    "Provide one appropriately harder practice challenge. Give only progressive hints when requested. Keep the learner responsible for the answer.",
  verify:
    "Ask the learner to check, justify, or critique their work. Focus on evidence, reasoning, and whether their conclusion makes sense.",
  reflect:
    "Ask the learner to reflect on what changed in their understanding and collect a separate confidence rating. Do not treat confidence as mastery.",
  transfer:
    "The learner is in an unaided transfer assessment. Do not provide hints, coaching, feedback, answer exposure, or generative evaluation until the application seals the response.",
};

export function buildTutorSystemPrompt(config: GPTLessonConfig): string {
  const persona =
    config.tutorPersona === "custom"
      ? config.customPersonaInstructions || PERSONA_INSTRUCTIONS.generic
      : PERSONA_INSTRUCTIONS[config.tutorPersona];

  return [
    persona,
    `Topic area: ${config.topicArea}`,
    `Learning objective: ${config.learningObjective}`,
    `Audience: ${config.audience === "minor" ? "minor learner" : "adult learner"}`,
    config.gradeBand ? `Reading/grade band: ${config.gradeBand}` : null,
    config.prerequisites.length > 0
      ? `Expected prerequisites: ${config.prerequisites.join("; ")}`
      : null,
    "Core rules:",
    "- Build understanding before answers.",
    "- Ask at most one substantive question in each response.",
    "- Do not reveal a complete solution when a hint or bounded explanation is sufficient.",
    "- Do not mark the learner as having mastered the topic.",
    "- Do not infer mastery, attendance, mental health, personality, or real-world behavior from tone.",
    "- If the learner is a minor, use age-appropriate wording and never request personal, location, contact, account, family, health, or identity details.",
    "- If the learner discloses immediate danger, abuse, self-harm, or exploitation, stop tutoring and return a safety flag instead of continuing the lesson.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildStagePrompt(
  config: GPTLessonConfig,
  stage: GPTLessonStage,
  learnerResponse: string | null,
  hintsUsed: number
): string {
  return [
    `Current learning stage: ${stage.toUpperCase()}`,
    STAGE_INSTRUCTIONS[stage],
    `Hints already used in this stage: ${hintsUsed}; maximum allowed: ${config.maxHints}.`,
    learnerResponse ? `Latest learner response:\n${learnerResponse}` : "No learner response has been submitted for this stage yet.",
    "Return JSON only with this shape:",
    '{"assistantMessage":"...","readyToAdvance":false,"hint":null,"followUpQuestion":"...","evidence":{"independentProblemSolving":"brief evidence or empty string","reasoningExplanation":"brief evidence or empty string","aiVerification":"brief evidence or empty string","learningReflection":"brief evidence or empty string","transferToNewSituations":"brief evidence or empty string"},"safety":{"severity":"none|low|medium|high","category":"category or null"}}',
  ].join("\n\n");
}

export function buildHintPrompt(
  config: GPTLessonConfig,
  stage: GPTLessonStage,
  learnerResponse: string | null,
  hintsUsed: number
): string {
  return [
    `Current learning stage: ${stage.toUpperCase()}`,
    "Create the next progressive hint. It must be narrower than the prior hint and must not reveal the final answer.",
    `Hint number requested: ${hintsUsed + 1}; maximum allowed: ${config.maxHints}.`,
    learnerResponse ? `Latest learner response:\n${learnerResponse}` : "No learner response has been submitted for this stage yet.",
    "Return JSON only:",
    '{"hint":"...","assistantMessage":"...","safety":{"severity":"none|low|medium|high","category":"category or null"}}',
  ].join("\n\n");
}

export function buildAssessmentPrompt(config: GPTLessonConfig): string {
  return [
    "Create a compact no-AI transfer assessment for this lesson.",
    `Topic area: ${config.topicArea}`,
    `Learning objective: ${config.learningObjective}`,
    `Audience: ${config.audience === "minor" ? "minor learner" : "adult learner"}`,
    config.gradeBand ? `Reading/grade band: ${config.gradeBand}` : null,
    "Return JSON only with this shape:",
    '{"transferPrompt":"one novel scenario or teach-back prompt","quizItems":[{"id":"q1","question":"...","options":["A","B","C","D"],"correctOptionIndex":0,"explanation":"..."}]}',
    "Requirements:",
    "- Include exactly 3 multiple-choice knowledge-check items.",
    "- The transfer prompt must require applying the concept to a new situation and explaining why.",
    "- Do not include phrases suggesting live AI help is available during the assessment.",
    "- Do not expose scoring internals in student-facing wording.",
  ].join("\n\n");
}

export function buildRubricPrompt(
  config: GPTLessonConfig,
  transferPrompt: string,
  transferResponse: string
): string {
  return [
    "Score the learner's sealed transfer response using the approved rubric. This is evidence for review, not an autonomous mastery decision.",
    `Topic area: ${config.topicArea}`,
    `Learning objective: ${config.learningObjective}`,
    `Transfer prompt: ${transferPrompt}`,
    `Sealed learner response:\n${transferResponse}`,
    "Score each dimension from 0 to 4. Use null only when there is insufficient evidence. Do not award points for confidence alone.",
    "Return JSON only:",
    '{"dimensionScores":{"independentProblemSolving":{"score":0,"evidence":"..."},"reasoningExplanation":{"score":0,"evidence":"..."},"aiVerification":{"score":0,"evidence":"..."},"learningReflection":{"score":0,"evidence":"..."},"transferToNewSituations":{"score":0,"evidence":"..."}},"summary":"brief evidence summary","safety":{"severity":"none|low|medium|high","category":"category or null"}}',
  ].join("\n\n");
}
