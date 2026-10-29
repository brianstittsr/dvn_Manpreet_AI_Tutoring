/**
 * Feature Visibility System
 * 
 * Controls which features are visible to each role.
 * SuperAdmin can configure visibility per role.
 */

import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

export type UserRole = "superadmin" | "admin" | "team" | "affiliate" | "consultant";

// All available features that can be toggled
export const SIDEBAR_FEATURES = {
  // Navigation
  commandCenter: { label: "Command Center", section: "navigation", href: "/portal/command-center" },
  projects: { label: "Projects", section: "navigation", href: "/portal/projects" },
  affiliates: { label: "Affiliates", section: "navigation", href: "/portal/affiliates" },
  customers: { label: "Customers", section: "navigation", href: "/portal/customers" },
  
  // Work
  apolloSearch: { label: "Apollo Search", section: "work", href: "/portal/apollo-search" },
  documents: { label: "Documents", section: "work", href: "/portal/documents" },
  calendar: { label: "Calendar", section: "work", href: "/portal/calendar" },
  availability: { label: "Availability", section: "work", href: "/portal/availability" },
  meetings: { label: "Meetings", section: "work", href: "/portal/meetings" },
  networking: { label: "Networking", section: "work", href: "/portal/networking" },
  linkedinContent: { label: "LinkedIn Content", section: "work", href: "/portal/linkedin-content" },
  docuseal: { label: "DocuSeal", section: "work", href: "/portal/docuseal" },
  aiWorkforce: { label: "AI Workforce", section: "work", href: "/portal/ai-workforce" },
  proposals: { label: "Proposal Creator", section: "work", href: "/portal/proposals" },
  bugTracker: { label: "Bug Tracker", section: "work", href: "/portal/bug-tracker" },
  svpTools: { label: "SVP Tools", section: "work", href: "/portal/svp-tools" },
  systemDocs: { label: "System Documentation", section: "work", href: "/portal/system-docs" },
  
  // Intelligence
  askIntelledge: { label: "Ask IntellEDGE", section: "intelligence", href: "/portal/ask" },
  
  // Admin
  bookCallLeads: { label: "Book Call Leads", section: "admin", href: "/portal/admin/book-call-leads" },
  teamMembers: { label: "Team Members", section: "admin", href: "/portal/admin/team-members" },
  strategicPartners: { label: "Strategic Partners", section: "admin", href: "/portal/admin/strategic-partners" },
  heroManagement: { label: "Hero Management", section: "admin", href: "/portal/admin/hero" },
  contactPopup: { label: "Contact Popup", section: "admin", href: "/portal/admin/popup" },
  events: { label: "Events", section: "admin", href: "/portal/admin/events" },
  growthIqQuiz: { label: "Growth IQ Quiz", section: "admin", href: "/portal/admin/quiz" },
  imageManager: { label: "Image Manager", section: "admin", href: "/portal/admin/images" },
  bookACall: { label: "Book a Call", section: "admin", href: "/portal/admin/book-a-call" },
  successStories: { label: "Success Stories", section: "admin", href: "/portal/admin/success-stories" },
  academyAdmin: { label: "Academy Admin", section: "admin", href: "/portal/admin/academy" },
  revenueConfig: { label: "Revenue Config", section: "admin", href: "/portal/admin/revenue" },
  pageDesigner: { label: "Page Designer", section: "admin", href: "/portal/admin/page-designer" },
  navigationManager: { label: "Navigation Manager", section: "admin", href: "/portal/admin/navigation" },
  backups: { label: "Backup & Restore", section: "admin", href: "/portal/admin/backups" },
  
  // Initiatives
  initiatives: { label: "Initiatives", section: "initiatives", href: "/portal/admin/initiatives" },
  tbmncSuppliers: { label: "TBMNC Suppliers", section: "initiatives", href: "/portal/admin/initiatives/tbmnc" },
} as const;

export type FeatureKey = keyof typeof SIDEBAR_FEATURES;

// Platform Tools that can be toggled
export const PLATFORM_TOOLS = {
  transcription: { label: "Audio Transcription", description: "Convert audio/video to text" },
  imageGen: { label: "Image Generation", description: "Create images from text" },
  headshot: { label: "AI Headshot Generator", description: "Create professional headshots" },
  youtube: { label: "YouTube Transcriber", description: "Extract YouTube transcripts" },
  tts: { label: "Text-to-Speech", description: "Transform text to audio" },
  crawler: { label: "Web Crawler", description: "Crawl and extract web data" },
  pdfOcr: { label: "PDF Handwriting OCR", description: "Convert handwritten PDFs" },
} as const;

export type PlatformToolKey = keyof typeof PLATFORM_TOOLS;

// Sections that can be toggled
export const SECTIONS = {
  adminFocused: { label: "Admin Focused" },
  navigation: { label: "Navigation" },
  work: { label: "Work" },
  intelligence: { label: "Intelligence" },
  admin: { label: "Admin" },
  initiatives: { label: "Initiatives" },
} as const;

