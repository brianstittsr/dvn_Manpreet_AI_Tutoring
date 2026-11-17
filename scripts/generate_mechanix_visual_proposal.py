from __future__ import annotations

import html
import re
from pathlib import Path
from typing import Iterable

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable,
    Image as RLImage,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs" / "mechanix"
ASSET_DIR = DOCS_DIR / "assets" / "mock-screens"
OUTPUT = DOCS_DIR / "MechaniX_Visual_Proposal.pdf"

PAGE_WIDTH, PAGE_HEIGHT = LETTER
MARGIN = 0.68 * inch
CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2)
FOREST = colors.HexColor("#0B3D2E")
EMERALD = colors.HexColor("#14966B")
LIGHT_GREEN = colors.HexColor("#EAF5EF")
LIGHT_NEUTRAL = colors.HexColor("#F3F7F4")
BORDER = colors.HexColor("#D8E3DD")
TEXT = colors.HexColor("#182621")
MUTED = colors.HexColor("#5D7069")
AMBER = colors.HexColor("#9A6500")
RED = colors.HexColor("#9D3439")


def styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "cover_label": ParagraphStyle("CoverLabel", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=10, leading=14, textColor=EMERALD, alignment=TA_CENTER, spaceAfter=14),
        "cover_title": ParagraphStyle("CoverTitle", parent=base["Title"], fontName="Helvetica-Bold", fontSize=31, leading=37, textColor=FOREST, alignment=TA_CENTER, spaceAfter=18),
        "cover_subtitle": ParagraphStyle("CoverSubtitle", parent=base["Normal"], fontSize=13.5, leading=20, textColor=MUTED, alignment=TA_CENTER, spaceAfter=20),
        "h1": ParagraphStyle("H1", parent=base["Heading1"], fontName="Helvetica-Bold", fontSize=23, leading=28, textColor=FOREST, spaceBefore=4, spaceAfter=12),
        "h2": ParagraphStyle("H2", parent=base["Heading2"], fontName="Helvetica-Bold", fontSize=15, leading=19, textColor=FOREST, spaceBefore=12, spaceAfter=7),
        "h3": ParagraphStyle("H3", parent=base["Heading3"], fontName="Helvetica-Bold", fontSize=11.5, leading=15, textColor=TEXT, spaceBefore=10, spaceAfter=5),
        "body": ParagraphStyle("Body", parent=base["BodyText"], fontName="Helvetica", fontSize=9.5, leading=13.8, textColor=TEXT, spaceAfter=6),
        "small": ParagraphStyle("Small", parent=base["BodyText"], fontName="Helvetica", fontSize=8.1, leading=10.8, textColor=TEXT),
        "muted": ParagraphStyle("Muted", parent=base["BodyText"], fontName="Helvetica", fontSize=9, leading=12.5, textColor=MUTED, spaceAfter=6),
        "bullet": ParagraphStyle("Bullet", parent=base["BodyText"], fontName="Helvetica", fontSize=9.2, leading=13, leftIndent=18, firstLineIndent=-10, textColor=TEXT, spaceAfter=4),
        "callout": ParagraphStyle("Callout", parent=base["BodyText"], fontName="Helvetica", fontSize=9.4, leading=13.5, leftIndent=12, rightIndent=12, borderColor=EMERALD, borderWidth=0, borderPadding=8, backColor=LIGHT_GREEN, textColor=TEXT, spaceBefore=6, spaceAfter=10),
        "warning": ParagraphStyle("Warning", parent=base["BodyText"], fontName="Helvetica", fontSize=9.4, leading=13.5, leftIndent=12, rightIndent=12, borderColor=AMBER, borderWidth=0, borderPadding=8, backColor=colors.HexColor("#FFF7E5"), textColor=TEXT, spaceBefore=6, spaceAfter=10),
        "kicker": ParagraphStyle("Kicker", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor=EMERALD, spaceAfter=5),
        "section_title": ParagraphStyle("SectionTitle", parent=base["Heading1"], fontName="Helvetica-Bold", fontSize=25, leading=30, textColor=FOREST, spaceAfter=14),
        "caption": ParagraphStyle("Caption", parent=base["Normal"], fontName="Helvetica-Oblique", fontSize=8.2, leading=11, textColor=MUTED, spaceBefore=5, spaceAfter=8),
    }


