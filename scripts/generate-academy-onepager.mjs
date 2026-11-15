/**
 * Generates docs/CURIOQUEST_ACADEMY_ONEPAGER.pdf - a one-page marketing
 * sheet for the full CurioQuest Learning Academy (features + benefits).
 *
 * Usage:  node scripts/generate-academy-onepager.mjs
 * Requires: jspdf (already installed via html2pdf.js)
 */

import { jsPDF } from "jspdf";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "docs", "CURIOQUEST_ACADEMY_ONEPAGER.pdf");

// ---- palette ---------------------------------------------------------------
const SLATE = [30, 27, 46];
const VIOLET = [139, 92, 246];
const VIOLET_BG = [240, 236, 252];
const AMBER = [245, 158, 11];
const PAPER = [250, 249, 255];
const INK = [35, 30, 50];
const MUTE = [110, 105, 135];
const WHITE = [255, 255, 255];
const GREEN = [34, 160, 110];
const HAIRLINE = [228, 224, 244];

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 36;
const CONTENT_W = PAGE_W - MARGIN * 2;

const doc = new jsPDF({ unit: "pt", format: "letter" });
doc.setProperties({
  title: "CurioQuest Learning Academy",
  subject: "AI-guided learning for children and families",
  creator: "CurioQuest",
});

