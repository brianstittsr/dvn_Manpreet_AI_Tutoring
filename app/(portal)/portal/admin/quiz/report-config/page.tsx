"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  BarChart3,
  Target,
  Phone,
  Palette,
  Mail,
  Save,
  Loader2,
  Eye,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  query, 
  where, 
  getDocs, 
  limit,
  Timestamp,
} from "firebase/firestore";
import { COLLECTIONS, QuizReportTemplateDoc } from "@/lib/schema";

const TEMPLATE_DOC_ID = "default-template";

const wizardSteps = [
  { id: 1, title: "Executive Summary", icon: FileText, description: "Configure the summary section" },
  { id: 2, title: "Detailed Analysis", icon: BarChart3, description: "Set up analysis sections" },
  { id: 3, title: "Recommendations", icon: Target, description: "Customize action plans" },
  { id: 4, title: "Call to Action", icon: Phone, description: "Configure CTA section" },
  { id: 5, title: "Branding", icon: Palette, description: "Set colors and company info" },
  { id: 6, title: "Email Settings", icon: Mail, description: "Configure email delivery" },
];

const categoryOptions = [
  { value: "independence", label: "Business Independence" },
  { value: "vision", label: "Strategic Vision" },
  { value: "leadership", label: "Leadership & Team" },
  { value: "operations", label: "Systems & Operations" },
  { value: "succession", label: "Succession Planning" },
  { value: "legacy", label: "Legacy Readiness" },
];

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
      ],
      vulnerable: [
        "Develop a clear 3-year vision and share it with your team",
        "Create standard operating procedures for your top 10 recurring tasks",
        "Build a leadership team or identify high-potential employees to develop",
        "Get a professional business valuation to understand your starting point",
      ],
      developing: [
        "Refine your succession plan with specific timelines and candidates",
        "Strengthen your leadership team's decision-making authority",
        "Document and optimize your remaining owner-dependent processes",
        "Align your business strategy with your personal wealth and freedom goals",
      ],
      legacyReady: [
        "Optimize your business for maximum value before any transition",
        "Mentor your successor(s) and gradually transfer more responsibility",
        "Document your leadership philosophy and company culture for posterity",
        "Consider your broader legacy—community impact, industry influence, family wealth",
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

export default function ReportConfigPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [template, setTemplate] = useState(defaultTemplate);

  // Load existing template
  useEffect(() => {
    const loadTemplate = async () => {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, COLLECTIONS.QUIZ_REPORT_TEMPLATES, TEMPLATE_DOC_ID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as QuizReportTemplateDoc;
          setTemplate({ ...defaultTemplate, ...data });
        }
      } catch (error) {
        console.error("Error loading template:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTemplate();
  }, []);

  // Save template
  const saveTemplate = async () => {
    if (!db) {
      toast.error("Database not initialized");
      return;
    }
    setSaving(true);
    try {
      const docRef = doc(db, COLLECTIONS.QUIZ_REPORT_TEMPLATES, TEMPLATE_DOC_ID);
      await setDoc(docRef, {
        ...template,
        updatedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
      });
      toast.success("Report template saved successfully!");
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Error saving template");
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < wizardSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Update nested template values
  const updateTemplate = (path: string, value: any) => {
    setTemplate(prev => {
      const newTemplate = { ...prev };
      const keys = path.split('.');
      let current: any = newTemplate;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newTemplate;
    });
  };

  // Update detailed section
  const updateSection = (sectionId: string, field: string, value: any) => {
    setTemplate(prev => ({
      ...prev,
      detailedSections: prev.detailedSections.map(s =>
        s.id === sectionId ? { ...s, [field]: value } : s
      ),
    }));
  };

  // Update recommendation by level
  const updateRecommendation = (level: string, index: number, value: string) => {
    setTemplate(prev => ({
      ...prev,
      recommendations: {
        ...prev.recommendations,
        byScoreLevel: {
          ...prev.recommendations.byScoreLevel,
          [level]: prev.recommendations.byScoreLevel[level as keyof typeof prev.recommendations.byScoreLevel].map(
            (r, i) => i === index ? value : r
          ),
        },
      },
    }));
  };

  // Add recommendation
  const addRecommendation = (level: string) => {
    setTemplate(prev => ({
      ...prev,
      recommendations: {
        ...prev.recommendations,
        byScoreLevel: {
          ...prev.recommendations.byScoreLevel,
          [level]: [...prev.recommendations.byScoreLevel[level as keyof typeof prev.recommendations.byScoreLevel], ""],
        },
      },
    }));
  };

  // Remove recommendation
  const removeRecommendation = (level: string, index: number) => {
    setTemplate(prev => ({
      ...prev,
      recommendations: {
        ...prev.recommendations,
        byScoreLevel: {
          ...prev.recommendations.byScoreLevel,
          [level]: prev.recommendations.byScoreLevel[level as keyof typeof prev.recommendations.byScoreLevel].filter(
            (_, i) => i !== index
          ),
        },
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push("/portal/admin/quiz")} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quiz Admin
          </Button>
          <h1 className="text-3xl font-bold">Report Template Configuration</h1>
          <p className="text-muted-foreground">
            Customize the PDF report that gets sent to quiz respondents
          </p>
        </div>
        <Button onClick={saveTemplate} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Template
            </>
          )}
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
        {wizardSteps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center ${index < wizardSteps.length - 1 ? 'flex-1' : ''}`}
          >
            <button
              onClick={() => setCurrentStep(step.id)}
              className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                currentStep === step.id
                  ? 'bg-primary text-primary-foreground'
                  : currentStep > step.id
                  ? 'bg-green-500/20 text-green-600'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep > step.id ? 'bg-green-500 text-white' : ''
              }`}>
                {currentStep > step.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
              </div>
              <span className="hidden md:inline text-sm font-medium">{step.title}</span>
            </button>
            {index < wizardSteps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${
                currentStep > step.id ? 'bg-green-500' : 'bg-muted-foreground/20'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => {
              const StepIcon = wizardSteps[currentStep - 1].icon;
              return <StepIcon className="h-5 w-5 text-primary" />;
            })()}
            {wizardSteps[currentStep - 1].title}
          </CardTitle>
          <CardDescription>{wizardSteps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Executive Summary */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label>Enable Executive Summary Section</Label>
                <Switch
                  checked={template.executiveSummary.enabled}
                  onCheckedChange={(checked) => updateTemplate('executiveSummary.enabled', checked)}
                />
              </div>
              
              {template.executiveSummary.enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={template.executiveSummary.title}
                      onChange={(e) => updateTemplate('executiveSummary.title', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Introduction Text</Label>
                    <Textarea
                      value={template.executiveSummary.customIntroText || ''}
                      onChange={(e) => updateTemplate('executiveSummary.customIntroText', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Display Options</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <Label>Show Overall Score</Label>
                        <Switch
                          checked={template.executiveSummary.showOverallScore}
                          onCheckedChange={(checked) => updateTemplate('executiveSummary.showOverallScore', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <Label>Show Key Strengths</Label>
                        <Switch
                          checked={template.executiveSummary.showKeyStrengths}
                          onCheckedChange={(checked) => updateTemplate('executiveSummary.showKeyStrengths', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <Label>Show Development Areas</Label>
                        <Switch
                          checked={template.executiveSummary.showDevelopmentAreas}
                          onCheckedChange={(checked) => updateTemplate('executiveSummary.showDevelopmentAreas', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2: Detailed Analysis Sections */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Configure the detailed analysis sections that appear in the report. Each section corresponds to a quiz category.
              </p>
              
              {template.detailedSections.map((section, index) => (
                <Card key={section.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <Input
                          value={section.title}
                          onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                          className="font-semibold w-64"
                        />
                      </div>
                      <Switch
                        checked={section.enabled}
                        onCheckedChange={(checked) => updateSection(section.id, 'enabled', checked)}
                      />
                    </div>
                  </CardHeader>
                  {section.enabled && (
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select
                            value={section.category}
                            onValueChange={(value) => updateSection(section.id, 'category', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categoryOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Display Order</Label>
                          <Input
                            type="number"
                            value={section.order}
                            onChange={(e) => updateSection(section.id, 'order', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={section.description}
                          onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Step 3: Recommendations */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label>Enable Recommendations Section</Label>
                <Switch
                  checked={template.recommendations.enabled}
                  onCheckedChange={(checked) => updateTemplate('recommendations.enabled', checked)}
                />
              </div>

              {template.recommendations.enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={template.recommendations.title}
                      onChange={(e) => updateTemplate('recommendations.title', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <Label className="text-sm">Prioritized Initiatives</Label>
                      <Switch
                        checked={template.recommendations.showPrioritizedInitiatives}
                        onCheckedChange={(checked) => updateTemplate('recommendations.showPrioritizedInitiatives', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <Label className="text-sm">Implementation Guidance</Label>
                      <Switch
                        checked={template.recommendations.showImplementationGuidance}
                        onCheckedChange={(checked) => updateTemplate('recommendations.showImplementationGuidance', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <Label className="text-sm">Expected Outcomes</Label>
                      <Switch
                        checked={template.recommendations.showExpectedOutcomes}
                        onCheckedChange={(checked) => updateTemplate('recommendations.showExpectedOutcomes', checked)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <h4 className="font-medium">Recommendations by Score Level</h4>
                  
                  {(['critical', 'vulnerable', 'developing', 'legacyReady'] as const).map(level => (
                    <Card key={level} className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant={
                          level === 'critical' ? 'destructive' :
                          level === 'vulnerable' ? 'outline' :
                          level === 'developing' ? 'secondary' : 'default'
                        }>
                          {level === 'legacyReady' ? 'Legacy-Ready' : level.charAt(0).toUpperCase() + level.slice(1)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          ({template.recommendations.byScoreLevel[level].length} recommendations)
                        </span>
                      </div>
                      <div className="space-y-2">
                        {template.recommendations.byScoreLevel[level].map((rec, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Input
                              value={rec}
                              onChange={(e) => updateRecommendation(level, idx, e.target.value)}
                              placeholder="Enter recommendation..."
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeRecommendation(level, idx)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addRecommendation(level)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Recommendation
                        </Button>
                      </div>
                    </Card>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Step 4: Call to Action */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label>Enable Call to Action Section</Label>
                <Switch
                  checked={template.callToAction.enabled}
                  onCheckedChange={(checked) => updateTemplate('callToAction.enabled', checked)}
                />
              </div>

              {template.callToAction.enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={template.callToAction.title}
                      onChange={(e) => updateTemplate('callToAction.title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={template.callToAction.description}
                      onChange={(e) => updateTemplate('callToAction.description', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Button Text</Label>
                      <Input
                        value={template.callToAction.buttonText}
                        onChange={(e) => updateTemplate('callToAction.buttonText', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Button URL</Label>
                      <Input
                        value={template.callToAction.buttonUrl}
                        onChange={(e) => updateTemplate('callToAction.buttonUrl', e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 5: Branding */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={template.branding.companyName}
                    onChange={(e) => updateTemplate('branding.companyName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logo URL</Label>
                  <Input
                    value={template.branding.logoUrl || ''}
                    onChange={(e) => updateTemplate('branding.logoUrl', e.target.value)}
                    placeholder="/logo.png"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={template.branding.primaryColor}
                      onChange={(e) => updateTemplate('branding.primaryColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={template.branding.primaryColor}
                      onChange={(e) => updateTemplate('branding.primaryColor', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={template.branding.secondaryColor}
                      onChange={(e) => updateTemplate('branding.secondaryColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={template.branding.secondaryColor}
                      onChange={(e) => updateTemplate('branding.secondaryColor', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <h4 className="font-medium">Contact Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={template.branding.contactEmail}
                    onChange={(e) => updateTemplate('branding.contactEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input
                    value={template.branding.contactPhone}
                    onChange={(e) => updateTemplate('branding.contactPhone', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  value={template.branding.website}
                  onChange={(e) => updateTemplate('branding.website', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 6: Email Settings */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email Subject</Label>
                  <Input
                    value={template.emailSettings.subject}
                    onChange={(e) => updateTemplate('emailSettings.subject', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>From Name</Label>
                  <Input
                    value={template.emailSettings.fromName}
                    onChange={(e) => updateTemplate('emailSettings.fromName', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reply-To Email</Label>
                <Input
                  type="email"
                  value={template.emailSettings.replyTo}
                  onChange={(e) => updateTemplate('emailSettings.replyTo', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Introduction Text</Label>
                <Textarea
                  value={template.emailSettings.introText}
                  onChange={(e) => updateTemplate('emailSettings.introText', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Signature</Label>
                <Textarea
                  value={template.emailSettings.signatureText}
                  onChange={(e) => updateTemplate('emailSettings.signatureText', e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <div className="flex gap-2">
          {currentStep === wizardSteps.length ? (
            <Button onClick={saveTemplate} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save & Finish
                </>
              )}
            </Button>
          ) : (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