def markup(text: str) -> str:
    escaped = html.escape(text)
    escaped = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", escaped)
    escaped = re.sub(r"`([^`]+)`", r'<font face="Courier">\1</font>', escaped)
    return escaped


def p(text: str, s: dict[str, ParagraphStyle], style: str = "body") -> Paragraph:
    return Paragraph(markup(text), s[style])


def bullets(items: Iterable[str], s: dict[str, ParagraphStyle]) -> list[Paragraph]:
    return [Paragraph(markup(item), s["bullet"], bulletText="•") for item in items]


def simple_table(rows: list[list[str]], s: dict[str, ParagraphStyle], widths: list[float] | None = None, header: bool = True) -> Table:
    table_rows = [[Paragraph(markup(cell), s["small"]) for cell in row] for row in rows]
    col_count = max(len(row) for row in table_rows)
    for row in table_rows:
        while len(row) < col_count:
            row.append(Paragraph("", s["small"]))
    col_widths = widths or [CONTENT_WIDTH / col_count] * col_count
    table = Table(table_rows, colWidths=col_widths, repeatRows=1 if header else 0, hAlign="LEFT")
    commands = [
        ("GRID", (0, 0), (-1, -1), 0.35, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_NEUTRAL]),
    ]
    if header:
        commands.extend([
            ("BACKGROUND", (0, 0), (-1, 0), FOREST),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ])
    table.setStyle(TableStyle(commands))
    return table


def footer(canvas, doc) -> None:  # noqa: ANN001
    canvas.saveState()
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.4)
    canvas.line(MARGIN, PAGE_HEIGHT - 0.45 * inch, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 0.45 * inch)
    canvas.setFont("Helvetica-Bold", 7.4)
    canvas.setFillColor(FOREST)
    canvas.drawString(MARGIN, PAGE_HEIGHT - 0.34 * inch, "MECHANIX VISUAL PRODUCT PROPOSAL")
    canvas.setFont("Helvetica", 7.4)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 0.34 * inch, "Technology-neutral planning document")
    canvas.drawCentredString(PAGE_WIDTH / 2, 0.36 * inch, f"Page {doc.page}")
    canvas.restoreState()


def cover(s: dict[str, ParagraphStyle]) -> list:
    return [
        Spacer(1, 1.0 * inch),
        p("CONFIDENTIAL PLANNING PACKAGE", s, "cover_label"),
        p("MechaniX Visual Product Proposal", s, "cover_title"),
        p("A technology-neutral product, delivery, and UX proposal for trading education, practice, community, analytics, simulation, and future connected-account workflows.", s, "cover_subtitle"),
        HRFlowable(width="58%", thickness=1.5, color=EMERALD, spaceBefore=8, spaceAfter=24, hAlign="CENTER"),
        simple_table(
            [
                ["Document date", "November 15, 2026"],
                ["Proposal status", "Executive visual proposal for approval"],
                ["Basis", "MechaniX consolidated planning package and approved SaaS visual direction"],
            ],
            s,
            widths=[1.55 * inch, CONTENT_WIDTH - 1.55 * inch],
            header=False,
        ),
        Spacer(1, 0.5 * inch),
        p("**Important:** This document intentionally omits implementation-stack names, database objects, field names, schema definitions, credentials, and provider-specific technical detail. Those decisions are reserved for solution architecture and partner-discovery work.", s, "callout"),
        p("Market access, account integrations, data rights, legal review, and compliance requirements may materially change scope and timing.", s, "cover_subtitle"),
        PageBreak(),
    ]


def contents(s: dict[str, ParagraphStyle]) -> list:
    rows = [
        ["Section", "Content"],
        ["1", "Executive summary and product vision"],
        ["2", "Users, roles, and product experience"],
        ["3", "Functional scope and feature requirements"],
        ["4", "Current platform assessment and gap summary"],
        ["5", "Technology-neutral platform architecture"],
        ["6", "Visual mock-screen gallery"],
        ["7", "Delivery plan and timeline"],
        ["8", "Risks and acceptance criteria"],
        ["9", "Approval and signature page"],
    ]
    return [p("Proposal Contents", s, "h1"), simple_table(rows, s, widths=[0.65 * inch, CONTENT_WIDTH - 0.65 * inch]), PageBreak()]


