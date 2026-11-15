/**
 * Generates docs/GPT_LESSON_ONEPAGER.pdf - a one-page marketing sheet
 * spotlighting the CurioQuest AI Tutor Lesson (six-stage framework,
 * learning dimensions, safety, proof of learning).
 *
 * Usage:  node scripts/generate-gpt-lesson-onepager.mjs
 * Requires: jspdf (already installed via html2pdf.js)
 */

import { jsPDF } from "jspdf";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "docs", "GPT_LESSON_ONEPAGER.pdf");

// ---- palette -------------------------------------------------------------
const SLATE = [30, 27, 46];      // #1e1b2e deep slate
const VIOLET = [139, 92, 246];   // #8b5cf6
const AMBER = [245, 158, 11];    // #f59e0b
const PAPER = [250, 249, 255];   // near-white
const INK = [35, 30, 50];        // body text
const MUTE = [110, 105, 135];    // muted text
const WHITE = [255, 255, 255];
const GREEN = [34, 160, 110];    // checkmark / verify accent

const PAGE_W = 612;              // US Letter, pt
const PAGE_H = 792;
const MARGIN = 36;
const CONTENT_W = PAGE_W - MARGIN * 2;

const doc = new jsPDF({ unit: "pt", format: "letter" });
doc.setProperties({
  title: "The AI Tutor Lesson - CurioQuest",
  subject: "Six-stage AI-guided learning for children and families",
  creator: "CurioQuest",
});

// ---- helpers --------------------------------------------------------------
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
  doc.setCharSpace(0);
}

