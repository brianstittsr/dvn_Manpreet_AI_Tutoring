import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS, QuizReportTemplateDoc } from "@/lib/schema";
import nodemailer from "nodemailer";
import { rateLimit } from "@/lib/rate-limit";

// Default report template if none configured
const defaultTemplate: Omit<QuizReportTemplateDoc, 'id' | 'createdAt' | 'updatedAt'> = {
  name: "Default Template",
  isActive: true,
  executiveSummary: {
    enabled: true,
    title: "Executive Summary",
    showOverallScore: true,
    showKeyStrengths: true,
    showDevelopmentAreas: true,
    customIntroText: "Thank you for completing the Legacy Growth IQ Assessment. This comprehensive report analyzes your business's readiness for sustainable growth and legacy building.",
  },
  detailedSections: [
    {
      id: "vision",
      title: "Vision & Values Alignment",
      enabled: true,
      order: 1,
      category: "vision",
      description: "Evaluates how well your organization's current practices align with its stated mission and future goals.",
      scoringCriteria: {
        low: { min: 0, max: 39, label: "Needs Attention", description: "Your vision may not be clearly defined or communicated across the organization." },
        medium: { min: 40, max: 69, label: "Developing", description: "You have a vision but it may not be fully integrated into daily operations." },
        high: { min: 70, max: 100, label: "Strong", description: "Your vision is clear, communicated, and drives organizational decisions." },
      },
    },
    {
      id: "independence",
      title: "Business Independence",
      enabled: true,
      order: 2,
      category: "independence",
      description: "Assesses your business's ability to operate without your constant involvement.",
      scoringCriteria: {
        low: { min: 0, max: 39, label: "Owner-Dependent", description: "The business relies heavily on your daily involvement for key operations." },
        medium: { min: 40, max: 69, label: "Transitioning", description: "Some systems exist but you're still essential for many decisions." },
        high: { min: 70, max: 100, label: "Self-Sustaining", description: "The business can operate effectively without your constant presence." },
      },
    },
    {
      id: "leadership",
      title: "Leadership & Team Development",
      enabled: true,
      order: 3,
      category: "leadership",
      description: "Evaluates how the organization invests in its people and leverages talent effectively.",
      scoringCriteria: {
        low: { min: 0, max: 39, label: "Limited", description: "Leadership capacity is concentrated and team development is minimal." },
        medium: { min: 40, max: 69, label: "Growing", description: "Some leadership development exists but more investment is needed." },
        high: { min: 70, max: 100, label: "Robust", description: "Strong leadership team with clear development pathways." },
      },
    },
    {
      id: "operations",
      title: "Systems & Operations",
      enabled: true,
      order: 4,
      category: "operations",
      description: "Assessment of documented processes, data usage, and operational efficiency.",
      scoringCriteria: {
        low: { min: 0, max: 39, label: "Informal", description: "Most processes exist only in people's heads with minimal documentation." },
        medium: { min: 40, max: 69, label: "Partial", description: "Some documentation exists but gaps remain in critical areas." },
        high: { min: 70, max: 100, label: "Systematic", description: "Well-documented processes that enable consistent execution." },
      },
    },
    {
      id: "succession",
      title: "Succession Planning",
      enabled: true,
      order: 5,
      category: "succession",
      description: "Analysis of your readiness for ownership transition or exit.",
      scoringCriteria: {
        low: { min: 0, max: 39, label: "Unprepared", description: "No succession plan exists, leaving the business vulnerable." },
        medium: { min: 40, max: 69, label: "In Progress", description: "Some planning has begun but key elements are missing." },
        high: { min: 70, max: 100, label: "Prepared", description: "Clear succession strategy with identified successors and timeline." },
      },
    },
    {
      id: "legacy",
      title: "Legacy Readiness",
      enabled: true,
      order: 6,
      category: "legacy",
      description: "Evaluation of your business's ability to create lasting impact beyond your tenure.",
      scoringCriteria: {
        low: { min: 0, max: 39, label: "At Risk", description: "The business's legacy is uncertain without significant changes." },
        medium: { min: 40, max: 69, label: "Building", description: "Foundation exists but more work needed to secure your legacy." },
        high: { min: 70, max: 100, label: "Secured", description: "Your business is positioned to create lasting impact." },
      },
    },
  ],
  recommendations: {
    enabled: true,
    title: "Recommendations & Action Plan",
    showPrioritizedInitiatives: true,
    showImplementationGuidance: true,
    showExpectedOutcomes: true,
    byScoreLevel: {
      critical: [
        "Immediately document your most critical processes and client relationships",
        "Identify and begin developing at least one key person who could step up",
        "Create a basic emergency operations plan",
        "Schedule a strategy session to assess your biggest vulnerabilities",
        "Consider what would happen to your family if something happened to you tomorrow",
      ],
      vulnerable: [
        "Develop a clear 3-year vision and share it with your team",
        "Create standard operating procedures for your top 10 recurring tasks",
        "Build a leadership team or identify high-potential employees to develop",
        "Get a professional business valuation to understand your starting point",
        "Implement weekly strategic planning time (work ON the business)",
      ],
      developing: [
        "Refine your succession plan with specific timelines and candidates",
        "Strengthen your leadership team's decision-making authority",
        "Document and optimize your remaining owner-dependent processes",
        "Align your business strategy with your personal wealth and freedom goals",
        "Consider what 'legacy' truly means to you beyond financial value",
      ],
      legacyReady: [
        "Optimize your business for maximum value before any transition",
        "Mentor your successor(s) and gradually transfer more responsibility",
        "Document your leadership philosophy and company culture for posterity",
        "Consider your broader legacy—community impact, industry influence, family wealth",
        "Enjoy the freedom you've earned while staying engaged strategically",
      ],
    },
  },
  callToAction: {
    enabled: true,
    title: "Ready to Build Your Legacy?",
    description: "Schedule a free 30-minute strategy call to discuss your results and create a personalized action plan for your business.",
    buttonText: "Schedule Your Free Call",
    buttonUrl: "https://curioquest.com/schedule-a-call",
  },
  branding: {
    logoUrl: "/curioquest-logo.svg",
    primaryColor: "#D97706",
    secondaryColor: "#1E293B",
    companyName: "CurioQuest",
    contactEmail: "info@curioquest.com",
    contactPhone: "(513) 335-1978",
    website: "https://curioquest.com",
  },
  emailSettings: {
    subject: "Your Legacy Growth IQ Assessment Results",
    fromName: "CurioQuest",
    replyTo: "info@curioquest.com",
    introText: "Thank you for completing the Legacy Growth IQ Assessment! Attached is your personalized report with insights and recommendations for building a sustainable business legacy.",
    signatureText: "Best regards,\nThe CurioQuest Team",
  },
};