def executive_summary(s: dict[str, ParagraphStyle]) -> list:
    story = [
        p("1. Executive Summary", s, "h1"),
        p("MechaniX is proposed as a unified trading education, practice, community, analytics, and staged connected-trading workspace. The product should let a learner move from guided education to chart practice, coach feedback, journaling, performance review, and controlled live-readiness without switching between disconnected tools.", s),
        p("The proposed platform is organized around four connected outcomes:", s),
        p("• **Learn:** guided curriculum, lessons, quizzes, live sessions, AI-guided activities, downloads, assignments, and level progression.", s, "bullet"),
        p("• **Practice:** chart workspaces, replay, simulated order tickets, zones, notes, saved layouts, alerts, and challenge-style practice accounts.", s, "bullet"),
        p("• **Connect:** community discussion, chart evidence, coach review, mentoring, group activities, and scoped learner visibility.", s, "bullet"),
        p("• **Track and trade:** journals, verified/manual records, performance analytics, account readiness, future approved account connections, order-flow views, scanner results, and copier controls.", s, "bullet"),
        p("The existing platform already provides a strong education foundation: account access, courses, progress tracking, quizzes, certificates, AI-guided lessons, student reporting, payments, notifications, and administrative tooling. The primary gap is the trading product layer: chart practice, market context, simulation, community execution, mentor review, journaling, connected accounts, scanner, and copier workflows.", s),
        p("Recommended delivery remains staged. Education, practice, and community launch first; deeper simulation, journaling, and mentor analytics follow; connected accounts and order capabilities remain behind readiness, partner, security, and compliance gates.", s, "callout"),
        PageBreak(),
    ]
    return story


def product_experience(s: dict[str, ParagraphStyle]) -> list:
    return [
        p("2. Users, Roles, and Product Experience", s, "h1"),
        p("The platform supports one continuous identity across learning, practice, community, journaling, and future trading workflows.", s),
        simple_table(
            [
                ["Persona", "Primary need", "Experience"],
                ["New trader", "Safe guided entry", "Onboarding, mindset, routine, fundamentals, low-risk practice"],
                ["Developing trader", "Repetition and feedback", "Chart tasks, quizzes, coach review, journal, challenge simulation"],
                ["Funded/live trader", "Accountability and analytics", "Verified records, account readiness, rule monitoring, performance review"],
                ["Coach/mentor", "Scoped student visibility", "Review queue, feedback, risk signals, intervention workflow"],
                ["Community member", "Peer learning", "Channels, chart analysis, discussions, reactions, moderation"],
                ["Administrator", "Operational control", "Curriculum, rules, instruments, users, entitlements, audit"],
            ],
            s,
            widths=[1.35 * inch, 2.0 * inch, CONTENT_WIDTH - 3.35 * inch],
        ),
        p("Core product areas", s, "h2"),
        *bullets([
            "**Dashboard:** learning progress, routine, practice tasks, alerts, coach feedback, and account-readiness status.",
            "**Learn:** courses, tracks, lessons, quizzes, exams, assignments, live sessions, AI-guided content, and progression gates.",
            "**Practice:** multi-market charts, drawings, zones, notes, replay, multi-chart layouts, simulated orders, and challenge rules.",
            "**Community:** channel-style discussion, chart posts, group tools, coach identity, moderation, and notifications.",
            "**Journal:** performance analytics, win/loss calendar, trade notes, screenshots, tags, manual/imported/verified labels.",
            "**Trade:** future-state connected accounts, order controls, account health, copier settings, and readiness gates.",
            "**Admin:** curriculum, quiz/exam creation, rules, users, access, integration status, and audit views.",
        ], s),
        PageBreak(),
    ]