export type SectionKey = keyof typeof SECTIONS;

// Default visibility settings per role
export const DEFAULT_ROLE_VISIBILITY: Record<UserRole, {
  features: Record<FeatureKey, boolean>;
  sections: Record<SectionKey, boolean>;
  platformTools: Record<PlatformToolKey, boolean>;
}> = {
  superadmin: {
    features: Object.keys(SIDEBAR_FEATURES).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<FeatureKey, boolean>),
    sections: Object.keys(SECTIONS).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<SectionKey, boolean>),
    platformTools: Object.keys(PLATFORM_TOOLS).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<PlatformToolKey, boolean>),
  },
  admin: {
    features: Object.keys(SIDEBAR_FEATURES).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<FeatureKey, boolean>),
    sections: Object.keys(SECTIONS).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<SectionKey, boolean>),
    platformTools: Object.keys(PLATFORM_TOOLS).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<PlatformToolKey, boolean>),
  },
  team: {
    features: {
      ...Object.keys(SIDEBAR_FEATURES).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<FeatureKey, boolean>),
      // Hide some admin features for team
      heroManagement: false,
      contactPopup: false,
      growthIqQuiz: false,
    },
    sections: Object.keys(SECTIONS).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<SectionKey, boolean>),
    platformTools: Object.keys(PLATFORM_TOOLS).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<PlatformToolKey, boolean>),
  },
  affiliate: {
    features: {
      commandCenter: true,
      projects: false,
      affiliates: false,
      customers: false,
      apolloSearch: false,
      documents: true,
      calendar: true,
      availability: true,
      meetings: true,
      networking: true,
      linkedinContent: false,
      docuseal: true,
      aiWorkforce: false,
      proposals: true,
      bugTracker: false,
      svpTools: false,
      systemDocs: false,
      askIntelledge: true,
      bookCallLeads: false,
      teamMembers: false,
      strategicPartners: false,
      heroManagement: false,
      contactPopup: false,
      events: false,
      growthIqQuiz: false,
      imageManager: false,
      bookACall: false,
      successStories: false,
      academyAdmin: false,
      revenueConfig: false,
      pageDesigner: false,
      navigationManager: false,
      backups: false,
      initiatives: false,
      tbmncSuppliers: false,
    },
    sections: {
      adminFocused: false,
      navigation: true,
      work: true,
      intelligence: true,
      admin: false,
      initiatives: false,
    },
    platformTools: {
      transcription: true,
      imageGen: false,
      headshot: true,
      youtube: true,
      tts: false,
      crawler: false,
      pdfOcr: true,
    },
  },
  consultant: {
    features: {
      commandCenter: true,
      projects: true,
      affiliates: false,
      customers: true,
      apolloSearch: true,
      documents: true,
      calendar: true,
      availability: true,
      meetings: true,
      networking: true,
      linkedinContent: true,
      docuseal: true,
      aiWorkforce: true,
      proposals: true,
      bugTracker: false,
      svpTools: true,
      systemDocs: true,
      askIntelledge: true,
      bookCallLeads: false,
      teamMembers: false,
      strategicPartners: false,
      heroManagement: false,
      contactPopup: false,
      events: false,
      growthIqQuiz: false,
      imageManager: false,
      bookACall: false,
      successStories: false,
      academyAdmin: false,
      revenueConfig: false,
      pageDesigner: false,
      navigationManager: false,
      backups: false,
      initiatives: false,
      tbmncSuppliers: false,
    },
    sections: {
      adminFocused: false,
      navigation: true,
      work: true,
      intelligence: true,
      admin: false,
      initiatives: false,
    },
    platformTools: Object.keys(PLATFORM_TOOLS).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<PlatformToolKey, boolean>),
  },
};

export interface FeatureVisibilitySettings {
  roleVisibility: Record<UserRole, {
    features: Record<FeatureKey, boolean>;
    sections: Record<SectionKey, boolean>;
    platformTools: Record<PlatformToolKey, boolean>;
  }>;
  updatedAt?: Date;
  updatedBy?: string;
}

const SETTINGS_DOC_ID = "feature-visibility";

