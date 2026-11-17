from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "mechanix" / "assets" / "mock-screens"
BOOKMAP_REFERENCE = ROOT / "docs" / "mechanix" / "assets" / "bookmap-liquidity-reference.png"
OUT_DIR.mkdir(parents=True, exist_ok=True)

W, H = 1400, 900
SIDEBAR_W = 215
HEADER_H = 78

FOREST = "#0B3D2E"
DARK = "#0B241D"
EMERALD = "#14966B"
MINT = "#DDF2E8"
BG = "#F3F7F4"
WHITE = "#FFFFFF"
TEXT = "#182621"
MUTED = "#64766F"
BORDER = "#D9E4DE"
RED = "#D95F65"
AMBER = "#D99A26"
SKY = "#3488C8"

FONT_REGULAR = r"C:/Windows/Fonts/arial.ttf"
FONT_BOLD = r"C:/Windows/Fonts/arialbd.ttf"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REGULAR, size)


def rr(draw: ImageDraw.ImageDraw, box, radius=14, fill=WHITE, outline=BORDER, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def text(draw, xy, value, size=18, color=TEXT, bold=False, anchor=None):
    draw.text(xy, value, font=font(size, bold), fill=color, anchor=anchor)


def wrap(draw, value, max_width, size=18, bold=False) -> list[str]:
    words = value.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if draw.textlength(candidate, font=font(size, bold)) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def button(draw, box, label, primary=True):
    fill = EMERALD if primary else WHITE
    color = WHITE if primary else FOREST
    rr(draw, box, 10, fill=fill, outline=EMERALD if primary else BORDER)
    x1, y1, x2, y2 = box
    text(draw, ((x1 + x2) / 2, (y1 + y2) / 2 - 1), label, 15, color, True, "mm")


def pill(draw, box, label, fill=MINT, color=FOREST, outline=None):
    rr(draw, box, 13, fill=fill, outline=outline or fill)
    x1, y1, x2, y2 = box
    text(draw, ((x1 + x2) / 2, (y1 + y2) / 2), label, 12, color, True, "mm")


def progress_bar(draw, box, ratio, fill=EMERALD):
    x1, y1, x2, y2 = box
    rr(draw, box, 5, fill="#E6EEEA", outline="#E6EEEA")
    draw.rounded_rectangle((x1, y1, x1 + (x2 - x1) * ratio, y2), radius=5, fill=fill)


def draw_shell(title: str, active: str, show_progress: bool = False):
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    draw.rectangle((0, 0, W, HEADER_H), fill=WHITE)
    draw.line((0, HEADER_H - 1, W, HEADER_H - 1), fill=BORDER)
    rr(draw, (26, 24, 55, 52), 6, fill=FOREST, outline=FOREST)
    text(draw, (40.5, 38), "M", 17, WHITE, True, "mm")
    text(draw, (65, 38), "Mechani", 25, TEXT, True, "lm")
    text(draw, (153, 38), "X", 25, EMERALD, True, "lm")

    nav = [("Learn", "Learning"), ("Practice", "Practice"), ("Trade", "Trade"), ("Community", "Community")]
    x = 290
    for label, key in nav:
        selected = key == active
        if selected:
            rr(draw, (x, 22, x + 112, 54), 10, fill=MINT, outline=MINT)
        text(draw, (x + 18, 38), label, 15, FOREST if selected else MUTED, True, "lm")
        x += 122
    pill(draw, (1065, 24, 1230, 52), "Concept • illustrative", fill="#FFF7E5", color="#8A5C00", outline="#F0D7A3")
    draw.ellipse((1252, 24, 1284, 56), outline=BORDER, fill=WHITE)
    text(draw, (1268, 40), "•", 24, MUTED, True, "mm")
    draw.ellipse((1300, 24, 1332, 56), fill=MINT)
    text(draw, (1316, 40), "AR", 12, FOREST, True, "mm")

    draw.rectangle((0, HEADER_H, SIDEBAR_W, H), fill=DARK)
    links = ["Dashboard", "Learning", "Markets", "Watchlist", "Community", "Journal", "Scanner", "Settings"]
    y = 105
    for item in links:
        selected = item == active or (active == "Practice" and item == "Dashboard")
        if selected:
            rr(draw, (16, y - 9, SIDEBAR_W - 16, y + 24), 8, fill=EMERALD, outline=EMERALD)
        draw.ellipse((28, y + 2, 40, y + 14), outline="#99BDB0" if not selected else FOREST, width=2)
        text(draw, (52, y + 8), item, 15, FOREST if selected else "#D7E8E1", selected, "lm")
        y += 43

    if show_progress:
        text(draw, (24, 455), "Your Learning Progress", 15, WHITE, True)
        rr(draw, (16, 475, SIDEBAR_W - 16, 570), 12, fill="#102F27", outline="#173D33")
        draw.ellipse((33, 497, 76, 540), outline="#284C43", width=9)
        draw.arc((33, 497, 76, 540), -90, 168, fill=EMERALD, width=9)
        text(draw, (54.5, 518), "72%", 13, WHITE, True, "mm")
        text(draw, (88, 500), "Foundations Track", 14, WHITE, True)
        text(draw, (88, 525), "13 of 18 lessons", 12, "#9CC4B8")
        rr(draw, (16, 585, SIDEBAR_W - 16, 755), 12, fill="#0E2D24", outline="#173D33")
        text(draw, (30, 610), "MechaniX Foundations", 15, WHITE, True)
        steps = ["Trading Mindset", "Market Structure", "Supply & Demand", "Trade Planning", "Risk Management"]
        sy = 642
        for index, step in enumerate(steps):
            fill = EMERALD if index < 3 else "#244940"
            draw.ellipse((30, sy, 43, sy + 13), fill=fill)
            if index < 3:
                text(draw, (36.5, sy + 6), "✓", 10, WHITE, True, "mm")
            text(draw, (52, sy + 7), step, 12, "#D9EAE4", index < 3, "lm")
            sy += 22

    text(draw, (245, 108), title, 30, TEXT, True)
    return img, draw


def chart_candles(draw, box, zones=True, compact=False):
    x1, y1, x2, y2 = box
    rr(draw, box, 10, fill=WHITE, outline=BORDER)
    left, top = x1 + 30, y1 + 22
    right, bottom = x2 - 45, y2 - 30
    for i in range(6):
        yy = top + (bottom - top) * i / 5
        draw.line((left, yy, right, yy), fill="#EDF2EF")
        text(draw, (right + 10, yy), f"{1.0980 - i * .0014:.4f}", 11, MUTED, anchor="lm")
    for i in range(7):
        xx = left + (right - left) * i / 6
        draw.line((xx, top, xx, bottom), fill="#F2F5F3")
    if zones:
        draw.rectangle((left + 310, top + 20, right, top + 85), fill="#FBE7E8", outline="#F0BFC2")
        text(draw, (right - 15, top + 35), "Supply Zone", 12, RED, True, "rm")
        draw.rectangle((left + 260, bottom - 115, right - 80, bottom - 48), fill="#E4F4EA", outline="#BADCC9")
        text(draw, (right - 95, bottom - 102), "Demand Zone", 12, EMERALD, True, "rm")
    values = [0.68, 0.62, 0.58, 0.52, 0.45, 0.38, 0.33, 0.27, 0.22, 0.18, 0.15, 0.12,
              0.18, 0.26, 0.32, 0.39, 0.45, 0.51, 0.58, 0.63, 0.68, 0.72, 0.68, 0.62,
              0.57, 0.52, 0.47, 0.43, 0.48, 0.54]
    count = len(values)
    candle_w = max(5, int((right - left) / count * 0.48))
    for i, ratio in enumerate(values):
        x = left + i * (right - left) / count + candle_w / 2
        open_r = values[i - 1] if i else ratio + 0.02
        close_r = ratio
        high = min(open_r, close_r) - 0.035
        low = max(open_r, close_r) + 0.035
        up = close_r >= open_r
        color = EMERALD if up else RED
        yo = top + (1 - open_r) * (bottom - top)
        yc = top + (1 - close_r) * (bottom - top)
        yh = top + (1 - high) * (bottom - top)
        yl = top + (1 - low) * (bottom - top)
        draw.line((x, yh, x, yl), fill=color, width=2)
        draw.rectangle((x - candle_w / 2, min(yo, yc), x + candle_w / 2, max(yo, yc)), fill=color)
        vol_h = 10 + (i * 17 % 35) * (0.55 if compact else 1)
        draw.rectangle((x - candle_w / 2, bottom + 25 - vol_h, x + candle_w / 2, bottom + 25), fill="#B9C9C2")
    draw.line((left + 560, bottom - 70, right - 35, top + 70), fill=EMERALD, width=3)
    draw.polygon([(right - 35, top + 70), (right - 51, top + 75), (right - 42, top + 88)], fill=EMERALD)


def order_ticket(draw, box):
    rr(draw, box, 14, fill=WHITE, outline=BORDER)
    x1, y1, x2, _ = box
    text(draw, (x1 + 22, y1 + 28), "Order Ticket (EURUSD)", 19, TEXT, True)
    pill(draw, (x2 - 112, y1 + 17, x2 - 18, y1 + 42), "Simulation", fill=MINT)
    button(draw, (x1 + 18, y1 + 58, x1 + 150, y1 + 99), "Buy")
    button(draw, (x1 + 158, y1 + 58, x2 - 18, y1 + 99), "Sell", False)
    fields = [("Order Type", "Limit"), ("Price", "1.0865"), ("Volume (Lots)", "0.50"), ("Stop Loss", "1.0835"), ("Take Profit", "1.0925")]
    fy = y1 + 118
    for label, value in fields:
        text(draw, (x1 + 20, fy), label, 13, MUTED)
        rr(draw, (x1 + 125, fy - 8, x2 - 55, fy + 27), 7, fill=WHITE, outline=BORDER)
        text(draw, (x1 + 137, fy + 9), value, 14, TEXT)
        draw.line((x2 - 39, fy + 10, x2 - 28, fy + 10), fill=MUTED, width=2)
        fy += 47
    rr(draw, (x1 + 18, fy, x2 - 18, fy + 96), 10, fill=BG, outline=BG)
    text(draw, (x1 + 30, fy + 23), "Trade risk", 13, MUTED)
    text(draw, (x2 - 30, fy + 23), "25 pips", 14, TEXT, True, "rm")
    text(draw, (x1 + 30, fy + 51), "Reward (approx.)", 13, MUTED)
    text(draw, (x2 - 30, fy + 51), "60 pips", 14, EMERALD, True, "rm")
    text(draw, (x1 + 30, fy + 77), "Risk / reward", 13, MUTED)
    text(draw, (x2 - 30, fy + 77), "1 : 2.4", 14, EMERALD, True, "rm")
    button(draw, (x1 + 18, fy + 113, x2 - 18, fy + 154), "Place Simulated Order")


def stat_card(draw, box, title, value, detail, color=EMERALD):
    rr(draw, box, 12)
    x1, y1, _, _ = box
    rr(draw, (x1 + 18, y1 + 18, x1 + 55, y1 + 55), 10, fill=MINT, outline=MINT)
    text(draw, (x1 + 36.5, y1 + 36), "●", 18, color, True, "mm")
    text(draw, (x1 + 68, y1 + 20), title, 13, MUTED)
    text(draw, (x1 + 68, y1 + 45), value, 24, TEXT, True)
    text(draw, (x1 + 68, y1 + 73), detail, 11, MUTED)


def save(img: Image.Image, slug: str):
    path = OUT_DIR / f"{slug}.png"
    img.save(path, "PNG", optimize=True)
    return path


def screen_onboarding():
    img, d = draw_shell("Guided Onboarding", "Learning", True)
    rr(d, (245, 150, 915, 800), 18)
    text(d, (275, 190), "Build your trading routine", 25, TEXT, True)
    text(d, (275, 222), "A short readiness flow connects goals, markets, schedule, and risk boundaries.", 16, MUTED)
    steps = ["Welcome and goals", "Experience check", "Market interests", "Routine planning", "Risk acknowledgment"]
    for i, step in enumerate(steps):
        y = 270 + i * 76
        d.ellipse((280, y, 312, y + 32), fill=EMERALD if i < 3 else WHITE, outline=EMERALD)
        text(d, (296, y + 16), "✓" if i < 3 else str(i + 1), 14, WHITE if i < 3 else EMERALD, True, "mm")
        text(d, (330, y + 5), step, 17, TEXT, True)
        text(d, (330, y + 29), "Completed" if i < 3 else "Up next", 13, MUTED)
        if i < 4:
            d.line((296, y + 34, 296, y + 74), fill=BORDER, width=2)
    rr(d, (955, 150, 1320, 800), 18)
    text(d, (985, 190), "Your profile", 22, TEXT, True)
    for idx, (label, value) in enumerate([("Primary market", "Forex"), ("Experience", "Developing"), ("Weekly time", "5 hours"), ("Goal", "Consistent routine")]):
        y = 235 + idx * 74
        text(d, (985, y), label, 13, MUTED)
        rr(d, (985, y + 22, 1290, y + 58), 8, fill=BG, outline=BORDER)
        text(d, (1000, y + 40), value, 15, TEXT, True, "lm")
    button(d, (985, 590, 1290, 642), "Start Foundations")
    text(d, (985, 675), "Privacy and coach visibility are configured before sensitive data is shared.", 13, MUTED)
    return save(img, "01-onboarding")


def screen_practice():
    img, d = draw_shell("Practice Chart — EURUSD", "Practice", True)
    rr(d, (245, 145, 1050, 565), 14)
    pill(d, (265, 165, 350, 194), "EURUSD ▾", fill=WHITE, outline=BORDER)
    for i, tf in enumerate(["1m", "5m", "15m", "1H", "4H", "D"]):
        pill(d, (365 + i * 56, 165, 412 + i * 56, 194), tf, fill=MINT if tf == "1H" else WHITE, outline=BORDER)
    button(d, (805, 160, 885, 198), "Replay", False)
    button(d, (892, 160, 1010, 198), "Indicators", False)
    chart_candles(d, (265, 210, 1030, 545))
    rr(d, (245, 575, 1050, 640), 12)
    for i, label in enumerate(["Analysis", "Trade ideas", "Notes", "Lessons in focus"]):
        pill(d, (265 + i * 135, 590, 382 + i * 135, 622), label, fill=MINT if i == 0 else WHITE, outline=BORDER)
    order_ticket(d, (1065, 145, 1330, 565))
    rr(d, (245, 660, 900, 850), 14)
    text(d, (270, 688), "Community Discussion", 21, TEXT, True)
    for i, item in enumerate(["EURUSD at demand — confirmation plan", "How to mark trapped participants", "Daily routine checklist"]):
        y = 725 + i * 36
        d.ellipse((270, y, 288, y + 18), fill=MINT)
        text(d, (300, y + 9), item, 14, TEXT, False, "lm")
        text(d, (850, y + 9), str(12 + i * 7), 13, MUTED, True, "rm")
    rr(d, (920, 660, 1330, 850), 14)
    text(d, (945, 688), "MechaniX Checklist", 21, TEXT, True)
    checks = ["Zone identified", "Freshness confirmed", "Trapped participants", "Math ≥ 1:2"]
    for i, item in enumerate(checks):
        y = 725 + i * 28
        d.ellipse((945, y, 962, y + 17), fill=EMERALD)
        text(d, (953, y + 8), "✓", 10, WHITE, True, "mm")
        text(d, (974, y + 8), item, 14, TEXT, False, "lm")
    return save(img, "02-practice")


def screen_quiz():
    img, d = draw_shell("Knowledge Check", "Learning")
    rr(d, (245, 150, 925, 800), 18)
    text(d, (280, 195), "Question 4 of 8", 14, MUTED)
    progress_bar(d, (280, 220, 875, 231), 0.5)
    text(d, (280, 270), "Which condition confirms a fresh demand zone?", 26, TEXT, True)
    opts = [
        "Price has returned to the level multiple times",
        "The level caused a strong departure and remains untested",
        "A moving average crosses above the zone",
        "Volume is absent at the level",
    ]
    for i, opt in enumerate(opts):
        y = 335 + i * 80
        rr(d, (280, y, 875, y + 58), 10, fill=MINT if i == 1 else WHITE, outline=EMERALD if i == 1 else BORDER)
        d.ellipse((300, y + 18, 322, y + 40), fill=EMERALD if i == 1 else WHITE, outline=EMERALD if i == 1 else BORDER)
        text(d, (338, y + 29), opt, 15, TEXT, i == 1, "lm")
    button(d, (700, 705, 875, 755), "Submit answer")
    rr(d, (955, 150, 1320, 800), 18)
    text(d, (985, 195), "Quiz progress", 22, TEXT, True)
    for i, (label, ratio) in enumerate([("Mindset", 1.0), ("Structure", 0.75), ("Zones", 0.5), ("Planning", 0.25)]):
        y = 250 + i * 75
        text(d, (985, y), label, 14, TEXT, True)
        progress_bar(d, (985, y + 28, 1290, y + 38), ratio)
    text(d, (985, 585), "Coach note", 17, TEXT, True)
    rr(d, (985, 615, 1290, 725), 10, fill=BG, outline=BORDER)
    text(d, (1000, 637), "Review freshness before attempting the exam simulation.", 14, MUTED)
    return save(img, "03-quiz")


def screen_level_acceptance():
    img, d = draw_shell("Level Acceptance", "Learning")
    rr(d, (390, 150, 1010, 790), 24)
    d.ellipse((650, 205, 750, 305), fill=MINT)
    text(d, (700, 255), "✓", 52, EMERALD, True, "mm")
    text(d, (700, 345), "Foundations Level Approved", 30, TEXT, True, "mm")
    text(d, (700, 385), "You met the readiness requirements for the next MechaniX level.", 16, MUTED, anchor="mm")
    metrics = [("Quiz", "86%"), ("Chart task", "Approved"), ("Routine", "9 days")]
    for i, (label, value) in enumerate(metrics):
        x = 430 + i * 180
        rr(d, (x, 430, x + 155, 515), 12, fill=BG, outline=BORDER)
        text(d, (x + 77, 460), value, 22, FOREST, True, "mm")
        text(d, (x + 77, 488), label, 13, MUTED, anchor="mm")
    text(d, (700, 560), "Unlocked next", 15, MUTED, anchor="mm")
    text(d, (700, 595), "Supply & Demand Application", 24, TEXT, True, "mm")
    button(d, (550, 650, 850, 700), "Continue to Level 2")
    rr(d, (1040, 150, 1320, 790), 18)
    text(d, (1070, 190), "Acceptance criteria", 21, TEXT, True)
    for i, item in enumerate(["Course ≥ 70%", "Quiz ≥ 80%", "Chart evidence approved", "Risk plan accepted"]):
        y = 235 + i * 55
        d.ellipse((1070, y, 1092, y + 22), fill=EMERALD)
        text(d, (1081, y + 11), "✓", 11, WHITE, True, "mm")
        text(d, (1105, y + 11), item, 14, TEXT, False, "lm")
    return save(img, "04-level-acceptance")


def screen_ai_guided():
    img, d = draw_shell("AI-Guided Trading Lesson", "Practice")
    chart_candles(d, (245, 150, 930, 735))
    rr(d, (955, 150, 1320, 735), 18)
    text(d, (985, 190), "MechaniX Guide", 23, TEXT, True)
    messages = [
        ("Guide", "What evidence shows this is a fresh demand zone?"),
        ("You", "Strong departure and no prior retest."),
        ("Guide", "Correct. Now identify where trapped sellers may appear."),
        ("Guide", "Check whether the proposed target gives at least 1:2 risk-to-reward."),
    ]
    y = 235
    for speaker, msg in messages:
        left = 985 if speaker == "Guide" else 1070
        right = 1290 if speaker == "Guide" else 1130
        fill = BG if speaker == "Guide" else MINT
        rr(d, (left, y, right, y + 72), 12, fill=fill, outline=BORDER)
        for j, line in enumerate(wrap(d, msg, right - left - 24, 13)[:3]):
            text(d, (left + 12, y + 19 + j * 17), line, 13, TEXT if speaker == "Guide" else FOREST)
        y += 88
    rr(d, (985, 620, 1290, 675), 10, fill=WHITE, outline=BORDER)
    text(d, (1000, 647), "Ask for a hint or explain your reasoning…", 13, MUTED, anchor="lm")
    button(d, (985, 695, 1290, 730), "Send")
    return save(img, "05-ai-guided-trading")


def screen_mentoring():
    img, d = draw_shell("Mentoring Dashboard", "Community")
    for i, (title, value, detail) in enumerate([("Assigned learners", "24", "6 need review"), ("Pending submissions", "9", "3 chart tasks"), ("Risk alerts", "2", "Oversizing"), ("Avg progress", "64%", "This cohort")]):
        stat_card(d, (245 + i * 270, 150, 500 + i * 270, 250), title, value, detail)
    rr(d, (245, 275, 925, 790), 16)
    text(d, (275, 310), "Learner review queue", 22, TEXT, True)
    students = [("Avery Reed", "72%", "Journal + practice", "Consistent"), ("Jordan Lee", "48%", "Practice only", "Oversizing"), ("Priya Shah", "64%", "Learning + chart tasks", "Needs review"), ("Noah Park", "81%", "Track record", "Ready")]
    for i, (name, progress, scope, status) in enumerate(students):
        y = 360 + i * 90
        d.ellipse((275, y, 317, y + 42), fill=MINT)
        text(d, (296, y + 21), name[:2].upper(), 12, FOREST, True, "mm")
        text(d, (330, y + 8), name, 16, TEXT, True)
        text(d, (330, y + 31), f"Progress {progress} • {scope}", 13, MUTED)
        pill(d, (690, y + 8, 790, y + 34), status, fill="#FFF7E5" if status != "Consistent" else MINT, outline=BORDER)
        button(d, (810, y + 4, 885, y + 39), "Review", False)
    rr(d, (955, 275, 1320, 790), 16)
    text(d, (985, 310), "Permission scope", 21, TEXT, True)
    for i, item in enumerate(["Learning progress", "Practice submissions", "Journal summary", "Private notes — hidden"]):
        y = 355 + i * 55
        d.ellipse((985, y, 1007, y + 22), fill=EMERALD if i < 3 else "#B9C4BF")
        text(d, (1020, y + 11), item, 14, TEXT, False, "lm")
    text(d, (985, 590), "All mentor access is scoped, revocable, and audit-logged.", 14, MUTED)
    button(d, (985, 670, 1290, 720), "Revoke access")
    return save(img, "06-mentoring")


def screen_coaching():
    img, d = draw_shell("Coach Response Workspace", "Community")
    rr(d, (245, 150, 890, 790), 16)
    text(d, (275, 190), "Submitted chart evidence", 22, TEXT, True)
    chart_candles(d, (275, 225, 860, 570), compact=True)
    text(d, (275, 605), "Student explanation", 17, TEXT, True)
    rr(d, (275, 635, 860, 735), 10, fill=BG, outline=BORDER)
    text(d, (295, 658), "Fresh demand at 1.0840–1.0865. Sellers may be trapped below the level. Invalidation is below 1.0835.", 14, TEXT)
    rr(d, (915, 150, 1320, 790), 16)
    text(d, (945, 190), "Coach feedback", 22, TEXT, True)
    rubric = [("Zone identified", True), ("Freshness explained", True), ("Risk defined", True), ("Evidence attached", True)]
    for i, (label, checked) in enumerate(rubric):
        y = 235 + i * 48
        d.ellipse((945, y, 968, y + 23), fill=EMERALD)
        text(d, (956, y + 11), "✓", 11, WHITE, True, "mm")
        text(d, (980, y + 11), label, 14, TEXT, False, "lm")
    text(d, (945, 455), "Response", 15, TEXT, True)
    rr(d, (945, 485, 1290, 655), 10, fill=BG, outline=BORDER)
    text(d, (960, 510), "Good zone identification. Strengthen the explanation of the trapped-seller clue before final approval.", 14, MUTED)
    button(d, (945, 685, 1130, 735), "Request revision", False)
    button(d, (1140, 685, 1290, 735), "Approve")
    return save(img, "07-coaching-responses")


def screen_chat():
    img, d = draw_shell("MechaniX Community Chat", "Community")
    rr(d, (245, 150, 450, 790), 16)
    text(d, (270, 190), "Channels", 21, TEXT, True)
    channels = ["# announcements", "# chart-analysis", "# learning-questions", "# prop-journey", "# trade-planning"]
    for i, ch in enumerate(channels):
        y = 235 + i * 55
        if i == 1:
            rr(d, (265, y - 7, 425, y + 37), 9, fill=MINT, outline=MINT)
        text(d, (282, y + 15), ch, 15, FOREST if i == 1 else TEXT, i == 1, "lm")
    rr(d, (470, 150, 1320, 790), 16)
    text(d, (495, 190), "# chart-analysis", 22, TEXT, True)
    pill(d, (1160, 175, 1290, 205), "32 online", fill=MINT)
    messages = [
        ("AR", "Alex R.", "EURUSD is approaching demand. Waiting for confirmation.", False),
        ("MC", "Maya C.", "Good plan. Check freshness and define invalidation first.", True),
        ("JL", "Jordan L.", "Shared my chart markup for review.", False),
        ("PS", "Priya S.", "Can we run a group checklist review after class?", False),
    ]
    y = 230
    for initials, name, msg, coach in messages:
        d.ellipse((495, y, 535, y + 40), fill=MINT)
        text(d, (515, y + 20), initials, 12, FOREST, True, "mm")
        text(d, (550, y), name, 15, TEXT, True)
        if coach:
            pill(d, (650, y - 3, 710, y + 20), "Coach", fill=MINT)
        rr(d, (550, y + 28, 1200, y + 82), 10, fill=BG, outline=BORDER)
        text(d, (565, y + 55), msg, 14, TEXT, anchor="lm")
        y += 108
    rr(d, (495, 720, 1240, 760), 10, fill=WHITE, outline=BORDER)
    text(d, (510, 740), "Message #chart-analysis", 14, MUTED, anchor="lm")
    button(d, (1240, 715, 1295, 765), "Send")
    return save(img, "08-community-chat")


def screen_group_quiz():
    img, d = draw_shell("Group Quiz Tools", "Learning")
    rr(d, (245, 150, 850, 790), 18)
    text(d, (275, 190), "Live team challenge", 25, TEXT, True)
    text(d, (275, 225), "Question 6 — Identify the highest-quality setup", 17, MUTED)
    chart_candles(d, (275, 260, 820, 505), compact=True)
    answers = ["A", "B", "C", "D"]
    for i, label in enumerate(answers):
        x = 275 + (i % 2) * 275
        y = 535 + (i // 2) * 90
        rr(d, (x, y, x + 245, y + 65), 10, fill=MINT if i == 1 else WHITE, outline=EMERALD if i == 1 else BORDER)
        text(d, (x + 25, y + 32), label, 19, EMERALD if i == 1 else MUTED, True, "mm")
        text(d, (x + 55, y + 32), "Scenario choice", 15, TEXT, False, "lm")
    rr(d, (875, 150, 1320, 790), 18)
    text(d, (905, 190), "Team leaderboard", 23, TEXT, True)
    teams = [("Green Team", 860, "93%"), ("Delta Team", 740, "81%"), ("Zone Team", 710, "78%"), ("Flow Team", 620, "68%")]
    for i, (name, pts, pct) in enumerate(teams):
        y = 245 + i * 90
        text(d, (905, y), name, 16, TEXT, True)
        text(d, (1250, y), f"{pts} pts", 15, FOREST, True, "rm")
        progress_bar(d, (905, y + 28, 1250, y + 40), pts / 900)
        text(d, (905, y + 52), f"Accuracy {pct}", 12, MUTED)
    return save(img, "09-group-quiz")


def screen_quiz_creator():
    img, d = draw_shell("Quiz & Exam Creator", "Admin")
    rr(d, (245, 150, 650, 790), 16)
    text(d, (270, 190), "Question bank", 22, TEXT, True)
    cats = ["Mindset", "Structure", "Supply & Demand", "Risk", "Execution"]
    for i, cat in enumerate(cats):
        y = 235 + i * 62
        rr(d, (270, y, 620, y + 45), 9, fill=MINT if i == 2 else WHITE, outline=BORDER)
        text(d, (285, y + 22), cat, 15, TEXT, i == 2, "lm")
        text(d, (600, y + 22), f"{8 + i * 3}", 13, MUTED, True, "rm")
    button(d, (270, 700, 620, 750), "Add question")
    rr(d, (675, 150, 1320, 790), 16)
    text(d, (705, 190), "New scenario question", 22, TEXT, True)
    fields = [("Question", "Which setup has the best risk-adjusted quality?"), ("Skill tag", "Zone quality"), ("Difficulty", "Intermediate"), ("Passing score", "80%")]
    for i, (label, val) in enumerate(fields):
        y = 235 + i * 72
        text(d, (705, y), label, 13, MUTED)
        rr(d, (705, y + 22, 1290, y + 58), 8, fill=BG, outline=BORDER)
        text(d, (720, y + 40), val, 14, TEXT, False, "lm")
    text(d, (705, 550), "Answer choices", 16, TEXT, True)
    for i in range(3):
        y = 585 + i * 55
        rr(d, (705, y, 1190, y + 40), 8, fill=MINT if i == 1 else WHITE, outline=BORDER)
        text(d, (720, y + 20), f"Choice {chr(65+i)}", 14, TEXT, i == 1, "lm")
        if i == 1:
            pill(d, (1210, y + 5, 1290, y + 35), "Correct", fill=MINT)
    button(d, (1000, 745, 1290, 790), "Publish to exam")
    return save(img, "10-quiz-exam-creator")


def screen_sim_live():
    img, d = draw_shell("Simulation to Live Trading", "Trade")
    rr(d, (245, 150, 775, 790), 18)
    text(d, (275, 190), "Account mode", 23, TEXT, True)
    pill(d, (275, 235, 425, 270), "Simulation", fill=MINT)
    pill(d, (435, 235, 585, 270), "Live", fill="#FFF7E5", color="#8A5C00", outline="#F0D7A3")
    chart_candles(d, (275, 290, 745, 555), compact=True)
    rr(d, (275, 575, 745, 735), 12, fill="#FFF7E5", outline="#F0D7A3")
    text(d, (295, 605), "Live trading is locked", 18, "#8A5C00", True)
    for i, item in enumerate(["Complete partner approval", "Verify account ownership", "Accept risk disclosures", "Pass readiness checklist"]):
        y = 640 + i * 22
        d.ellipse((295, y, 309, y + 14), fill=AMBER if i > 1 else EMERALD)
        text(d, (322, y + 7), item, 13, "#6A4B0D", False, "lm")
    rr(d, (800, 150, 1320, 790), 18)
    text(d, (830, 190), "Readiness checklist", 23, TEXT, True)
    checks = [("Course readiness", True), ("Journal discipline", True), ("Prop rule record", True), ("Account connection", False), ("Partner permissions", False), ("Final acknowledgment", False)]
    for i, (item, ok) in enumerate(checks):
        y = 245 + i * 58
        d.ellipse((830, y, 854, y + 24), fill=EMERALD if ok else "#D8DFDC")
        text(d, (842, y + 12), "✓" if ok else "•", 12, WHITE, True, "mm")
        text(d, (870, y + 12), item, 15, TEXT, False, "lm")
    text(d, (830, 620), "Current status", 15, MUTED)
    text(d, (830, 650), "3 of 6 complete", 24, TEXT, True)
    button(d, (830, 705, 1290, 755), "Continue setup", False)
    return save(img, "11-simulation-to-live")


def screen_trade_copier():
    img, d = draw_shell("Trade Copier Setup", "Trade")
    rr(d, (245, 150, 600, 790), 16)
    text(d, (270, 190), "Lead account", 22, TEXT, True)
    stat_card(d, (270, 225, 575, 335), "Prop Challenge", "$100,000", "Approved source")
    text(d, (270, 370), "Follower accounts", 18, TEXT, True)
    followers = [("Practice USD", "50k", "Copy 0.5x"), ("Evaluation B", "100k", "Copy 1.0x"), ("Personal Demo", "25k", "Paused")]
    for i, (name, bal, rule) in enumerate(followers):
        y = 410 + i * 82
        rr(d, (270, y, 575, y + 62), 10, fill=WHITE, outline=BORDER)
        text(d, (290, y + 18), name, 15, TEXT, True)
        text(d, (290, y + 42), f"Balance {bal} • {rule}", 12, MUTED)
        pill(d, (500, y + 16, 560, y + 44), "On" if i < 2 else "Off", fill=MINT if i < 2 else "#E7ECE9")
    rr(d, (630, 150, 1320, 790), 16)
    text(d, (660, 190), "Copier controls", 22, TEXT, True)
    controls = [("Size multiplier", "0.50x"), ("Maximum daily loss", "2%"), ("Copy direction", "Long + short"), ("Symbol mapping", "Auto-match"), ("Pause on discrepancy", "Enabled")]
    for i, (label, val) in enumerate(controls):
        y = 235 + i * 70
        text(d, (660, y), label, 14, MUTED)
        rr(d, (660, y + 24, 1290, y + 60), 8, fill=BG, outline=BORDER)
        text(d, (675, y + 42), val, 15, TEXT, True, "lm")
    button(d, (660, 650, 930, 705), "Enable copier")
    button(d, (945, 650, 1290, 705), "Pause all", False)
    text(d, (660, 735), "Every copied action includes status, source/follower link, discrepancies, and audit history.", 13, MUTED)
    return save(img, "12-trade-copier")


def screen_bookmap():
    img, d = draw_shell("Book Map & Depth Chart", "Practice")
    rr(d, (245, 150, 860, 790), 16)
    text(d, (275, 190), "Liquidity heatmap — illustrative", 22, TEXT, True)
    x0, y0, x1, y1 = 275, 230, 830, 720
    rr(d, (x0, y0, x1, y1), 8, fill="#10231D", outline="#173D33")
    reference = Image.open(BOOKMAP_REFERENCE).convert("RGB")
    reference.thumbnail((x1 - x0 - 24, y1 - y0 - 24), Image.Resampling.LANCZOS)
    img.paste(reference, (x0 + (x1 - x0 - reference.width) // 2, y0 + (y1 - y0 - reference.height) // 2))
    text(d, (275, 745), "Reference-style liquidity heatmap • bid/ask depth • illustrative only", 13, MUTED)
    rr(d, (885, 150, 1320, 790), 16)
    text(d, (915, 190), "Depth of market", 22, TEXT, True)
    for i in range(12):
        y = 235 + i * 34
        bid = 30 + (11 - i) * 6
        ask = 30 + i * 6
        d.rectangle((915, y, 915 + bid * 3, y + 24), fill=MINT)
        d.rectangle((1290 - ask * 3, y, 1290, y + 24), fill="#F4C7C9")
        text(d, (915 + bid * 3 + 8, y + 12), f"{bid}", 12, EMERALD, True, "lm")
        text(d, (1290 - ask * 3 - 8, y + 12), f"{ask}", 12, RED, True, "rm")
        text(d, (1105, y + 12), f"{1.0870 + (i - 6) * .0002:.4f}", 12, TEXT, True, "mm")
    text(d, (915, 680), "DOM tools require approved level-two data access.", 13, MUTED)
    return save(img, "13-bookmap-depth")


def screen_multi_chart():
    img, d = draw_shell("Multi-Chart Workspace", "Practice")
    positions = [(245, 150, 780, 455), (800, 150, 1320, 455), (245, 475, 780, 790), (800, 475, 1320, 790)]
    labels = ["EURUSD • 15m", "EURUSD • 1H", "GBPUSD • 1H", "NQ • 15m"]
    for i, box in enumerate(positions):
        rr(d, box, 14)
        x1, y1, _, _ = box
        pill(d, (x1 + 20, y1 + 15, x1 + 150, y1 + 43), labels[i], fill=WHITE, outline=BORDER)
        chart_candles(d, (x1 + 15, y1 + 55, box[2] - 15, box[3] - 15), zones=i % 2 == 0, compact=True)
    pill(d, (1080, 105, 1320, 135), "Sync: symbol • timeframe • crosshair", fill=MINT)
    return save(img, "14-multi-chart")


def screen_prop_rules():
    img, d = draw_shell("Prop Challenge Dashboard", "Trade")
    for i, (title, value, detail, color) in enumerate([
        ("Profit target", "4.8% / 8%", "60% complete", EMERALD),
        ("Daily loss", "1.2% / 4%", "Healthy", EMERALD),
        ("Max drawdown", "2.1% / 6%", "Warning at 80%", AMBER),
        ("Trading days", "7 / 10", "3 remaining", SKY),
    ]):
        stat_card(d, (245 + i * 270, 150, 500 + i * 270, 250), title, value, detail, color)
    rr(d, (245, 275, 890, 790), 16)
    text(d, (275, 310), "Rule progress", 23, TEXT, True)
    rules = [("Profit target", .60, EMERALD), ("Daily loss room", .70, EMERALD), ("Drawdown room", .78, AMBER), ("Consistency", .42, SKY), ("Minimum days", .70, EMERALD)]
    for i, (label, ratio, color) in enumerate(rules):
        y = 365 + i * 75
        text(d, (275, y), label, 15, TEXT, True)
        text(d, (850, y), f"{int(ratio*100)}%", 15, color, True, "rm")
        progress_bar(d, (275, y + 28, 850, y + 40), ratio, color)
    rr(d, (915, 275, 1320, 790), 16)
    text(d, (945, 310), "Challenge status", 22, TEXT, True)
    pill(d, (945, 350, 1060, 385), "In progress", fill=MINT)
    status = [("Profit target", "60%"), ("Daily loss", "70% room"), ("Max drawdown", "78% room"), ("Restrictions", "News lock ±2 min")]
    for i, (label, val) in enumerate(status):
        y = 420 + i * 58
        text(d, (945, y), label, 14, MUTED)
        text(d, (1290, y), val, 14, TEXT, True, "rm")
    button(d, (945, 675, 1290, 725), "View rule history")
    return save(img, "15-prop-challenge-rules")


def screen_calendar():
    img, d = draw_shell("Win/Loss Calendar", "Journal")
    for i, (title, value, detail, color) in enumerate([
        ("Net result", "+$1,170", "30-day illustrative", EMERALD),
        ("Win rate", "58%", "24 trades", EMERALD),
        ("Best day", "+$690", "Jan 12", EMERALD),
        ("Worst day", "-$180", "Jan 13", RED),
    ]):
        stat_card(d, (245 + i * 270, 150, 500 + i * 270, 250), title, value, detail, color)
    rr(d, (245, 275, 1100, 790), 16)
    text(d, (275, 310), "January 2026", 22, TEXT, True)
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    for i, day in enumerate(days):
        text(d, (305 + i * 112, 350), day, 13, MUTED, True)
    results = [None, None, 180, -60, 240, None, 0, 0, 95, -30, 420, 120, 0, None, 210, -180, 90, 65, 0, None, 690, 240, -45, 120, 0, None, 0, 310, 80, -20, 55]
    for i in range(35):
        row, col = divmod(i, 7)
        x = 275 + col * 112
        y = 375 + row * 72
        rr(d, (x, y, x + 102, y + 62), 8, fill=BG, outline=BORDER)
        if i < len(results):
            text(d, (x + 10, y + 12), str(i + 1), 12, MUTED)
            val = results[i]
            if val is not None and val != 0:
                color = EMERALD if val > 0 else RED
                text(d, (x + 10, y + 42), f"{'+' if val > 0 else ''}${val}", 14, color, True)
    rr(d, (1120, 275, 1320, 790), 16)
    text(d, (1145, 310), "Review notes", 21, TEXT, True)
    notes = ["Best day followed plan", "Loss day oversize", "Avoid late-session trades", "Journal all screenshots"]
    for i, note in enumerate(notes):
        y = 355 + i * 62
        rr(d, (1145, y, 1290, y + 45), 9, fill=BG, outline=BORDER)
        text(d, (1160, y + 22), note, 13, TEXT, False, "lm")
    return save(img, "16-win-loss-calendar")


def main() -> None:
    generators = [
        screen_onboarding,
        screen_practice,
        screen_quiz,
        screen_level_acceptance,
        screen_ai_guided,
        screen_mentoring,
        screen_coaching,
        screen_chat,
        screen_group_quiz,
        screen_quiz_creator,
        screen_sim_live,
        screen_trade_copier,
        screen_bookmap,
        screen_multi_chart,
        screen_prop_rules,
        screen_calendar,
    ]
    for generator in generators:
        path = generator()
        print(path)


if __name__ == "__main__":
    main()