def functional_scope(s: dict[str, ParagraphStyle]) -> list:
    return [
        p("3. Functional Scope and Feature Requirements", s, "h1"),
        p("3.1 Guided onboarding and learner journey", s, "h2"),
        *bullets([
            "Capture goals, experience, market interests, preferred schedule, risk acknowledgment, and readiness signals.",
            "Present a MechaniX Foundations track with visible milestones, next lesson, practice task, and coach feedback.",
            "Require defined course, quiz, chart-evidence, and routine criteria before accepting a learner into the next level.",
            "Use one learner profile across all learning, practice, community, and future trading records.",
        ], s),
        p("3.2 Learning, quiz, and exam tools", s, "h2"),
        *bullets([
            "Support video, written lessons, downloads, assignments, live sessions, AI-guided lessons, student interviews, and chart tasks.",
            "Provide quizzes, scenario questions, knowledge checks, group quiz activities, and exam creation tools.",
            "Track progress, attempts, passing criteria, reviews, and completion evidence.",
            "Allow administrators to build question banks, tags, difficulty levels, answer explanations, and publication controls.",
        ], s),
        p("3.3 Chart practice and simulation", s, "h2"),
        *bullets([
            "Provide multi-market charts, timeframes, crosshair, volume, notes, markers, supply/demand zones, drawings, saved layouts, and watchlist links.",
            "Support replay, multi-chart layouts, alert concepts, projected paths, and chart-based task submission.",
            "Provide a simulated order ticket with order type, price, volume, stop loss, take profit, estimated risk, reward, and risk-to-reward.",
            "Separate simulated state visually and structurally from any future live-account state.",
        ], s),
        p("3.4 AI-guided trading and coaching", s, "h2"),
        *bullets([
            "Guide learners through zone identification, freshness, trapped participants, risk planning, and explanation quality.",
            "Provide rubric-based feedback, hints, follow-up questions, and coach-review escalation.",
            "Display educational guidance clearly without presenting it as financial advice or guaranteed trade instruction.",
        ], s),
        p("3.5 Community, mentoring, and coaching responses", s, "h2"),
        *bullets([
            "Provide channel-style discussions inspired by familiar chat experiences, with coach identity, chart attachments, reactions, moderation, and notifications.",
            "Give mentors a scoped learner dashboard with review queues, progress, submissions, journal summaries, and risk signals.",
            "Require explicit learner grants for sensitive performance access; make revocation immediate and auditable.",
        ], s),
        p("3.6 Journal, prop challenge, and performance", s, "h2"),
        *bullets([
            "Track manual, simulated, imported, and verified records separately.",
            "Show net result, win rate, drawdown, profit factor, average risk, equity trend, win/loss calendar, notes, screenshots, and review status.",
            "Support challenge-style rule templates for profit target, daily loss, maximum drawdown, consistency, minimum days, restrictions, and pass/fail outcomes.",
        ], s),
        p("3.7 Future trade workflows", s, "h2"),
        *bullets([
            "Gate live trading behind readiness, partner approval, account ownership, entitlement checks, disclosures, and final acknowledgment.",
            "Support future approved account connections, order status, balances, positions, reconciliation, and execution history.",
            "Provide copier controls for lead/follower setup, sizing, risk limits, pause/resume, discrepancy reporting, and account permissions.",
            "Provide book-map, depth, liquidity, footprint, and large-trade views only where licensed data and approved integrations permit.",
        ], s),
        PageBreak(),
    ]