// ---- helpers ---------------------------------------------------------------
function fill(color, x, y, w, h) {
  doc.setFillColor(...color);
  doc.rect(x, y, w, h, "F");
}
function rounded(color, x, y, w, h, r = 6) {
  doc.setFillColor(...color);
  doc.roundedRect(x, y, w, h, r, r, "F");
}
function text(str, x, y, { size = 10, color = INK, style = "normal", align = "left" } = {}) {
  doc.setFont("helvetica", style);
  doc.setFontSize(size);
  doc.setTextColor(...color);
  doc.text(str, x, y, { align });
}
function label(str, x, y) {
  text(str.toUpperCase(), x, y, { size: 8.5, color: VIOLET, style: "bold" });
}
function hairline(x, y, w) {
  fill(HAIRLINE, x, y, w, 1);
}
function bullets(items, x, y, width, { gap = 4, size = 9.3, lineH = 11.5 } = {}) {
  let cy = y;
  for (const item of items) {
    doc.setFillColor(...AMBER);
    doc.circle(x + 3, cy - 3, 1.8, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(...INK);
    const lines = doc.splitTextToSize(item, width - 14);
    doc.text(lines, x + 12, cy);
    cy += lines.length * lineH + gap;
  }
  return cy;
}
function checkItem(item, x, y, width, lineH = 11.5) {
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(1.6);
  doc.line(x + 1, y - 3, x + 3.5, y - 0.5);
  doc.line(x + 3.5, y - 0.5, x + 8.5, y - 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.3);
  doc.setTextColor(...INK);
  const lines = doc.splitTextToSize(item, width - 14);
  doc.text(lines, x + 14, y);
  return lines.length * lineH;
}
function chipCard(str, x, y, w, h, { accent = false } = {}) {
  rounded(WHITE, x, y, w, h, 5);
  doc.setDrawColor(...HAIRLINE);
  doc.roundedRect(x, y, w, h, 5, 5, "S");
  text(str, x + w / 2, y + h / 2 + 3, {
    size: 8.4,
    color: accent ? VIOLET : INK,
    style: accent ? "bold" : "normal",
    align: "center",
  });
}

// ---- background --------------------------------------------------------------
fill(PAPER, 0, 0, PAGE_W, PAGE_H);

// ---- header --------------------------------------------------------------------
fill(SLATE, 0, 0, PAGE_W, 118);
fill(VIOLET, 0, 118, PAGE_W, 3);
fill(AMBER, 0, 118, 190, 3);

text("CurioQuest", MARGIN, 30, { size: 15, color: WHITE, style: "bold" });
text("AI-GUIDED LEARNING", MARGIN + 84, 30, { size: 8, color: AMBER, style: "bold" });
text("LEARNING ACADEMY", PAGE_W - MARGIN, 30, { size: 8, color: [180, 175, 200], align: "right" });

text("Learning Kids Love. Progress Parents Trust.", MARGIN, 64, {
  size: 21, color: WHITE, style: "bold",
});
text(
  "A complete learning platform where AI coaches every student through a proven",
  MARGIN, 84, { size: 10.5, color: [214, 210, 230] }
);
text(
  "framework - with human oversight and verifiable proof of learning.",
  MARGIN, 97, { size: 10.5, color: [214, 210, 230] }
);

// ---- lesson formats --------------------------------------------------------------
label("Eight Ways to Learn", MARGIN, 148);

const FORMATS = [
  "Video", "Reading", "Quiz", "Assignment",
  "Download", "Live Session", "AI Tutor Lesson", "AI Interview",
];
const F_COLS = 4;
const F_W = (CONTENT_W - (F_COLS - 1) * 8) / F_COLS;
const F_H = 21;
FORMATS.forEach((f, i) => {
  const x = MARGIN + (i % F_COLS) * (F_W + 8);
  const y = 158 + Math.floor(i / F_COLS) * (F_H + 6);
  chipCard(f, x, y, F_W, F_H, { accent: f.includes("AI") });
});

// ---- six-stage strip ---------------------------------------------------------------
label("Every AI Lesson Follows Six Proven Stages", MARGIN, 236);

const STAGES = ["NOTICE", "TRY", "CHALLENGE", "VERIFY", "REFLECT", "TRANSFER"];
const PILL_W = 82;
const PILL_H = 21;
const PILL_GAP = (CONTENT_W - PILL_W * STAGES.length) / (STAGES.length - 1);
const PILL_Y = 246;
STAGES.forEach((name, i) => {
  const x = MARGIN + i * (PILL_W + PILL_GAP);
  rounded(VIOLET, x, PILL_Y, PILL_W, PILL_H, 10);
  text(name, x + PILL_W / 2, PILL_Y + 14.5, { size: 8.4, color: WHITE, style: "bold", align: "center" });
  if (i < STAGES.length - 1) {
    text(">", x + PILL_W + PILL_GAP / 2, PILL_Y + 15, { size: 12, color: AMBER, style: "bold", align: "center" });
  }
});
text(
  "Learners spot the pattern, try it themselves, face a harder challenge, verify their",
  MARGIN, PILL_Y + 40, { size: 8.6, color: MUTE }
);
text(
  "reasoning, reflect on how they learned, then transfer the skill to something new.",
  MARGIN, PILL_Y + 51, { size: 8.6, color: MUTE }
);

// ---- two-column body ------------------------------------------------------------------
const COL_GAP = 40;
const COL_W = (CONTENT_W - COL_GAP) / 2;
const LEFT_X = MARGIN;
const RIGHT_X = MARGIN + COL_W + COL_GAP;
const BODY_TOP = 318;

// LEFT - AI-guided, human-verified
label("AI-Guided, Human-Verified", LEFT_X, BODY_TOP);
hairline(LEFT_X, BODY_TOP + 6, COL_W);
bullets([
  "Admin-approved AI tutor personas - what the AI teaches and how it teaches is set by educators",
  "AI Student Interviews - Socratic conversations that test genuine understanding",
  "Human review queue - an administrator approves every AI session before it counts",
  "Guardian consent for minors - sessions pause until a parent approves via secure link",
  "Measured by demonstrated work - stages completed and quizzes passed, never chat volume",
], LEFT_X, BODY_TOP + 24, COL_W);

// RIGHT - proof of learning
label("Proof of Learning", RIGHT_X, BODY_TOP);
hairline(RIGHT_X, BODY_TOP + 6, COL_W);
let ry = BODY_TOP + 24;
for (const item of [
  "Server-scored quizzes - answers never reach the browser, so results can't be faked",
  "Live progress tracking - per-lesson completion and course percentage, always visible",
  "Auto-issued certificates - verifiable and printable the moment a course is finished",
  "Printable progress reports - quiz scores and completion for portfolios and reviews",
  "Free preview lessons - families see real course content before they enroll",
]) {
  ry += checkItem(item, RIGHT_X, ry, COL_W) + 4;
}

// ---- effortless journey strip -------------------------------------------------------------
const JOURNEY_Y = 496;
label("Effortless From First Click to Certificate", MARGIN, JOURNEY_Y);
hairline(MARGIN, JOURNEY_Y + 6, CONTENT_W);

const STEPS = [
  ["1. Explore", "browse the public catalog and free preview lessons"],
  ["2. Enroll", "one-click free courses or secure Stripe checkout"],
  ["3. Learn", "pick up right where they left off, every time"],
  ["4. Celebrate", "certificate and progress report print instantly"],
];
const STEP_W = (CONTENT_W - 3 * 10) / 4;
STEPS.forEach(([head, body], i) => {
  const x = MARGIN + i * (STEP_W + 10);
  rounded(VIOLET_BG, x, JOURNEY_Y + 16, STEP_W, 46, 6);
  text(head, x + 10, JOURNEY_Y + 32, { size: 9.5, color: SLATE, style: "bold" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(...MUTE);
  const lines = doc.splitTextToSize(body, STEP_W - 18);
  doc.text(lines, x + 10, JOURNEY_Y + 43);
});

// ---- who it's for --------------------------------------------------------------------------
const WHO_Y = JOURNEY_Y + 86;
label("Built for the Whole Family - and Your Team", MARGIN, WHO_Y);
hairline(MARGIN, WHO_Y + 6, CONTENT_W);

const WHO = [
  ["For Learners", [
    "Fun, structured lessons with an AI coach",
    "Clear progress, retakes, and celebrations",
  ]],
  ["For Parents & Guardians", [
    "Consent links and approval gates for minors",
    "Printable reports and real verifiable proof",
  ]],
  ["For Administrators", [
    "Course builder, student dashboards, reviews",
    "Event registrations that auto-create accounts",
  ]],
];
const WHO_W = (CONTENT_W - 2 * 12) / 3;
WHO.forEach(([head, items], i) => {
  const x = MARGIN + i * (WHO_W + 12);
  rounded(WHITE, x, WHO_Y + 16, WHO_W, 62, 6);
  doc.setDrawColor(...HAIRLINE);
  doc.roundedRect(x, WHO_Y + 16, WHO_W, 62, 6, 6, "S");
  text(head, x + 10, WHO_Y + 32, { size: 8.8, color: VIOLET, style: "bold" });
  items.forEach((item, li) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(...INK);
    const lines = doc.splitTextToSize(item, WHO_W - 20);
    doc.text(lines, x + 10, WHO_Y + 44 + li * 10.5);
  });
});

// ---- footer -----------------------------------------------------------------------------------
fill(SLATE, 0, PAGE_H - 74, PAGE_W, 74);
fill(AMBER, 0, PAGE_H - 74, PAGE_W, 2);
text(
  "AI-guided learning with a human in the loop.",
  PAGE_W / 2, PAGE_H - 46,
  { size: 11, color: WHITE, style: "bold", align: "center" }
);
text(
  "curioquest.com   |   info@curioquest.com",
  PAGE_W / 2, PAGE_H - 26,
  { size: 10, color: AMBER, align: "center" }
);

// ---- write --------------------------------------------------------------------------------------
if (doc.getNumberOfPages() !== 1) {
  throw new Error(`Layout overflowed to ${doc.getNumberOfPages()} pages - shrink copy`);
}
doc.save(OUT);
console.log(`Wrote ${OUT}`);