interface QuizSubmissionCategoryScore {
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
}

interface QuizSubmissionData {
  respondentName?: string;
  respondentEmail?: string;
  respondentCompany?: string;
  respondentPhone?: string;
  totalScore?: number;
  maxScore?: number;
  percentage?: number;
  scoreLevel: string;
  categoryScores?: QuizSubmissionCategoryScore[];
}

// Generate HTML for PDF report
function generateReportHTML(
  submission: QuizSubmissionData,
  template: Omit<QuizReportTemplateDoc, 'id' | 'createdAt' | 'updatedAt'>
): string {
  const { branding, executiveSummary, detailedSections, recommendations, callToAction } = template;
  
  // Determine score level key
  const scoreLevelKey = submission.scoreLevel.toLowerCase().replace(/[- ]/g, '') as 'critical' | 'vulnerable' | 'developing' | 'legacyready';
  const normalizedKey = scoreLevelKey === 'legacyready' ? 'legacyReady' : scoreLevelKey;
  
  // Get category scores map
  const categoryScoresMap: Record<string, number> = {};
  (submission.categoryScores || []).forEach((cat: QuizSubmissionCategoryScore) => {
    categoryScoresMap[cat.category] = cat.percentage;
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Legacy Growth IQ Assessment Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      line-height: 1.6; 
      color: #333;
      background: #fff;
    }
    .container { max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { 
      text-align: center; 
      padding: 30px 0; 
      border-bottom: 3px solid ${branding.primaryColor};
      margin-bottom: 30px;
    }
    .logo { max-height: 60px; margin-bottom: 20px; }
    .report-title { 
      font-size: 28px; 
      color: ${branding.secondaryColor}; 
      margin-bottom: 10px;
    }
    .report-subtitle { color: #666; font-size: 14px; }
    .recipient-info {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .recipient-info h3 { color: ${branding.secondaryColor}; margin-bottom: 10px; }
    .section { margin-bottom: 40px; }
    .section-title { 
      font-size: 22px; 
      color: ${branding.primaryColor}; 
      border-bottom: 2px solid ${branding.primaryColor};
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .score-circle {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor});
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      margin: 0 auto 20px;
    }
    .score-value { font-size: 48px; font-weight: bold; }
    .score-label { font-size: 14px; opacity: 0.9; }
    .score-level {
      text-align: center;
      padding: 15px;
      border-radius: 8px;
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .level-critical { background: #fee2e2; color: #dc2626; }
    .level-vulnerable { background: #ffedd5; color: #ea580c; }
    .level-developing { background: #fef3c7; color: #d97706; }
    .level-legacyready { background: #dcfce7; color: #16a34a; }
    .strengths-weaknesses {
      display: flex;
      gap: 20px;
      margin-top: 20px;
    }
    .strength-box, .weakness-box {
      flex: 1;
      padding: 20px;
      border-radius: 8px;
    }
    .strength-box { background: #dcfce7; border-left: 4px solid #16a34a; }
    .weakness-box { background: #fee2e2; border-left: 4px solid #dc2626; }
    .strength-box h4 { color: #16a34a; }
    .weakness-box h4 { color: #dc2626; }
    .category-item {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 15px;
      border-left: 4px solid ${branding.primaryColor};
    }
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .category-title { font-weight: bold; color: ${branding.secondaryColor}; }
    .category-score { 
      background: ${branding.primaryColor}; 
      color: white; 
      padding: 5px 15px; 
      border-radius: 20px;
      font-weight: bold;
    }
    .progress-bar {
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin: 10px 0;
    }
    .progress-fill {
      height: 100%;
      background: ${branding.primaryColor};
      border-radius: 4px;
    }
    .recommendation-list {
      list-style: none;
      padding: 0;
    }
    .recommendation-list li {
      padding: 15px 15px 15px 50px;
      background: #f8f9fa;
      margin-bottom: 10px;
      border-radius: 8px;
      position: relative;
    }
    .recommendation-list li::before {
      content: "✓";
      position: absolute;
      left: 15px;
      color: ${branding.primaryColor};
      font-weight: bold;
      font-size: 18px;
    }
    .cta-section {
      background: linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor});
      color: white;
      padding: 40px;
      border-radius: 12px;
      text-align: center;
      margin-top: 40px;
    }
    .cta-section h3 { font-size: 24px; margin-bottom: 15px; }
    .cta-section p { margin-bottom: 20px; opacity: 0.9; }
    .cta-button {
      display: inline-block;
      background: white;
      color: ${branding.primaryColor};
      padding: 15px 40px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      font-size: 16px;
    }
    .footer {
      text-align: center;
      padding: 30px 0;
      border-top: 1px solid #e5e7eb;
      margin-top: 40px;
      color: #666;
      font-size: 14px;
    }
    .footer a { color: ${branding.primaryColor}; }
    @media print {
      .container { padding: 20px; }
      .cta-section { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <img src="${branding.logoUrl}" alt="${branding.companyName}" class="logo" />
      <h1 class="report-title">Legacy Growth IQ™ Assessment Report</h1>
      <p class="report-subtitle">Prepared for ${submission.respondentName || 'Business Owner'} | ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <!-- Recipient Info -->
    <div class="recipient-info">
      <h3>Assessment Details</h3>
      <p><strong>Name:</strong> ${submission.respondentName || 'Not provided'}</p>
      <p><strong>Company:</strong> ${submission.respondentCompany || 'Not provided'}</p>
      <p><strong>Email:</strong> ${submission.respondentEmail || 'Not provided'}</p>
      <p><strong>Assessment Date:</strong> ${new Date().toLocaleDateString()}</p>
    </div>

    ${executiveSummary.enabled ? `
    <!-- Executive Summary -->
    <div class="section">
      <h2 class="section-title">${executiveSummary.title}</h2>
      ${executiveSummary.customIntroText ? `<p style="margin-bottom: 20px;">${executiveSummary.customIntroText}</p>` : ''}
      
      ${executiveSummary.showOverallScore ? `
      <div class="score-circle">
        <span class="score-value">${submission.totalScore}</span>
        <span class="score-label">of ${submission.maxScore}</span>
      </div>
      <div class="score-level level-${submission.scoreLevel.toLowerCase().replace(/[- ]/g, '')}">
        ${submission.scoreLevel} Level - ${submission.percentage}%
      </div>
      ` : ''}

      ${executiveSummary.showKeyStrengths || executiveSummary.showDevelopmentAreas ? `
      <div class="strengths-weaknesses">
        ${executiveSummary.showKeyStrengths ? `
        <div class="strength-box">
          <h4>Key Strength</h4>
          <p>${getTopCategory(submission.categoryScores, 'high')}</p>
        </div>
        ` : ''}
        ${executiveSummary.showDevelopmentAreas ? `
        <div class="weakness-box">
          <h4>Priority Development Area</h4>
          <p>${getTopCategory(submission.categoryScores, 'low')}</p>
        </div>
        ` : ''}
      </div>
      ` : ''}
    </div>
    ` : ''}

    <!-- Detailed Analysis -->
    <div class="section">
      <h2 class="section-title">Detailed Analysis</h2>
      ${detailedSections
        .filter(s => s.enabled)
        .sort((a, b) => a.order - b.order)
        .map(section => {
          const score = categoryScoresMap[section.category] || 0;
          const criteria = score < 40 ? section.scoringCriteria.low 
            : score < 70 ? section.scoringCriteria.medium 
            : section.scoringCriteria.high;
          return `
          <div class="category-item">
            <div class="category-header">
              <span class="category-title">${section.title}</span>
              <span class="category-score">${score}%</span>
            </div>
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">${section.description}</p>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${score}%"></div>
            </div>
            <p><strong>${criteria.label}:</strong> ${criteria.description}</p>
          </div>
          `;
        }).join('')}
    </div>

    ${recommendations.enabled ? `
    <!-- Recommendations -->
    <div class="section">
      <h2 class="section-title">${recommendations.title}</h2>
      
      ${recommendations.showPrioritizedInitiatives ? `
      <h3 style="margin-bottom: 15px; color: ${branding.secondaryColor};">Prioritized Initiatives</h3>
      <ul class="recommendation-list">
        ${(recommendations.byScoreLevel[normalizedKey as keyof typeof recommendations.byScoreLevel] || recommendations.byScoreLevel.developing)
          .map(rec => `<li>${rec}</li>`).join('')}
      </ul>
      ` : ''}

      ${recommendations.showImplementationGuidance ? `
      <h3 style="margin: 30px 0 15px; color: ${branding.secondaryColor};">Implementation Guidance</h3>
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
        <p><strong>Start Small:</strong> Focus on one initiative at a time to build momentum.</p>
        <p style="margin-top: 10px;"><strong>Set Milestones:</strong> Break larger goals into 90-day sprints with measurable outcomes.</p>
        <p style="margin-top: 10px;"><strong>Get Support:</strong> Consider working with a business advisor or coach for accountability.</p>
      </div>
      ` : ''}

      ${recommendations.showExpectedOutcomes ? `
      <h3 style="margin: 30px 0 15px; color: ${branding.secondaryColor};">Expected Outcomes</h3>
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e;">
        <p>By implementing these recommendations, you can expect:</p>
        <ul style="margin-top: 10px; margin-left: 20px;">
          <li>Increased business value and marketability</li>
          <li>Greater personal freedom and reduced owner dependency</li>
          <li>Clearer path to succession or exit</li>
          <li>Stronger leadership team and organizational resilience</li>
        </ul>
      </div>
      ` : ''}
    </div>
    ` : ''}

    ${callToAction.enabled ? `
    <!-- Call to Action -->
    <div class="cta-section">
      <h3>${callToAction.title}</h3>
      <p>${callToAction.description}</p>
      <a href="${callToAction.buttonUrl}" class="cta-button">${callToAction.buttonText}</a>
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      <p><strong>${branding.companyName}</strong></p>
      <p>${branding.contactEmail} | ${branding.contactPhone}</p>
      <p><a href="${branding.website}">${branding.website}</a></p>
      <p style="margin-top: 15px; font-size: 12px; color: #999;">
        This report is confidential and intended solely for the recipient. 
        © ${new Date().getFullYear()} ${branding.companyName}. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

function getTopCategory(categoryScores: QuizSubmissionCategoryScore[] | undefined, type: 'high' | 'low'): string {
  if (!categoryScores || categoryScores.length === 0) return 'N/A';
  
  const sorted = [...categoryScores].sort((a, b) => 
    type === 'high' ? b.percentage - a.percentage : a.percentage - b.percentage
  );
  
  const categoryLabels: Record<string, string> = {
    independence: "Business Independence",
    vision: "Strategic Vision",
    leadership: "Leadership & Team",
    operations: "Systems & Operations",
    succession: "Succession Planning",
    legacy: "Legacy Readiness",
  };
  
  return categoryLabels[sorted[0]?.category] || sorted[0]?.category || 'N/A';
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { scope: "quiz-report", limit: 5, windowMs: 60_000 });
  if (limited) return limited;
  try {
    const body = await request.json();
    const { submissionId, sendEmail = true } = body;

    if (!submissionId) {
      return NextResponse.json({ error: "Submission ID required" }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    // Get submission data
    const submissionRef = adminDb.collection(COLLECTIONS.QUIZ_SUBMISSIONS).doc(submissionId);
    const submissionSnap = await submissionRef.get();

    if (!submissionSnap.exists) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const submission = { id: submissionSnap.id, ...submissionSnap.data() } as QuizSubmissionData & { id: string };

    // Get active report template or use default
    let template = defaultTemplate;
    try {
      const templatesSnap = await adminDb
        .collection(COLLECTIONS.QUIZ_REPORT_TEMPLATES)
        .where("isActive", "==", true)
        .limit(1)
        .get();
      if (!templatesSnap.empty) {
        const templateData = templatesSnap.docs[0].data() as QuizReportTemplateDoc;
        template = { ...defaultTemplate, ...templateData };
      }
    } catch (e) {
      console.log("Using default template");
    }

    // Generate HTML report
    const reportHTML = generateReportHTML(submission, template);

    // Send email with report
    let emailSent = false;
    if (sendEmail && submission.respondentEmail) {
      try {
        const gmailUser = process.env.GMAIL_SMTP_USER;
        const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

        if (gmailUser && gmailAppPassword) {
          const transporter = nodemailer.createTransport({
            host: process.env.GMAIL_SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.GMAIL_SMTP_PORT) || 587,
            secure: false,
            auth: {
              user: gmailUser,
              pass: gmailAppPassword,
            },
          });

          const { emailSettings, branding } = template;
          const subject = emailSettings.subject || "Your Legacy Growth IQ Assessment Results";
          const fromName = emailSettings.fromName || branding.companyName || "CurioQuest";
          const replyTo = emailSettings.replyTo || branding.contactEmail || "info@curioquest.com";
          const introText = emailSettings.introText || "Thank you for completing the Legacy Growth IQ Assessment! Attached is your personalized report with insights and recommendations for building a sustainable business legacy.";
          const signatureText = emailSettings.signatureText || "Best regards,\nThe CurioQuest Team";

          const introHtml = `<p style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">${introText.replace(/\n/g, "<br/>")}</p>`;
          const signatureHtml = `
            <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #666; padding: 20px 0; border-top: 1px solid #ddd; margin-top: 20px;">
              <p style="white-space: pre-line;">${signatureText}</p>
              <p style="font-size: 12px; margin-top: 20px;">
                <strong>${branding.companyName}</strong><br/>
                ${branding.contactEmail} | ${branding.contactPhone}<br/>
                <a href="${branding.website}">${branding.website}</a>
              </p>
            </div>
          `;

          const emailBody = reportHTML.replace(
            "</body>",
            `${introHtml}\n${signatureHtml}\n</body>`
          );

          const toAddresses = [submission.respondentEmail];
          const internalEmail = "info@curioquest.com";
          if (internalEmail !== submission.respondentEmail) {
            toAddresses.push(internalEmail);
          }

          await transporter.sendMail({
            from: `"${fromName}" <${gmailUser}>`,
            to: toAddresses.join(", "),
            replyTo,
            subject,
            html: emailBody,
          });

          emailSent = true;
          console.log("Quiz report email sent to:", toAddresses.join(", "));
        } else {
          console.error("Gmail SMTP credentials not configured — quiz report email not sent");
        }
      } catch (emailError) {
        console.error("Error sending quiz report email:", emailError);
      }
    }

    // Update submission with report generation timestamp
    await submissionRef.update({
      reportSentAt: Timestamp.now(),
      reportEmailSent: emailSent,
      updatedAt: Timestamp.now(),
    });

    // Return the HTML for PDF generation (client-side) or email
    return NextResponse.json({
      success: true,
      reportHTML,
      submission,
      emailSent,
      template: {
        emailSettings: template.emailSettings,
        branding: template.branding,
      },
    });

  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
