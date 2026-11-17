from __future__ import annotations

import html
import re
from pathlib import Path
from typing import Iterable

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable,
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs" / "mechanix"
OUTPUT = DOCS_DIR / "MechaniX_Updated_Proposal.pdf"

SOURCE_FILES = [
    ("PRD.md", "Unified Product Requirements"),
    ("GAP_ANALYSIS.md", "Current Platform Gap Analysis"),
    ("DATA_ARCHITECTURE.md", "Data Architecture Recommendation"),
    ("PROJECT_PLAN.md", "Delivery Plan, Timeline, and Costs"),
    ("MOCK_SCREEN_SPEC.md", "Mock Screen and UX Specification"),
]

PAGE_WIDTH, PAGE_HEIGHT = LETTER
MARGIN = 0.72 * inch
CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2)
FOREST = colors.HexColor("#0B3D2E")
EMERALD = colors.HexColor("#14966B")
LIGHT_GREEN = colors.HexColor("#EAF5EF")
LIGHT_NEUTRAL = colors.HexColor("#F3F7F4")
BORDER = colors.HexColor("#D8E3DD")
TEXT = colors.HexColor("#182621")
MUTED = colors.HexColor("#5D7069")


def build_styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "cover_label": ParagraphStyle(
            "CoverLabel",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=14,
            textColor=EMERALD,
            alignment=TA_CENTER,
            spaceAfter=12,
        ),
        "cover_title": ParagraphStyle(
            "CoverTitle",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=32,
            leading=38,
            textColor=FOREST,
            alignment=TA_CENTER,
            spaceAfter=16,
        ),
        "cover_subtitle": ParagraphStyle(
            "CoverSubtitle",
            parent=base["Normal"],
            fontSize=14,
            leading=21,
            textColor=MUTED,
            alignment=TA_CENTER,
            spaceAfter=22,
        ),
        "h1": ParagraphStyle(
            "MechanixH1",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=27,
            textColor=FOREST,
            spaceBefore=10,
            spaceAfter=12,
        ),
        "h2": ParagraphStyle(
            "MechanixH2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=19,
            textColor=FOREST,
            spaceBefore=13,
            spaceAfter=7,
        ),
        "h3": ParagraphStyle(
            "MechanixH3",
            parent=base["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=11.5,
            leading=15,
            textColor=TEXT,
            spaceBefore=10,
            spaceAfter=5,
        ),
        "body": ParagraphStyle(
            "MechanixBody",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9.4,
            leading=13.5,
            textColor=TEXT,
            spaceAfter=6,
        ),
        "body_small": ParagraphStyle(
            "MechanixBodySmall",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=8.2,
            leading=11,
            textColor=TEXT,
        ),
        "bullet": ParagraphStyle(
            "MechanixBullet",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9.2,
            leading=13,
            leftIndent=18,
            firstLineIndent=-10,
            textColor=TEXT,
            spaceAfter=4,
        ),
        "quote": ParagraphStyle(
            "MechanixQuote",
            parent=base["BodyText"],
            fontName="Helvetica-Oblique",
            fontSize=9.5,
            leading=14,
            leftIndent=18,
            borderColor=EMERALD,
            borderWidth=0,
            borderPadding=6,
            textColor=FOREST,
            backColor=LIGHT_GREEN,
            spaceBefore=4,
            spaceAfter=8,
        ),
        "doc_kicker": ParagraphStyle(
            "DocumentKicker",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8.5,
            leading=11,
            textColor=EMERALD,
            spaceAfter=5,
        ),
        "doc_title": ParagraphStyle(
            "DocumentTitle",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=24,
            leading=29,
            textColor=FOREST,
            spaceAfter=14,
        ),
        "code": ParagraphStyle(
            "MechanixCode",
            parent=base["Code"],
            fontName="Courier",
            fontSize=7.3,
            leading=9.2,
            leftIndent=10,
            rightIndent=10,
            backColor=colors.HexColor("#F2F4F3"),
            borderColor=BORDER,
            borderWidth=0.4,
            borderPadding=6,
            spaceBefore=6,
            spaceAfter=8,
        ),
        "signature": ParagraphStyle(
            "Signature",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9,
            leading=13,
            textColor=TEXT,
        ),
        "footer": ParagraphStyle(
            "Footer",
            parent=base["Normal"],
            fontSize=8,
            textColor=MUTED,
            alignment=TA_CENTER,
        ),
    }