def gap_summary(s: dict[str, ParagraphStyle]) -> list:
    return [
        p("4. Current Platform Assessment and Gap Summary", s, "h1"),
        simple_table(
            [
                ["Area", "Current state", "Recommended action"],
                ["Learning management", "Strong existing foundation", "Retain and adapt into MechaniX tracks"],
                ["Quizzes and progress", "Available foundation", "Extend with scenarios, group tools, exams, and level acceptance"],
                ["AI-guided learning", "Available foundation", "Adapt to trading-method reasoning and chart evidence"],
                ["Admin and reporting", "Partial foundation", "Extend to coach workflows, rules, instruments, and audit"],
                ["Community", "Minimal implementation", "Build channels, chart posts, replies, moderation, notifications"],
                ["Chart practice", "Not present", "Build full practice workspace"],
                ["Simulation and prop rules", "Not present", "Build staged simulation and challenge engine"],
                ["Journal/track record", "Not present", "Build performance and review system"],
                ["Connected trading", "Not present", "Phase behind readiness, partner, security, and compliance approval"],
                ["Order-flow analytics", "Not present", "Phase behind market-data and licensing validation"],
                ["Scanner and copier", "Not present", "Phase after market context, rules, and partner feasibility"],
            ],
            s,
            widths=[1.45 * inch, 1.75 * inch, CONTENT_WIDTH - 3.2 * inch],
        ),
        p("The fastest safe path is to retain the existing education foundation and introduce the trading workflows as a separate, permissioned product layer. This avoids disrupting the learning platform while keeping trading-sensitive information under stronger controls.", s, "callout"),
        p("5. Technology-Neutral Platform Architecture", s, "h1"),
        p("The architecture should be described in terms of business boundaries rather than named implementation choices at this stage.", s),
        simple_table(
            [
                ["Boundary", "Responsibility"],
                ["Learning workspace", "Courses, progress, quizzes, assignments, AI-guided activities, certificates, and learning reports"],
                ["Community workspace", "Channels, posts, replies, reactions, moderation, chart discussion, and notifications"],
                ["Practice workspace", "Charts, drawings, saved layouts, replay, simulated orders, challenge rules, and alerts"],
                ["Performance workspace", "Journals, imported records, verified labels, notes, metrics, and coach review"],
                ["Account workspace", "Future connected-account readiness, status, orders, positions, balances, and synchronization"],
                ["Market context services", "Instrument catalogs, provider mappings, entitlement-aware market context, and alert evaluation"],
                ["Security and audit services", "Permissions, tenant isolation, access grants, secrets references, audit events, and support controls"],
            ],
            s,
            widths=[1.8 * inch, CONTENT_WIDTH - 1.8 * inch],
        ),
        p("Architecture principles", s, "h2"),
        *bullets([
            "Use a single user identity with clear tenant, role, and ownership boundaries.",
            "Represent instruments consistently across markets while mapping provider-specific identifiers behind the scenes.",
            "Keep simulated, manual, imported, verified, and live records clearly separated and labeled.",
            "Treat financial/account mutations as server-controlled workflows with idempotency, reconciliation, and immutable audit history.",
            "Store credentials only through approved secure secret handling; never expose them to learners, coaches, or administrators.",
            "Version scanner rules, prop rules, disclosures, and educational content so historical evaluations remain explainable.",
            "Separate high-volume market context from account and journal records so performance, retention, and cost can be controlled independently.",
        ], s),
        PageBreak(),
    ]


SCREEN_PAGES = [
    ("01-onboarding.png", "Guided Onboarding", "Goals, experience, market interests, schedule, routine planning, and risk acknowledgment before entering the platform."),
    ("02-practice.png", "MechaniX Practice Workspace", "The primary chart-practice experience: zones, projected path, checklist, community discussion, and simulated order ticket."),
    ("03-quiz.png", "Quiz Experience", "Knowledge-check questions tied to learning progress, coach notes, and module completion."),
    ("04-level-acceptance.png", "Level Acceptance", "Progression gate showing the acceptance criteria for moving to the next MechaniX level."),
    ("05-ai-guided-trading.png", "AI-Guided Trading", "Conversational guided reasoning connected to chart evidence and MechaniX checklist logic."),
    ("06-mentoring.png", "Mentoring Dashboard", "Scoped learner visibility, pending submissions, risk alerts, permissions, and review actions."),
    ("07-coaching-responses.png", "Coach Response Workspace", "Chart evidence review, rubric checks, feedback, approval, and revision requests."),
    ("08-community-chat.png", "Community Chat", "Discord/WhatsApp-like channel discussion with coach badges, chart topics, and familiar messaging workflow."),
    ("09-group-quiz.png", "Group Quiz Tools", "Team-based scenario challenge with shared chart evidence and live leaderboard."),
    ("10-quiz-exam-creator.png", "Quiz & Exam Creator", "Question bank, scenario editing, skill tags, difficulty, answer choices, and publish controls."),
    ("11-simulation-to-live.png", "Simulation to Live Trading", "Readiness checklist and gated switch from simulated workflows to approved live-account workflows."),
    ("12-trade-copier.png", "Trade Copier Setup", "Lead/follower account mapping, sizing controls, risk limits, pause/resume, and discrepancy controls."),
    ("13-bookmap-depth.png", "Book Map & Depth Chart", "Illustrative liquidity heatmap and depth-of-market view for order-flow workflows."),
    ("14-multi-chart.png", "Multi-Chart Workspace", "Synchronized multi-chart layout for comparing instruments and timeframes in one workspace."),
    ("15-prop-challenge-rules.png", "Prop Challenge Rules", "Profit target, daily loss, drawdown, consistency, minimum days, and current challenge status."),
    ("16-win-loss-calendar.png", "Win/Loss Calendar", "Calendar-based performance review with daily results, notes, and journal context."),
]