// Merge stored role visibility with defaults so newly-added features/sections/tools
// adopt their code-defined default values instead of disappearing for roles with saved settings.
function mergeRoleVisibility(
  stored: FeatureVisibilitySettings["roleVisibility"]
): FeatureVisibilitySettings["roleVisibility"] {
  const merged: FeatureVisibilitySettings["roleVisibility"] = { ...DEFAULT_ROLE_VISIBILITY };

  for (const role of Object.keys(DEFAULT_ROLE_VISIBILITY) as UserRole[]) {
    const storedRole = stored[role];
    if (!storedRole) continue;

    // Legacy keys from before the admin/tools rename, if present in stored data.
    const legacy = storedRole as typeof storedRole & {
      sections?: Record<string, boolean> & { icyFocused?: boolean };
      l83Tools?: Record<PlatformToolKey, boolean>;
    };

    merged[role] = {
      features: { ...DEFAULT_ROLE_VISIBILITY[role].features, ...storedRole.features },
      sections: {
        ...DEFAULT_ROLE_VISIBILITY[role].sections,
        ...legacy.sections,
        adminFocused:
          legacy.sections?.adminFocused ??
          legacy.sections?.icyFocused ??
          DEFAULT_ROLE_VISIBILITY[role].sections.adminFocused,
      },
      platformTools: {
        ...DEFAULT_ROLE_VISIBILITY[role].platformTools,
        ...(storedRole.platformTools ?? legacy.l83Tools),
      },
    };
  }

  return merged;
}

// Get feature visibility settings from Firestore
export async function getFeatureVisibilitySettings(): Promise<FeatureVisibilitySettings> {
  if (!db) {
    return { roleVisibility: DEFAULT_ROLE_VISIBILITY };
  }

  try {
    const docRef = doc(db, COLLECTIONS.PLATFORM_SETTINGS, SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        roleVisibility: mergeRoleVisibility(data.roleVisibility || {}),
        updatedAt: data.updatedAt?.toDate(),
        updatedBy: data.updatedBy,
      };
    }
  } catch (error) {
    console.error("Error fetching feature visibility settings:", error);
  }

  return { roleVisibility: DEFAULT_ROLE_VISIBILITY };
}

// Save feature visibility settings to Firestore
export async function saveFeatureVisibilitySettings(
  settings: FeatureVisibilitySettings,
  updatedBy: string
): Promise<boolean> {
  if (!db) {
    console.error("Firebase not initialized");
    return false;
  }

  try {
    const docRef = doc(db, COLLECTIONS.PLATFORM_SETTINGS, SETTINGS_DOC_ID);
    await setDoc(docRef, {
      roleVisibility: settings.roleVisibility,
      updatedAt: Timestamp.now(),
      updatedBy,
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving feature visibility settings:", error);
    return false;
  }
}

// Subscribe to feature visibility settings changes
export function subscribeToFeatureVisibility(
  callback: (settings: FeatureVisibilitySettings) => void
): () => void {
  if (!db) {
    callback({ roleVisibility: DEFAULT_ROLE_VISIBILITY });
    return () => {};
  }

  const docRef = doc(db, COLLECTIONS.PLATFORM_SETTINGS, SETTINGS_DOC_ID);
  
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback({
        roleVisibility: mergeRoleVisibility(data.roleVisibility || {}),
        updatedAt: data.updatedAt?.toDate(),
        updatedBy: data.updatedBy,
      });
    } else {
      callback({ roleVisibility: DEFAULT_ROLE_VISIBILITY });
    }
  }, (error) => {
    console.error("Error subscribing to feature visibility:", error);
    callback({ roleVisibility: DEFAULT_ROLE_VISIBILITY });
  });
}

// Check if a feature is visible for a role
export function isFeatureVisible(
  featureKey: FeatureKey,
  role: UserRole,
  settings: FeatureVisibilitySettings
): boolean {
  const roleSettings = settings.roleVisibility[role];
  if (!roleSettings) return true;
  
  // Check if the section is visible first
  const feature = SIDEBAR_FEATURES[featureKey];
  const sectionKey = feature.section as SectionKey;
  if (!roleSettings.sections[sectionKey]) return false;
  
  return roleSettings.features[featureKey] ?? true;
}

// Check if a section is visible for a role
export function isSectionVisible(
  sectionKey: SectionKey,
  role: UserRole,
  settings: FeatureVisibilitySettings
): boolean {
  const roleSettings = settings.roleVisibility[role];
  if (!roleSettings) return true;
  return roleSettings.sections[sectionKey] ?? true;
}

// Check if an Platform tool is visible for a role
export function isPlatformToolVisible(
  toolKey: PlatformToolKey,
  role: UserRole,
  settings: FeatureVisibilitySettings
): boolean {
  const roleSettings = settings.roleVisibility[role];
  if (!roleSettings) return true;
  return roleSettings.platformTools[toolKey] ?? true;
}

// Get all visible features for a role
export function getVisibleFeatures(
  role: UserRole,
  settings: FeatureVisibilitySettings
): FeatureKey[] {
  return (Object.keys(SIDEBAR_FEATURES) as FeatureKey[]).filter(
    (key) => isFeatureVisible(key, role, settings)
  );
}

// Get all visible Platform tools for a role
export function getVisiblePlatformTools(
  role: UserRole,
  settings: FeatureVisibilitySettings
): PlatformToolKey[] {
  return (Object.keys(PLATFORM_TOOLS) as PlatformToolKey[]).filter(
    (key) => isPlatformToolVisible(key, role, settings)
  );
}