def inline_markup(text: str) -> str:
    escaped = html.escape(text.strip())
    escaped = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", escaped)
    escaped = re.sub(r"`([^`]+)`", r'<font face="Courier">\1</font>', escaped)
    escaped = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1", escaped)
    return escaped


def markdown_table(lines: list[str], styles: dict[str, ParagraphStyle]) -> Table:
    rows: list[list[Paragraph]] = []
    for line in lines:
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if cells and all(re.fullmatch(r":?-{3,}:?", cell or "") for cell in cells):
            continue
        rows.append([Paragraph(inline_markup(cell), styles["body_small"]) for cell in cells])

    if not rows:
        return Table([[""]], colWidths=[CONTENT_WIDTH])

    column_count = max(len(row) for row in rows)
    for row in rows:
        while len(row) < column_count:
            row.append(Paragraph("", styles["body_small"]))

    weights = [1.0] * column_count
    if column_count >= 5:
        weights[0] = 1.35
    if column_count >= 8:
        weights = [0.95] * column_count
        weights[0] = 1.35
        weights[-1] = 0.75

    total = sum(weights)
    col_widths = [CONTENT_WIDTH * (weight / total) for weight in weights]
    table = Table(rows, colWidths=col_widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), FOREST),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 7.4),
                ("LEADING", (0, 0), (-1, -1), 9.2),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_NEUTRAL]),
                ("GRID", (0, 0), (-1, -1), 0.35, BORDER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


def markdown_flowables(markdown: str, styles: dict[str, ParagraphStyle]) -> list:
    flowables: list = []
    lines = markdown.splitlines()
    paragraph: list[str] = []
    index = 0
    in_code = False
    code_lines: list[str] = []

    def flush_paragraph() -> None:
        if paragraph:
            text = " ".join(part.strip() for part in paragraph if part.strip())
            if text:
                flowables.append(Paragraph(inline_markup(text), styles["body"]))
            paragraph.clear()

    while index < len(lines):
        line = lines[index]
        stripped = line.strip()

        if stripped.startswith("```"):
            if in_code:
                flowables.append(Preformatted("\n".join(code_lines), styles["code"]))
                code_lines = []
                in_code = False
            else:
                flush_paragraph()
                in_code = True
            index += 1
            continue

        if in_code:
            code_lines.append(line)
            index += 1
            continue

        if stripped.startswith("|") and stripped.endswith("|"):
            flush_paragraph()
            table_lines: list[str] = []
            while index < len(lines) and lines[index].strip().startswith("|"):
                table_lines.append(lines[index])
                index += 1
            flowables.append(markdown_table(table_lines, styles))
            flowables.append(Spacer(1, 8))
            continue

        if not stripped:
            flush_paragraph()
            index += 1
            continue

        if stripped in {"---", "***", "___"}:
            flush_paragraph()
            flowables.append(HRFlowable(width="100%", thickness=0.6, color=BORDER, spaceBefore=8, spaceAfter=10))
            index += 1
            continue

        heading = re.match(r"^(#{1,4})\s+(.+)$", stripped)
        if heading:
            flush_paragraph()
            level = len(heading.group(1))
            text = inline_markup(heading.group(2))
            if level == 1:
                flowables.append(Paragraph(text, styles["h1"]))
            elif level == 2:
                flowables.append(Paragraph(text, styles["h2"]))
            else:
                flowables.append(Paragraph(text, styles["h3"]))
            index += 1
            continue

        if stripped.startswith(">"):
            flush_paragraph()
            quote_lines: list[str] = []
            while index < len(lines) and lines[index].strip().startswith(">"):
                quote_lines.append(lines[index].strip().lstrip(">").strip())
                index += 1
            flowables.append(Paragraph(inline_markup(" ".join(quote_lines)), styles["quote"]))
            continue

        list_item = re.match(r"^([-*•])\s+(.+)$", stripped)
        numbered_item = re.match(r"^(\d+)[.)]\s+(.+)$", stripped)
        if list_item or numbered_item:
            flush_paragraph()
            marker = "•"
            content = ""
            if list_item:
                content = list_item.group(2)
            elif numbered_item:
                marker = f"{numbered_item.group(1)}."
                content = numbered_item.group(2)
            flowables.append(
                Paragraph(
                    inline_markup(content),
                    styles["bullet"],
                    bulletText=marker,
                )
            )
            index += 1
            continue

        paragraph.append(stripped)
        index += 1

    flush_paragraph()
    if code_lines:
        flowables.append(Preformatted("\n".join(code_lines), styles["code"]))
    return flowables


def header_footer(canvas, doc) -> None:  # noqa: ANN001 - reportlab callback types are broad
    canvas.saveState()
    if doc.page > 1:
        canvas.setStrokeColor(BORDER)
        canvas.setLineWidth(0.4)
        canvas.line(MARGIN, PAGE_HEIGHT - 0.48 * inch, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 0.48 * inch)
        canvas.setFont("Helvetica-Bold", 7.5)
        canvas.setFillColor(FOREST)
        canvas.drawString(MARGIN, PAGE_HEIGHT - 0.38 * inch, "MECHANIX UPDATED PLATFORM PROPOSAL")
        canvas.setFont("Helvetica", 7.5)
        canvas.setFillColor(MUTED)
        canvas.drawRightString(PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 0.38 * inch, "Planning document • illustrative estimates")
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawCentredString(PAGE_WIDTH / 2, 0.38 * inch, f"Page {doc.page}")
    canvas.restoreState()


def cover_flowables(styles: dict[str, ParagraphStyle]) -> list:
    return [
        Spacer(1, 1.05 * inch),
        Paragraph("CONFIDENTIAL PLANNING PACKAGE", styles["cover_label"]),
        Paragraph("MechaniX Unified Trading Platform", styles["cover_title"]),
        Paragraph(
            "Updated proposal for trading education, chart practice, community, analytics, simulation, and staged connected-account capabilities.",
            styles["cover_subtitle"],
        ),
        HRFlowable(width="58%", thickness=1.5, color=EMERALD, spaceBefore=10, spaceAfter=24, hAlign="CENTER"),
        Paragraph("Prepared from the current MechaniX product requirements, platform gap analysis, data architecture, delivery plan, and screen specification.", styles["cover_subtitle"]),
        Spacer(1, 0.35 * inch),
        Table(
            [
                ["Document date", "November 15, 2026"],
                ["Proposal status", "Updated planning proposal for approval"],
                ["Prepared by", "Devin / Cognition"],
                ["Source package", "docs/mechanix markdown documents"],
            ],
            colWidths=[1.55 * inch, 4.25 * inch],
            style=TableStyle(
                [
                    ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
                    ("BACKGROUND", (0, 0), (0, -1), LIGHT_GREEN),
                    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                    ("TEXTCOLOR", (0, 0), (-1, -1), TEXT),
                    ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                    ("LEFTPADDING", (0, 0), (-1, -1), 9),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 9),
                    ("TOPPADDING", (0, 0), (-1, -1), 8),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ]
            ),
            hAlign="CENTER",
        ),
        Spacer(1, 0.55 * inch),
        Paragraph(
            "<b>Important:</b> Implementation and hosting figures are planning estimates. Market data, exchange licensing, broker access, prop-firm permissions, legal review, and compliance requirements can change scope, cost, and timing.",
            styles["cover_subtitle"],
        ),
        PageBreak(),
    ]