def visual_gallery(s: dict[str, ParagraphStyle]) -> list:
    story = [
        p("6. Visual Mock-Screen Gallery", s, "h1"),
        p("The following screens are original illustrative mockups generated from the supplied MechaniX SaaS visual direction. They show intended workflows and layout concepts only; they do not represent live data, real accounts, or completed production screens.", s, "warning"),
        PageBreak(),
    ]
    for index, (filename, title, caption) in enumerate(SCREEN_PAGES, start=1):
        image_path = ASSET_DIR / filename
        story.extend(
            [
                p(f"6.{index} {title}", s, "h1"),
                p(caption, s),
                RLImage(str(image_path), width=CONTENT_WIDTH, height=CONTENT_WIDTH * 900 / 1400),
                p("Illustrative SaaS concept screen • no live market data, account data, or execution capability", s, "caption"),
            ]
        )
        if index < len(SCREEN_PAGES):
            story.append(PageBreak())
    story.append(PageBreak())
    return story


def delivery_plan(s: dict[str, ParagraphStyle]) -> list:
    return [
        p("7. Delivery Plan and Timeline", s, "h1"),
        simple_table(
            [
                ["Phase", "Outcome", "Duration"],
                ["0 — Discovery", "Scope, user journeys, market-access research, partner feasibility, security/compliance boundaries", "6–8 weeks"],
                ["1 — Foundation", "MechaniX learning, practice, chart evidence, community, coach workflow", "16–20 weeks"],
                ["2 — Performance", "Deeper simulation, challenge rules, journal, track record, mentor dashboard, alerts", "14–18 weeks"],
                ["3 — Connected pilot", "Approved account connections, verified records, controlled order pilot, reconciliation", "16–24 weeks"],
                ["4 — Advanced", "Order-flow views, scanner, copier, multi-chart depth, production hardening", "20–28 weeks"],
            ],
            s,
            widths=[1.3 * inch, CONTENT_WIDTH - 2.4 * inch, 1.1 * inch],
        ),
        p("Overall timeline", s, "h2"),
        *bullets([
            "Approximately 14–22 months with overlapping workstreams, or 20–28 months if delivered serially.",
            "Each phase is approved separately, with scope confirmed before work begins.",
        ], s),
        PageBreak(),
    ]


def risks_acceptance(s: dict[str, ParagraphStyle]) -> list:
    return [
        p("8. Risks, Controls, and Acceptance Criteria", s, "h1"),
        simple_table(
            [
                ["Risk", "Impact", "Control"],
                ["Scope expansion", "Budget and schedule overrun", "Stage scope and approve each phase separately"],
                ["Market-data/licensing limits", "Features delayed or cost increased", "Validate rights before advanced analytics"],
                ["Partner/API restrictions", "Connected or copied workflows blocked", "Partner discovery before commitment"],
                ["Sensitive-data exposure", "Privacy/compliance issue", "Scoped grants, least privilege, audit history"],
                ["Scanner misinterpretation", "Users treat results as advice", "Educational labels, explanations, legal review"],
                ["Simulation/live confusion", "Incorrect expectations", "Separate modes, explicit warnings, readiness gates"],
                ["Copier discrepancy", "Uneven follower outcomes", "Permission checks, pause controls, discrepancy reporting"],
                ["Data-volume growth", "Slow performance/high cost", "Tiered retention, aggregation, capacity planning"],
            ],
            s,
            widths=[1.65 * inch, 1.7 * inch, CONTENT_WIDTH - 3.35 * inch],
        ),
        p("Acceptance criteria by phase", s, "h2"),
        *bullets([
            "**Phase 1:** learner can complete a lesson, chart task, quiz, discussion, and coach review without live-account claims.",
            "**Phase 2:** challenge rules evaluate correctly, journal metrics reconcile, and mentor access is scoped and auditable.",
            "**Phase 3:** approved account synchronization is reliable, deduplicated, reconciled, and permissioned.",
            "**Phase 4:** scanner results are explainable, advanced market views meet licensed-data requirements, and copier controls can be paused safely.",
        ], s),
        p("Success measures", s, "h2"),
        *bullets([
            "Activation: completed onboarding, first lesson, first practice task, first community contribution.",
            "Learning: lesson completion, quiz pass rate, level acceptance, coach turnaround.",
            "Practice: chart sessions, replay usage, saved layouts, submissions, simulated-order discipline.",
            "Performance: journal completion, verified-record coverage, rule adherence, risk behavior.",
            "Community: participation, coach responses, moderation health, retention.",
        ], s),
        PageBreak(),
    ]


