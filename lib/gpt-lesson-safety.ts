import type { GPTSafetyResult } from "./gpt-lesson-types";

const HIGH_RISK_PATTERNS = [
  /\b(kill|hurt|harm)\s+(myself|yourself|him|her|them)\b/i,
  /\b(suicide|self[-\s]?harm|end my life|want to die)\b/i,
  /\b(being abused|abuses me|sexually assaulted|trafficked)\b/i,
  /\b(weapon|bomb|shoot up|attack)\s+(school|someone|people)\b/i,
];

const MEDIUM_RISK_PATTERNS = [
  /\b(run away|scared to go home|afraid of my (mom|dad|parent|guardian))\b/i,
  /\b(don'?t tell|keep this secret).*(parent|guardian|teacher|adult)\b/i,
];

const PII_PATTERNS = [
  /\b[\w.+-]+@[\w-]+\.[\w.]+\b/i,
  /\b(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/,
  /\b\d{1,5}\s+[A-Za-z0-9.'\s]+\s+(street|st|avenue|ave|road|rd|drive|dr|lane|ln)\b/i,
];

export function screenLearnerText(text: string, isMinor: boolean): GPTSafetyResult {
  const normalized = text.trim();
  if (!normalized) {
    return { severity: "none", category: null, message: null };
  }

  if (HIGH_RISK_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return {
      severity: "high",
      category: "urgent_safety_disclosure",
      message:
        "I’m going to pause the lesson and notify the course team so a person can follow up. If you are in immediate danger, contact emergency services or a trusted adult now.",
    };
  }

  if (MEDIUM_RISK_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return {
      severity: "medium",
      category: "safety_concern",
      message:
        "That sounds important, and it may need help from a person rather than a lesson. Please tell a trusted adult or course staff member.",
    };
  }

  if (isMinor && PII_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return {
      severity: "low",
      category: "personal_information",
      message:
        "Please don’t share personal contact or location details in the lesson. You can answer using only the learning task.",
    };
  }

  return { severity: "none", category: null, message: null };
}

export function coerceModelSafety(value: unknown): GPTSafetyResult {
  if (!value || typeof value !== "object") {
    return { severity: "none", category: null, message: null };
  }

  const safety = value as { severity?: unknown; category?: unknown };
  const severity =
    safety.severity === "low" || safety.severity === "medium" || safety.severity === "high"
      ? safety.severity
      : "none";

  return {
    severity,
    category: typeof safety.category === "string" ? safety.category : null,
    message: null,
  };
}

export function shouldPauseForSafety(result: GPTSafetyResult): boolean {
  return result.severity === "high";
}
