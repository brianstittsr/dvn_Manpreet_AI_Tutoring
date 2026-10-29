import type { GPTLessonStage } from "@/types/academy";

export interface GPTTimestamp {
  toDate(): Date;
  toMillis(): number;
}

export const GPT_LESSON_STAGES = [
  "notice",
  "try",
  "challenge",
  "verify",
  "reflect",
  "transfer",
] as const satisfies readonly GPTLessonStage[];

export const GPT_LEARNING_DIMENSIONS = [
  "independentProblemSolving",
  "reasoningExplanation",
  "aiVerification",
  "learningReflection",
  "transferToNewSituations",
] as const;

export type GPTLearningDimension = (typeof GPT_LEARNING_DIMENSIONS)[number];
export type GPTSessionStatus =
  | "active"
  | "consent_required"
  | "pending_review"
  | "needs_retry"
  | "completed"
  | "safety_hold"
  | "provider_degraded";

export type GPTLearningEventType =
  | "session_started"
  | "stage_started"
  | "student_response"
  | "assistant_feedback"
  | "hint"
  | "assessment_started"
  | "assessment_submitted"
  | "score_recorded"
  | "review_decision"
  | "consent_required"
  | "safety_flag"
  | "provider_fallback";

export interface GPTStageState {
  attempts: number;
  hintsUsed: number;
  completedAt: GPTTimestamp | null;
  lastResponse: string | null;
}

export interface GPTLessonSessionDoc {
  id: string;
  learnerId: string;
  learnerAuthUid: string;
  lessonId: string;
  courseId: string;
  enrollmentId: string;
  status: GPTSessionStatus;
  currentStage: GPTLessonStage;
  stageState: Record<GPTLessonStage, GPTStageState>;
  guardianConsentId: string | null;
  activeAssessmentId: string | null;
  transferAttemptCount: number;
  evidenceSummary: Partial<Record<GPTLearningDimension, string>>;
  lastEventId: string | null;
  promptVersion: string;
  rulesVersion: string;
  provider: string | null;
  model: string | null;
  providerDegraded: boolean;
  confidenceSelfReport: number | null;
  startedAt: GPTTimestamp;
  lastActivityAt: GPTTimestamp;
  completedAt: GPTTimestamp | null;
}

export interface GPTLearningEventDoc {
  id: string;
  sessionId: string;
  learnerId: string;
  stage: GPTLessonStage;
  eventType: GPTLearningEventType;
  actor: "student" | "assistant" | "system" | "reviewer";
  content: string;
  visibility: "learner" | "staff" | "guardian_summary";
  provenance: {
    source: "student" | "ai" | "deterministic" | "reviewer" | "system";
    provider?: string | null;
    model?: string | null;
    promptVersion?: string | null;
    itemVersion?: string | null;
  };
  createdAt: GPTTimestamp;
}

export interface GPTQuizItem {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string | null;
}

export type GPTScoreStatus = "insufficient" | "developing" | "demonstrated";

export interface GPTDimensionScore {
  score: number | null;
  status: GPTScoreStatus;
  evidence: string;
}

export interface GPTLessonAssessmentDoc {
  id: string;
  sessionId: string;
  learnerId: string;
  lessonId: string;
  courseId: string;
  status: "draft" | "sealed" | "scored" | "pending_review" | "approved" | "returned";
  quizItems: GPTQuizItem[];
  quizAnswers: number[];
  quizScorePercentage: number | null;
  transferPrompt: string;
  transferResponse: string | null;
  sealedAt: GPTTimestamp | null;
  dimensionScores: Record<GPTLearningDimension, GPTDimensionScore> | null;
  compositeScorePercentage: number | null;
  confidenceSelfReport: number | null;
  passed: boolean;
  reviewRequired: boolean;
  reviewStatus: "not_required" | "pending" | "approved" | "returned";
  reviewerId: string | null;
  reviewerNote: string | null;
  reviewedAt: GPTTimestamp | null;
  provider: string | null;
  model: string | null;
  rubricVersion: string;
  promptVersion: string;
  itemVersion: string;
  createdAt: GPTTimestamp;
  updatedAt: GPTTimestamp;
}

export interface GPTScoreRecordDoc {
  id: string;
  sessionId: string;
  assessmentId: string;
  learnerId: string;
  lessonId: string;
  courseId: string;
  dimensionScores: Record<GPTLearningDimension, GPTDimensionScore>;
  compositeScorePercentage: number | null;
  quizScorePercentage: number | null;
  confidenceSelfReport: number | null;
  status: "insufficient_evidence" | "developing" | "demonstrated";
  scoringMethod: "deterministic_plus_ai_rubric" | "instructor_review";
  reviewerId: string | null;
  rubricVersion: string;
  createdAt: GPTTimestamp;
  updatedAt: GPTTimestamp;
}