function bullets(items, x, y, width, { gap = 4, size = 9.5, lineH = 12 } = {}) {
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

function checkmarkBullet(item, x, y, width, lineH = 12) {
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(1.6);
  doc.line(x + 1, y - 3, x + 3.5, y - 0.5);
  doc.line(x + 3.5, y - 0.5, x + 8.5, y - 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  const lines = doc.splitTextToSize(item, width - 14);
  doc.text(lines, x + 14, y);
  return lines.length * lineH;
}

// ---- page background -------------------------------------------------------
fill(PAPER, 0, 0, PAGE_W, PAGE_H);

// ---- header band ------------------------------------------------------------
fill(SLATE, 0, 0, PAGE_W, 132);
fill(VIOLET, 0, 132, PAGE_W, 3);
fill(AMBER, 0, 132, 190, 3);

text("CurioQuest", MARGIN, 34, { size: 15, color: WHITE, style: "bold" });
text("AI-GUIDED LEARNING", MARGIN + 84, 34, { size: 8, color: AMBER, style: "bold" });
text("FOR CHILDREN & FAMILIES", PAGE_W - MARGIN, 34, { size: 8, color: [180, 175, 200], align: "right" });

text("The AI Tutor Lesson", MARGIN, 72, { size: 26, color: WHITE, style: "bold" });
text(
  "Six-stage AI coaching that measures real understanding - not chat time.",
  MARGIN, 94, { size: 11.5, color: [214, 210, 230] }
);
text(
  "Structured pedagogy. Human oversight. Proof parents can see.",
  MARGIN, 112, { size: 10, color: AMBER, style: "bolditalic" }
);

// ---- six-stage journey ------------------------------------------------------
label("The Six-Stage Learning Journey", MARGIN, 158);

const STAGES = [
  ["NOTICE", "spot the pattern before being told"],
  ["TRY", "attempt it themselves, first"],
  ["CHALLENGE", "a harder problem, with coaching"],
  ["VERIFY", "check their own reasoning"],
  ["REFLECT", "explain how they learned"],
  ["TRANSFER", "use the skill somewhere new"],
];

const PILL_W = 82;
const PILL_H = 24;
const PILL_GAP = (CONTENT_W - PILL_W * STAGES.length) / (STAGES.length - 1);
const PILL_Y = 170;

STAGES.forEach(([name], i) => {
  const x = MARGIN + i * (PILL_W + PILL_GAP);
  rounded(VIOLET, x, PILL_Y, PILL_W, PILL_H, 12);
  text(name, x + PILL_W / 2, PILL_Y + 16, { size: 9, color: WHITE, style: "bold", align: "center" });
  if (i < STAGES.length - 1) {
    text(">", x + PILL_W + PILL_GAP / 2, PILL_Y + 17, { size: 14, color: AMBER, style: "bold", align: "center" });
  }
});

// descriptors under pills
STAGES.forEach(([, desc], i) => {
  const x = MARGIN + i * (PILL_W + PILL_GAP);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.4);
  doc.setTextColor(...MUTE);
  const lines = doc.splitTextToSize(desc, PILL_W + 4);
  doc.text(lines, x + PILL_W / 2, PILL_Y + PILL_H + 12, { align: "center" });
});

// ---- five learning dimensions ----------------------------------------------
label("Measured on Five Learning Dimensions", MARGIN, 240);

const DIMS = [
  "Independent\nproblem solving",
  "Reasoning &\nexplanation",
  "AI\nverification",
  "Learning\nreflection",
  "Transfer to\nnew situations",
];
const CHIP_W = 101;
const CHIP_H = 34;
const CHIP_GAP = (CONTENT_W - CHIP_W * DIMS.length) / (DIMS.length - 1);
const CHIP_Y = 250;

DIMS.forEach((d, i) => {
  const x = MARGIN + i * (CHIP_W + CHIP_GAP);
  rounded([240, 236, 252], x, CHIP_Y, CHIP_W, CHIP_H, 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.2);
  doc.setTextColor(...SLATE);
  d.split("\n").forEach((line, li) => {
    doc.text(line, x + CHIP_W / 2, CHIP_Y + 14 + li * 10, { align: "center" });
  });
});

// ---- two-column body ---------------------------------------------------------
const COL_GAP = 40;
const COL_W = (CONTENT_W - COL_GAP) / 2;
const LEFT_X = MARGIN;
const RIGHT_X = MARGIN + COL_W + COL_GAP;
const BODY_TOP = 318;

// LEFT - AI-guided instruction
label("AI-Guided Instruction", LEFT_X, BODY_TOP);
fill([228, 224, 244], LEFT_X, BODY_TOP + 6, COL_W, 1);
let ly = BODY_TOP + 26;
ly = bullets([
  "Admin-approved tutor personas - the AI's personality and subject scope are set by educators, not improvised",
  "AI Student Interviews - Socratic conversations that probe real understanding, beyond multiple choice",
  "Human review queue - every AI session is approved by an administrator before it counts toward completion",
  "Guardian consent for minors - sessions pause until a parent approves via a secure consent link",
  "Measured by demonstrated work - stages completed and quizzes passed, never messages exchanged",
], LEFT_X, ly, COL_W);

// RIGHT - formats + proof of learning
label("Rich Lesson Formats", RIGHT_X, BODY_TOP);
fill([228, 224, 244], RIGHT_X, BODY_TOP + 6, COL_W, 1);

const FORMATS = [
  "Video", "Reading", "Quiz", "Assignment",
  "Download", "Live Session", "AI Tutor Lesson", "AI Interview",
];
const FW = (COL_W - 8) / 2;
let ry = BODY_TOP + 18;
FORMATS.forEach((f, i) => {
  const cx = RIGHT_X + (i % 2) * (FW + 8);
  const cy = ry + Math.floor(i / 2) * 24;
  rounded(WHITE, cx, cy, FW, 19, 5);
  doc.setDrawColor(...[228, 224, 244]);
  doc.roundedRect(cx, cy, FW, 19, 5, 5, "S");
  const isAI = f.includes("AI");
  text(f, cx + 9, cy + 13, { size: 8.6, color: isAI ? VIOLET : INK, style: isAI ? "bold" : "normal" });
});
ry += Math.ceil(FORMATS.length / 2) * 24 + 14;

label("Proof of Learning", RIGHT_X, ry);
fill([228, 224, 244], RIGHT_X, ry + 6, COL_W, 1);
ry += 24;
for (const item of [
  "Server-scored quizzes - answers never reach the browser; results can't be faked",
  "Per-lesson progress tracking and live course completion percentage",
  "Certificates auto-issued on completion - printable, verifiable",
  "Printable progress reports for portfolios and parent reviews",
]) {
  ry += checkmarkBullet(item, RIGHT_X, ry, COL_W) + 4;
}

// ---- closing callout ----------------------------------------------------------
rounded([240, 236, 252], MARGIN, PAGE_H - 156, CONTENT_W, 62, 8);
text(
  "Built for children. Verified by humans. Loved by families.",
  PAGE_W / 2, PAGE_H - 128,
  { size: 13, color: SLATE, style: "bold", align: "center" }
);
text(
  "The AI Tutor Lesson coaches students through a proven six-stage framework,",
  PAGE_W / 2, PAGE_H - 110,
  { size: 9.5, color: MUTE, align: "center" }
);
text(
  "with progress measured on five learning dimensions - never on chat volume.",
  PAGE_W / 2, PAGE_H - 98,
  { size: 9.5, color: MUTE, align: "center" }
);

// ---- footer band -------------------------------------------------------------
fill(SLATE, 0, PAGE_H - 74, PAGE_W, 74);
fill(AMBER, 0, PAGE_H - 74, PAGE_W, 2);

text(
  "Every AI session is reviewed by a human before it counts.",
  PAGE_W / 2, PAGE_H - 46,
  { size: 11, color: WHITE, style: "bold", align: "center" }
);
text(
  "curioquest.com   |   info@curioquest.com",
  PAGE_W / 2, PAGE_H - 26,
  { size: 10, color: AMBER, align: "center" }
);

// ---- write -------------------------------------------------------------------
if (doc.getNumberOfPages() !== 1) {
  throw new Error(`Layout overflowed to ${doc.getNumberOfPages()} pages - shrink copy`);
}
doc.save(OUT);
console.log(`Wrote ${OUT}`);