def signature(s: dict[str, ParagraphStyle]) -> list:
    signature_rows = [
        ["Client authorized signature", "", "Date", ""],
        ["Printed name", "", "Title", ""],
        ["Company / organization", "", "Email", ""],
        ["MechaniX representative", "", "Date", ""],
        ["Printed name", "", "Title", ""],
    ]
    table = Table(
        signature_rows,
        colWidths=[1.7 * inch, 2.15 * inch, 0.55 * inch, 1.55 * inch],
        rowHeights=[0.43 * inch] * len(signature_rows),
        hAlign="LEFT",
    )
    table.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
                ("BACKGROUND", (0, 0), (0, -1), LIGHT_GREEN),
                ("BACKGROUND", (2, 0), (2, -1), LIGHT_NEUTRAL),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    return [
        p("9. Approval and Sign-off", s, "h1"),
        p("By signing below, the authorized client representative confirms that this technology-neutral MechaniX visual product proposal has been reviewed and approved as the planning baseline for scope, product direction, and phased delivery.", s),
        p("Approval scope", s, "h2"),
        *bullets([
            "Product requirements and proposed user journeys",
            "Current-platform assessment and staged reuse/build direction",
            "Technology-neutral architecture and security boundaries",
            "Visual mock-screen direction and proposed workflow coverage",
            "Phase plan and delivery timeline",
        ], s),
        Spacer(1, 10),
        p("Client approval", s, "h2"),
        table,
        Spacer(1, 14),
        p("Signature confirms planning approval only. Binding statements of work, licensing obligations, partner access, security reviews, and compliance terms should be executed separately as each implementation phase is authorized.", s, "warning"),
        p("Approval decision", s, "h2"),
        simple_table(
            [["☐ Approved as proposed", "☐ Approved with noted changes", "☐ Revisions required"]],
            s,
            widths=[CONTENT_WIDTH / 3] * 3,
            header=False,
        ),
        Spacer(1, 14),
        p("Requested changes / notes", s, "h2"),
        Table(
            [[""], [""], [""]],
            colWidths=[CONTENT_WIDTH],
            rowHeights=[0.38 * inch] * 3,
            style=TableStyle([("LINEBELOW", (0, 0), (-1, -1), 0.45, BORDER)]),
        ),
    ]


def build_pdf() -> Path:
    s = styles()
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=LETTER,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=0.7 * inch,
        bottomMargin=0.68 * inch,
        title="MechaniX Visual Product Proposal",
        author="Devin / Cognition",
        subject="Technology-neutral MechaniX product and UX proposal",
    )
    story: list = []
    story.extend(cover(s))
    story.extend(contents(s))
    story.extend(executive_summary(s))
    story.extend(product_experience(s))
    story.extend(functional_scope(s))
    story.extend(gap_summary(s))
    story.extend(visual_gallery(s))
    story.extend(delivery_plan(s))
    story.extend(risks_acceptance(s))
    story.extend(signature(s))
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    return OUTPUT


if __name__ == "__main__":
    output = build_pdf()
    print(output)