export interface GPTGuardianLinkDoc {
  id: string;
  learnerId: string;
  learnerAuthUid: string | null;
  learnerEmail: string;
  guardianId: string;
  guardianAuthUid: string | null;
  guardianEmail: string;
  relationship: string;
  status: "pending" | "approved" | "declined" | "revoked";
  consentPolicyVersion: string;
  requestedById: string;
  decidedAt: GPTTimestamp | null;
  expiresAt: GPTTimestamp | null;
  createdAt: GPTTimestamp;
  updatedAt: GPTTimestamp;
}

export interface GPTSafetyIncidentDoc {
  id: string;
  sessionId: string;
  learnerId: string;
  lessonId: string;
  severity: "low" | "medium" | "high";
  category: string;
  excerpt: string;
  status: "open" | "acknowledged" | "resolved";
  createdBy: "system" | "model";
  createdAt: GPTTimestamp;
  acknowledgedById: string | null;
  acknowledgedAt: GPTTimestamp | null;
}

export interface GPTLessonMessage {
  id: string;
  role: "assistant" | "student" | "system";
  stage: GPTLessonStage;
  content: string;
  createdAt: string;
}

export interface GPTQuizItemClient {
  id: string;
  question: string;
  options: string[];
}

export interface GPTLessonClientAssessment {
  id: string;
  status: GPTLessonAssessmentDoc["status"];
  reviewStatus: GPTLessonAssessmentDoc["reviewStatus"];
  quizItems: GPTQuizItemClient[];
  quizScorePercentage: number | null;
  transferPrompt: string;
  sealed: boolean;
  passed: boolean;
  dimensionScores: Record<GPTLearningDimension, GPTDimensionScore> | null;
  compositeScorePercentage: number | null;
}

export interface GPTLessonClientStageState {
  attempts: number;
  hintsUsed: number;
  completedAt: string | null;
  lastResponse: string | null;
}

export interface GPTLessonClientState {
  sessionId: string;
  status: GPTSessionStatus;
  currentStage: GPTLessonStage;
  stageState: Record<GPTLessonStage, GPTLessonClientStageState>;
  messages: GPTLessonMessage[];
  canRequestHint: boolean;
  hintsRemaining: number;
  requiresGuardianConsent: boolean;
  consentStatus: "not_required" | "pending" | "approved" | "declined" | "revoked";
  assessment: GPTLessonClientAssessment | null;
  providerDegraded: boolean;
}

export type GPTLessonRequest =
  | {
      action: "start";
      lessonId: string;
      courseId: string;
    }
  | {
      action: "respond";
      sessionId: string;
      response: string;
      confidenceSelfReport?: number;
    }
  | {
      action: "hint";
      sessionId: string;
    }
  | {
      action: "submitAssessment";
      sessionId: string;
      quizAnswers: number[];
      transferResponse: string;
    }
  | {
      action: "retryAssessment";
      sessionId: string;
    };

export interface GPTSafetyResult {
  severity: "none" | "low" | "medium" | "high";
  category: string | null;
  message: string | null;
}

export interface GPTReviewQueueItem {
  sessionId: string;
  assessmentId: string | null;
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  status: GPTSessionStatus;
  submittedAt: string;
  compositeScorePercentage: number | null;
  quizScorePercentage: number | null;
  passed: boolean;
  reviewStatus: GPTLessonAssessmentDoc["reviewStatus"] | null;
}

export interface GPTReviewEvent {
  id: string;
  stage: GPTLessonStage;
  eventType: GPTLearningEventType;
  actor: GPTLearningEventDoc["actor"];
  content: string;
  visibility: GPTLearningEventDoc["visibility"];
  provenance: GPTLearningEventDoc["provenance"];
  createdAt: string;
}

export interface GPTReviewAssessment extends Omit<GPTLessonAssessmentDoc, "sealedAt" | "reviewedAt" | "createdAt" | "updatedAt"> {
  sealedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GPTReviewDetail {
  session: {
    id: string;
    learnerId: string;
    learnerName: string;
    learnerEmail: string;
    lessonId: string;
    lessonTitle: string;
    courseId: string;
    courseTitle: string;
    status: GPTSessionStatus;
    currentStage: GPTLessonStage;
    evidenceSummary: Partial<Record<GPTLearningDimension, string>>;
    startedAt: string;
    lastActivityAt: string;
    completedAt: string | null;
  };
  assessment: GPTReviewAssessment | null;
  events: GPTReviewEvent[];
  safetyIncidents: Array<{
    id: string;
    severity: GPTSafetyIncidentDoc["severity"];
    category: string;
    excerpt: string;
    status: GPTSafetyIncidentDoc["status"];
    createdAt: string;
  }>;
}

export interface GPTGuardianLinkClient {
  id: string;
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  guardianId: string;
  guardianName: string;
  guardianEmail: string;
  relationship: string;
  status: GPTGuardianLinkDoc["status"];
  consentPolicyVersion: string;
  requestedByName: string;
  decidedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}