def contents_flowables(styles: dict[str, ParagraphStyle]) -> list:
    rows: list[list[str]] = [["Section", "Included document", "Purpose"]]
    rows.extend(
        [
            [f"{index}.", filename, label]
            for index, (filename, label) in enumerate(SOURCE_FILES, start=1)
        ]
    )
    table = Table(
        [[Paragraph(inline_markup(cell), styles["body_small"]) for cell in row] for row in rows],
        colWidths=[0.55 * inch, 2.35 * inch, CONTENT_WIDTH - 2.9 * inch],
        repeatRows=1,
        hAlign="LEFT",
    )
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), FOREST),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.35, BORDER),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_NEUTRAL]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    return [
        Paragraph("Proposal Contents", styles["h1"]),
        Paragraph(
            "This consolidated PDF preserves the full contents of the MechaniX markdown planning package and adds an approval sign-off page.",
            styles["body"],
        ),
        table,
        PageBreak(),
    ]


def signature_flowables(styles: dict[str, ParagraphStyle]) -> list:
    signature_rows = [
        ["Client authorized signature", "", "Date", ""],
        ["Printed name", "", "Title", ""],
        ["Company / organization", "", "Email", ""],
        ["MechaniX representative", "", "Date", ""],
        ["Printed name", "", "Title", ""],
    ]
    signature_table = Table(
        signature_rows,
        colWidths=[1.7 * inch, 2.15 * inch, 0.55 * inch, 1.55 * inch],
        rowHeights=[0.43 * inch] * len(signature_rows),
        hAlign="LEFT",
    )
    signature_table.setStyle(
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
        PageBreak(),
        Paragraph("Approval and Sign-off", styles["h1"]),
        Paragraph(
            "By signing below, the authorized client representative confirms that the consolidated MechaniX proposal has been reviewed and approved as the planning baseline for scope, architecture direction, phased delivery, and budget discussions.",
            styles["body"],
        ),
        Spacer(1, 8),
        Paragraph("Approval scope", styles["h2"]),
        Paragraph("• Product requirements and proposed user journeys", styles["bullet"]),
        Paragraph("• Gap-analysis findings and reuse/build decisions", styles["bullet"]),
        Paragraph("• Recommended multi-user, multi-market data architecture", styles["bullet"]),
        Paragraph("• Phase plan, estimated implementation ranges, and hosting scenarios", styles["bullet"]),
        Paragraph("• Mock-screen direction and public design-gallery scope", styles["bullet"]),
        Spacer(1, 14),
        Paragraph("Client approval", styles["h2"]),
        signature_table,
        Spacer(1, 16),
        Paragraph(
            "<b>Note:</b> Signature confirms planning approval only. Binding statements of work, licensing obligations, exchange fees, partner access, security reviews, and compliance terms should be executed separately as each implementation phase is authorized.",
            styles["body"],
        ),
        Spacer(1, 18),
        Paragraph("Approval decision", styles["h2"]),
        Table(
            [
                ["☐ Approved as proposed", "☐ Approved with noted changes", "☐ Revisions required"],
            ],
            colWidths=[CONTENT_WIDTH / 3] * 3,
            style=TableStyle(
                [
                    ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER),
                    ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("TOPPADDING", (0, 0), (-1, -1), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                ]
            ),
        ),
        Spacer(1, 18),
        Paragraph("Requested changes / notes", styles["h2"]),
        Table(
            [["", "", ""], ["", "", ""], ["", "", ""]],
            colWidths=[CONTENT_WIDTH],
            rowHeights=[0.38 * inch] * 3,
            style=TableStyle([("LINEBELOW", (0, 0), (-1, -1), 0.45, BORDER)]),
        ),
    ]


def build_pdf() -> Path:
    styles = build_styles()
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=LETTER,
        rightMargin=MARGIN,
        leftMargin=MARGIN,
        topMargin=0.72 * inch,
        bottomMargin=0.68 * inch,
        title="MechaniX Updated Platform Proposal",
        author="Devin / Cognition",
        subject="Consolidated MechaniX SaaS planning proposal",
    )

    story: list = []
    story.extend(cover_flowables(styles))
    story.extend(contents_flowables(styles))

    for index, (filename, label) in enumerate(SOURCE_FILES):
        source = DOCS_DIR / filename
        markdown = source.read_text(encoding="utf-8")
        story.append(Paragraph(f"SECTION {index + 1}", styles["doc_kicker"]))
        story.append(Paragraph(label, styles["doc_title"]))
        story.append(Paragraph(f"Source: docs/mechanix/{filename}", styles["body_small"]))
        story.append(Spacer(1, 10))
        story.extend(markdown_flowables(markdown, styles))
        if index < len(SOURCE_FILES) - 1:
            story.append(PageBreak())

    story.extend(signature_flowables(styles))
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    return OUTPUT


if __name__ == "__main__":
    output = build_pdf()
    print(output)
