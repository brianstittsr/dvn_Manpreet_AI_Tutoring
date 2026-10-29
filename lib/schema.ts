/**
 * Firestore Database Schema for Strategic Value Plus Platform
 * 
 * This file defines the database collections, document structures,
 * and helper types for Firestore integration.
 */

import {
  collection,
  doc,
  CollectionReference,
  DocumentReference,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  User,
  Organization,
  Opportunity,
  Project,
  Meeting,
  ActionItem,
  Document as AppDocument,
  Service,
  Certification,
  Capability,
  Activity,
  Note,
  Milestone,
} from "@/types";

// ============================================================================
// Firestore Document Types (with Timestamp instead of Date)
// ============================================================================

/** Base document fields for all collections */
interface BaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

/** User document in Firestore */
export interface UserDoc extends Omit<User, "createdAt" | "lastActive" | "capabilities"> {
  createdAt: Timestamp;
  lastActive: Timestamp;
  capabilities?: string[]; // Reference IDs to capabilities subcollection
}

/** Organization document in Firestore */
export interface OrganizationDoc extends Omit<Organization, "createdAt" | "contacts" | "capabilities" | "certifications"> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  contactIds?: string[]; // Reference IDs to users
  capabilityIds?: string[]; // Reference IDs
  certificationIds?: string[]; // Reference IDs
}

/** Opportunity document in Firestore */
export interface OpportunityDoc extends Omit<Opportunity, "createdAt" | "updatedAt" | "expectedCloseDate" | "owner" | "assignedAffiliates" | "organization" | "services" | "notes" | "activities"> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expectedCloseDate: Timestamp;
  ownerId: string; // Reference to user
  assignedAffiliateIds?: string[]; // Reference IDs to users
  serviceIds: string[]; // Reference IDs to services
}

/** Project document in Firestore */
export interface ProjectDoc extends Omit<Project, "createdAt" | "startDate" | "endDate" | "team" | "organization" | "milestones" | "documents" | "meetings"> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  startDate: Timestamp;
  endDate?: Timestamp;
  teamIds: string[]; // Reference IDs to users
}

/** Meeting document in Firestore */
export interface MeetingDoc extends Omit<Meeting, "date" | "attendees" | "actionItems"> {
  date: Timestamp;
  attendeeIds: string[]; // Reference IDs to users
}

/** Action Item document in Firestore */
export interface ActionItemDoc extends Omit<ActionItem, "createdAt" | "dueDate" | "assignee"> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  dueDate?: Timestamp;
  assigneeId: string; // Reference to user
}

/** Document/File document in Firestore */
export interface DocumentDoc extends Omit<AppDocument, "createdAt" | "uploadedBy"> {
  createdAt: Timestamp;
  uploadedById: string; // Reference to user
  storagePath: string; // Firebase Storage path
}

/** Enhanced Platform Document for document management system */
export interface PlatformDocumentDoc {
  id: string;
  name: string;
  description?: string;
  
  // File info
  fileType: "pdf" | "docx" | "xlsx" | "pptx" | "image" | "archive" | "other";
  mimeType: string;
  fileSize: number; // bytes
  storagePath: string; // Firebase Storage path
  downloadUrl?: string;
  
  // Folder/Category
  folder: "proposals" | "templates" | "reports" | "agreements" | "projects" | "marketing" | "internal" | "other";
  tags?: string[];
  
  // Source tracking
  source: "upload" | "proposal-creator" | "growth-iq-quiz" | "ai-generated" | "docuseal" | "other";
  sourceId?: string; // ID of the source (e.g., proposal ID, quiz submission ID)
  
  // Versioning
  version: number;
  parentDocumentId?: string; // For version tracking - points to original document
  isLatestVersion: boolean;
  versionNotes?: string;
  
  // Metadata
  metadata: {
    // For proposals
    proposalId?: string;
    proposalTitle?: string;
    clientName?: string;
    
    // For templates
    templateCategory?: string;
    isTemplate?: boolean;
    
    // For GROWTH IQ reports
    quizSubmissionId?: string;
    reportRecipientName?: string;
    reportRecipientEmail?: string;
    reportRecipientCompany?: string;
    quizScore?: number;
    
    // For agreements
    agreementType?: string;
    signedDate?: Timestamp;
    signedBy?: string[];
    expirationDate?: Timestamp;
    
    // For project links
    linkedProjectIds?: string[];
    linkedOrganizationId?: string;
    
    // Custom metadata
    custom?: Record<string, unknown>;
  };
  
  // Access control
  visibility: "private" | "team" | "organization" | "public";
  sharedWith?: string[]; // User IDs
  
  // Audit
  uploadedById: string;
  uploadedByName: string;
  lastModifiedById?: string;
  lastModifiedByName?: string;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Document Version History entry */
export interface DocumentVersionDoc {
  id: string;
  documentId: string; // Parent document ID
  version: number;
  storagePath: string;
  downloadUrl?: string;
  fileSize: number;
  versionNotes?: string;
  createdById: string;
  createdByName: string;
  createdAt: Timestamp;
}

/** AI Document Edit Request */
export interface DocumentAiEditDoc {
  id: string;
  documentId: string;
  requestType: "create" | "edit" | "summarize" | "translate" | "format";
  prompt: string;
  status: "pending" | "processing" | "completed" | "failed";
  resultDocumentId?: string; // New document created from AI edit
  errorMessage?: string;
  requestedById: string;
  requestedByName: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

/** Service document in Firestore */
export interface ServiceDoc extends Service {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

/** Certification document in Firestore */
export interface CertificationDoc extends Omit<Certification, "dateObtained" | "expirationDate"> {
  dateObtained: Timestamp;
  expirationDate?: Timestamp;
  organizationId: string; // Parent organization
}

/** Activity document in Firestore */
export interface ActivityDoc extends Omit<Activity, "createdAt" | "user"> {
  createdAt: Timestamp;
  userId: string; // Reference to user
  entityType: "opportunity" | "project" | "organization" | "meeting" | "document" | "task" | "rock" | "affiliate" | "team-member" | "proposal" | "calendar" | "settings";
  entityId: string;
  entityName?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Affiliate Networking System Types
// ============================================================================

/** Affiliate Biography/Profile document */
export interface AffiliateBiographyDoc {
  id: string;
  affiliateId: string; // Reference to user
  
  // Business Information
  businessName: string;
  profession: string;
  location: string;
  yearsInBusiness: number;
  previousJobs: string[];
  
  // Personal Information
  spouse?: string;
  children?: string;
  pets?: string;
  hobbies: string[];
  activitiesOfInterest: string[];
  cityOfResidence: string;
  yearsInCity?: number;
  
  // Miscellaneous
  burningDesire?: string;
  uniqueFact?: string;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** GAINS Profile document (Goals, Accomplishments, Interests, Networks, Skills) */
export interface GainsProfileDoc {
  id: string;
  affiliateId: string; // Reference to user
  
  goals: string; // Financial, business, educational, personal objectives
  accomplishments: string; // Achievements, completed projects
  interests: string; // Things they enjoy doing, talking about, collecting
  networks: string; // Organizations, institutions, associations they belong to
  skills: string; // Talents, abilities, assets
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Contact Sphere document */
export interface ContactSphereDoc {
  id: string;
  affiliateId: string; // Reference to user
  
  sphereName: string; // Name of their contact sphere
  
  // Top 10 members in their contact sphere
  members: {
    name: string;
    profession?: string;
    company?: string;
  }[];
  
  // Top 3 professions they need to round out their sphere
  topProfessionsNeeded: {
    profession: string;
    description?: string;
  }[];
  
  commitment?: string; // Their commitment to help fill partner's sphere
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Previous Customers document */
export interface PreviousCustomersDoc {
  id: string;
  affiliateId: string; // Reference to user
  
  customers: {
    name: string;
    industry: string;
    description: string; // What was done for them
    isIdealClient: boolean;
  }[];
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** One-to-One Meeting document */
export interface OneToOneMeetingDoc {
  id: string;
  
  // Participants
  initiatorId: string; // Affiliate who scheduled the meeting
  partnerId: string; // Affiliate they're meeting with
  
  // Scheduling
  scheduledDate: Timestamp;
  scheduledTime: string; // e.g., "10:00 AM"
  duration: number; // Minutes (typically 60)
  
  // Location
  meetingType: "virtual" | "in-person";
  location?: string; // Restaurant, office address, or video link
  virtualPlatform?: "zoom" | "teams" | "google-meet" | "other";
  
  // Status
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show";
  
  // Pre-meeting
  agendaItems?: string[];
  worksheetsShared: boolean;
  
  // Post-meeting outcomes
  meetingNotes?: string;
  shortTermReferralCommitment?: string;
  longTermReferralCommitment?: string;
  svpReferralDiscussed: boolean;
  svpReferralDetails?: string;
  
  // Follow-up
  followUpDate?: Timestamp;
  followUpCompleted: boolean;
  followUpNotes?: string;
  
  // Next meeting
  nextMeetingScheduled: boolean;
  nextMeetingDate?: Timestamp;
  
  // AI matching data
  matchScore?: number; // 0-100 compatibility score
  matchReasons?: string[]; // Why AI suggested this pairing
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Referral document */
export interface ReferralDoc {
  id: string;
  
  // Who gave and received the referral
  referrerId: string; // Affiliate who gave the referral
  referrerName: string; // Cached name for display
  recipientId: string; // Affiliate who received the referral (or SVP)
  recipientName: string; // Cached name for display
  
  // Source meeting (if from a one-to-one)
  oneToOneMeetingId?: string;
  
  // Referral details
  referralType: "short-term" | "long-term";
  prospectName: string;
  prospectCompany?: string;
  prospectEmail?: string;
  prospectPhone?: string;
  prospectTitle?: string;
  
  // Why this is a good referral
  description: string;
  whyGoodFit?: string;
  
  // Is this for SVP?
  isSvpReferral: boolean;
  svpServiceInterest?: string[]; // Which SVP services they might need
  
  // Pipeline/Deal status
  status: "submitted" | "contacted" | "meeting-scheduled" | "proposal" | "negotiation" | "won" | "lost";
  
  // Commission tracking
  commissionTier: "referral" | "assist" | "co-sell"; // 7%, 12%, 17%
  estimatedValue?: number; // Estimated deal value
  
  // Outcome tracking
  dealValue?: number; // In dollars, when won
  dealClosedDate?: Timestamp;
  lostReason?: string;
  commissionPaid?: number;
  commissionPaidDate?: Timestamp;
  
  // Activity log
  lastContactDate?: Timestamp;
  lastActivityNote?: string;
  contactAttempts: number;
  
  // Linked entities
  linkedProjectId?: string;
  linkedOrganizationId?: string;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Affiliate Stats document (aggregated metrics) */
export interface AffiliateStatsDoc {
  id: string;
  affiliateId: string; // Reference to user
  
  // Profile completion
  biographyComplete: boolean;
  gainsProfileComplete: boolean;
  contactSphereComplete: boolean;
  customersListComplete: boolean;
  profileCompletionPercent: number;
  
  // One-to-one activity
  totalOneToOnesScheduled: number;
  totalOneToOnesCompleted: number;
  oneToOnesThisMonth: number;
  oneToOnesThisQuarter: number;
  lastOneToOneDate?: Timestamp;
  
  // Referral activity
  referralsGiven: number;
  referralsReceived: number;
  referralsGivenThisMonth: number;
  referralsReceivedThisMonth: number;
  
  // Deal outcomes
  dealsClosedFromReferralsGiven: number;
  dealsClosedFromReferralsReceived: number;
  totalRevenueGenerated: number; // From referrals they gave that closed
  totalRevenueReceived: number; // From referrals they received that closed
  
  // SVP-specific
  svpReferralsGiven: number;
  svpReferralsClosed: number;
  svpRevenueGenerated: number;
  
  // Engagement score (calculated)
  engagementScore: number; // 0-100
  
  // Streaks
  currentOneToOneStreak: number; // Consecutive weeks with a one-to-one
  longestOneToOneStreak: number;
  
  updatedAt: Timestamp;
}

/** AI Match Suggestion document */
export interface AiMatchSuggestionDoc {
  id: string;
  affiliateId: string; // Who this suggestion is for
  suggestedPartnerId: string; // Suggested partner
  
  matchScore: number; // 0-100
  
  // Reasons for the match
  reasons: {
    category: "contact-sphere" | "interests" | "skills" | "geography" | "complementary" | "rotation";
    description: string;
    weight: number;
  }[];
  
  // Suggested talking points
  talkingPoints: string[];
  
  // Has this suggestion been acted on?
  status: "pending" | "accepted" | "declined" | "expired";
  
  // When was their last meeting?
  lastMeetingDate?: Timestamp;
  daysSinceLastMeeting?: number;
  
  createdAt: Timestamp;
  expiresAt: Timestamp; // Suggestions expire after a period
}

// ============================================================================
// Bug Tracker Types
// ============================================================================

/** Bug Tracker item type */
export type BugTrackerItemType = "bug" | "idea" | "improvement";

/** Bug Tracker item status */
export type BugTrackerItemStatus = "open" | "in_progress" | "resolved" | "closed" | "wont_fix";

/** Bug Tracker item priority */
export type BugTrackerItemPriority = "low" | "medium" | "high" | "critical";

/** Bug Tracker Comment */
export interface BugTrackerComment {
  id: string;
  author: string;
  authorId: string;
  content: string;
  createdAt: Timestamp;
}

/** Bug Tracker Item document in Firestore */
export interface BugTrackerItemDoc {
  id: string;
  type: BugTrackerItemType;
  title: string;
  description: string;
  status: BugTrackerItemStatus;
  priority: BugTrackerItemPriority;
  page?: string;
  reporterId: string;
  reporterName: string;
  assigneeId?: string;
  assigneeName?: string;
  tags: string[];
  comments: BugTrackerComment[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// AI Workforce Types
// ============================================================================

/** AI Employee role types */
export type AIEmployeeRoleType = "cfo" | "hr" | "legal" | "marketing" | "sales" | "custom";

/** AI Employee document in Firestore */
export interface AIEmployeeDoc {
  id: string;
  userId: string; // Owner of this AI employee
  role: AIEmployeeRoleType;
  name: string;
  title: string;
  description: string;
  avatar: string;
  color: string;
  systemPrompt: string;
  capabilities: string[];
  sampleQuestions: string[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** AI Employee Chat Message */
export interface AIEmployeeChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Timestamp;
}

/** AI Employee Chat document in Firestore */
export interface AIEmployeeChatDoc {
  id: string;
  employeeId: string;
  userId: string;
  messages: AIEmployeeChatMessage[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Note document in Firestore */
export interface NoteDoc extends Omit<Note, "createdAt" | "updatedAt" | "author"> {
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  authorId: string; // Reference to user
  entityType: "opportunity" | "project" | "meeting";
  entityId: string;
}

/** Milestone document in Firestore */
export interface MilestoneDoc extends Omit<Milestone, "dueDate" | "completedDate"> {
  dueDate: Timestamp;
  completedDate?: Timestamp;
}

// ============================================================================
// Strategic Partners
// ============================================================================

/** Zoom Recording entry for Strategic Partners */
export interface ZoomRecording {
  title: string;
  url: string;
  date?: string;
}

/** Strategic Partner document in Firestore */
export interface StrategicPartnerDoc {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  website: string;
  expertise: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
  logo?: string;
  notes?: string;
  zoomRecordings?: ZoomRecording[];
  status: "active" | "inactive" | "pending";
  // Additional flags - Partners/Suppliers can also be Clients
  isClient?: boolean; // Can this partner also be served as a client?
  clientSince?: Timestamp; // When they became a client
  clientNotes?: string; // Notes about them as a client
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Team Member document in Firestore */
export interface TeamMemberDoc {
  id: string;
  firebaseUid?: string; // Links to Firebase Auth user UID
  firstName: string;
  lastName: string;
  emailPrimary: string;
  emailSecondary?: string;
  mobile?: string;
  expertise: string;
  title?: string;
  company?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  linkedIn?: string;
  website?: string;
  role: "superadmin" | "admin" | "team" | "affiliate" | "consultant" | "client";
  status: "active" | "inactive" | "pending";
  // Leadership role flags for About/Leadership pages
  isCEO?: boolean;
  isCOO?: boolean;
  isCTO?: boolean;
  isCRO?: boolean;
  // Additional flags - Affiliates/Suppliers can also be Clients
  isClient?: boolean; // Can this affiliate/team member also be served as a client?
  clientSince?: Timestamp; // When they became a client
  clientNotes?: string; // Notes about them as a client
  isGuardian?: boolean;
  guardianRelationship?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Book a Call Lead document in Firestore */
export interface BookCallLeadDoc {
  id: string;
  // Contact Information
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  // Scheduling
  preferredDate?: string;
  preferredTime?: string;
  timezone?: string;
  // Additional Info
  message?: string;
  source: "contact-page" | "cta" | "popup" | "other";
  // Status
  status: "new" | "contacted" | "scheduled" | "completed" | "cancelled";
  assignedTo?: string;
  assignedToName?: string;
  // Follow-up
  notes?: string;
  scheduledCallDate?: Timestamp;
  completedAt?: Timestamp;
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Event Ticket Type */
export interface EventTicketType {
  id: string;
  name: string;
  description?: string;
  price: number; // in cents
  quantity: number;
  quantitySold: number;
  maxPerOrder: number;
  salesStartDate?: Timestamp;
  salesEndDate?: Timestamp;
  isActive: boolean;
  sortOrder: number;
}

/** Event Registration/Order */
export interface EventRegistration {
  id: string;
  eventId: string;
  userId?: string;
  // Attendee Info
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  // Tickets
  tickets: {
    ticketTypeId: string;
    ticketTypeName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  // Payment
  subtotal: number;
  discount: number;
  total: number;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  // Status
  status: "pending" | "confirmed" | "cancelled" | "checked_in";
  checkInTime?: Timestamp;
  // Metadata
  promoCode?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Event Landing Page Design */
export interface EventLandingPageDesign {
  heroImage?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  sections: {
    id: string;
    type: "description" | "schedule" | "speakers" | "tickets" | "faq" | "sponsors" | "gallery" | "map";
    title?: string;
    content?: string;
    isVisible: boolean;
    order: number;
  }[];
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
  };
  customCss?: string;
}

/** Event document in Firestore */
export interface EventDoc {
  id: string;
  title: string;
  description?: string;
  shortDescription?: string;
  // Date/Time
  startDate: Timestamp;
  endDate?: Timestamp;
  timezone?: string;
  isAllDay?: boolean;
  // Location
  locationType: "virtual" | "in-person" | "hybrid";
  location?: string;
  virtualLink?: string;
  // Registration (legacy - for external registration)
  registrationUrl?: string;
  registrationDeadline?: Timestamp;
  maxAttendees?: number;
  currentAttendees?: number;
  // Ticketing
  ticketTypes?: EventTicketType[];
  isFreeEvent?: boolean;
  requiresPayment?: boolean;
  // Landing Page
  slug?: string; // URL-friendly identifier
  landingPageDesign?: EventLandingPageDesign;
  hasCustomLandingPage?: boolean;
  // Speakers/Presenters
  speakers?: {
    id: string;
    name: string;
    title?: string;
    company?: string;
    bio?: string;
    imageUrl?: string;
    socialLinks?: Record<string, string>;
  }[];
  // Schedule/Agenda
  agenda?: {
    id: string;
    time: string;
    title: string;
    description?: string;
    speakerId?: string;
  }[];
  // Sponsors
  sponsors?: {
    id: string;
    name: string;
    logoUrl?: string;
    websiteUrl?: string;
    tier?: "platinum" | "gold" | "silver" | "bronze";
  }[];
  // FAQ
  faq?: {
    id: string;
    question: string;
    answer: string;
  }[];
  // Display
  imageUrl?: string;
  category?: "webinar" | "workshop" | "conference" | "networking" | "training" | "other";
  tags?: string[];
  // Status
  status: "draft" | "published" | "cancelled" | "completed";
  isFeatured?: boolean;
  // Stripe Integration
  stripeProductId?: string;
  stripePriceIds?: Record<string, string>; // ticketTypeId -> stripePriceId
  // Metadata
  createdBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Platform Settings document in Firestore */
export interface PlatformSettingsDoc {
  id: string;
  // Social Links Configuration
  socialLinks?: {
    linkedin?: { url: string; visible: boolean };
    twitter?: { url: string; visible: boolean };
    youtube?: { url: string; visible: boolean };
    facebook?: { url: string; visible: boolean };
    instagram?: { url: string; visible: boolean };
  };
  // API Integrations
  integrations: {
    apollo?: {
      apiKey?: string;
      accountId?: string;
      status: "connected" | "disconnected" | "error";
      lastTested?: Timestamp;
    };
    zoom?: {
      apiKey?: string;
      apiSecret?: string;
      accountId?: string;
      status: "connected" | "disconnected" | "error";
      lastTested?: Timestamp;
    };
    docuseal?: {
      apiKey?: string;
      webhookSecret?: string;
      status: "connected" | "disconnected" | "error";
      lastTested?: Timestamp;
    };
    stripe?: {
      secretKey?: string;
      publishableKey?: string;
      webhookSecret?: string;
      status: "connected" | "disconnected" | "error";
      lastTested?: Timestamp;
    };
  };
  // LLM Configuration
  llmConfig?: {
    provider: string;
    model: string;
    apiKey?: string;
    ollamaUrl?: string;
    useOllama: boolean;
    baseUrl?: string;
    useOpenAICompatible?: boolean;
  };
  // Notification Settings
  notificationSettings?: {
    inAppEnabled: boolean;
    browserEnabled: boolean;
    soundEnabled: boolean;
  };
  // SuperAdmin Visibility Controls
  sidebarVisibility?: {
    navigation?: boolean;
    work?: boolean;
    intelligence?: boolean;
    admin?: boolean;
    initiatives?: boolean;
    commandCenter?: boolean;
    projects?: boolean;
    affiliates?: boolean;
    organizations?: boolean;
    calendar?: boolean;
    meetings?: boolean;
    proposals?: boolean;
    askIntellEdge?: boolean;
    teamMembers?: boolean;
    strategicPartners?: boolean;
    bookCallLeads?: boolean;
    settings?: boolean;
    activityLog?: boolean;
  };
  platformToolsVisibility?: {
    transcription?: boolean;
    imageGen?: boolean;
    headshot?: boolean;
    youtube?: boolean;
    tts?: boolean;
    crawler?: boolean;
    pdfOcr?: boolean;
  };
  updatedAt: Timestamp;
  updatedBy?: string;
}

// ============================================================================
// Apollo Purchased Contacts
// ============================================================================

/** Purchased contact from Apollo */
export interface ApolloPurchasedContactDoc {
  id: string;
  apolloId: string;
  firstName: string;
  lastName: string;
  name: string;
  title: string;
  company: string;
  companyId?: string;
  location?: string;
  industry?: string;
  companySize?: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
  emailPurchased: boolean;
  phonePurchased: boolean;
  emailPurchasedAt?: Timestamp;
  phonePurchasedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Contact entry in a saved list */
export interface SavedListContact {
  apolloId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  title: string;
  company: string;
  companyId?: string;
  location?: string;
  industry?: string;
  companySize?: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
  addedAt: Timestamp;
}

/** Saved prospect list */
export interface ApolloSavedListDoc {
  id: string;
  name: string;
  description?: string;
  contacts: SavedListContact[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Calendar Event (built-in calendar) */
export interface CalendarEventDoc {
  id: string;
  title: string;
  description?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  allDay?: boolean;
  type: 'meeting' | 'todo' | 'issue' | 'custom' | 'one-to-one';
  color?: string;
  attendees?: string[];
  location?: string;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly';
  recurringUntil?: Timestamp;
  recurringParentId?: string; // ID of the parent recurring event
  meetingId?: string;
  // 1-to-1 reference
  oneToOneQueueItemId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** 1-to-1 Scheduling Queue Item */
export interface OneToOneQueueItemDoc {
  id: string;
  // Team member to schedule with
  teamMemberId: string;
  teamMemberName: string;
  teamMemberEmail: string;
  teamMemberExpertise?: string;
  teamMemberAvatar?: string;
  // Queue status
  status: 'queued' | 'scheduled' | 'completed' | 'cancelled';
  // Scheduling details (when scheduled)
  scheduledDate?: Timestamp;
  scheduledTime?: string;
  duration?: number; // minutes
  location?: string;
  meetingType?: 'virtual' | 'in-person';
  calendarEventId?: string;
  // Notes
  notes?: string;
  // Priority/order
  priority: number;
  // Who added this to queue
  addedBy: string;
  addedByName?: string;
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  scheduledAt?: Timestamp;
  completedAt?: Timestamp;
}

// ============================================================================
// Team Member Availability & Booking Types
// ============================================================================

/** Weekly availability slot for a team member */
export interface AvailabilitySlot {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isEnabled: boolean;
}

/** Team member availability settings */
export interface TeamMemberAvailabilityDoc {
  id: string; // Same as team member ID
  teamMemberId: string;
  teamMemberName: string;
  teamMemberEmail: string;
  // Booking page settings
  bookingSlug: string; // Unique URL slug for booking page
  bookingTitle?: string; // Custom title for booking page
  bookingDescription?: string; // Description shown on booking page
  timezone: string; // e.g., "America/New_York"
  // Availability slots
  weeklyAvailability: AvailabilitySlot[];
  // Meeting settings
  defaultMeetingDuration: number; // minutes
  allowedDurations: number[]; // e.g., [30, 45, 60]
  bufferBetweenMeetings: number; // minutes
  maxAdvanceBookingDays: number; // How far in advance can book
  minAdvanceBookingHours: number; // Minimum notice required
  // Meeting types
  meetingTypes: Array<{
    id: string;
    name: string;
    duration: number;
    description?: string;
    location?: string;
    isVirtual: boolean;
    videoLink?: string;
  }>;
  // Blocked dates (specific dates unavailable)
  blockedDates: Array<{
    date: string; // YYYY-MM-DD
    reason?: string;
  }>;
  // Status
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Booking made by a client */
export interface BookingDoc {
  id: string;
  // Team member being booked
  teamMemberId: string;
  teamMemberName: string;
  teamMemberEmail: string;
  // Client info
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientCompany?: string;
  clientNotes?: string;
  // Meeting details
  meetingTypeId?: string;
  meetingTypeName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  duration: number; // minutes
  timezone: string;
  // Location
  isVirtual: boolean;
  location?: string;
  videoLink?: string;
  // Status
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  // Calendar integration
  calendarEventId?: string;
  // Email notifications
  confirmationEmailSent: boolean;
  reminderEmailSent: boolean;
  // Timestamps
  bookedAt: Timestamp;
  confirmedAt?: Timestamp;
  cancelledAt?: Timestamp;
  cancelReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // SMS consent (A2P 10DLC compliance)
  smsConsentTransactional?: boolean;
  smsConsentMarketing?: boolean;
}

// ============================================================================
// DocuSeal Integration Types
// ============================================================================

/** DocuSeal Template (cached locally) */
export interface DocuSealTemplateDoc {
  id: string;
  docusealId: number;
  name: string;
  slug: string;
  description?: string;
  category: 'nda' | 'engagement' | 'supplier_qualification' | 'msa' | 'sow' | 'other';
  fields: Array<{
    name: string;
    type: string;
    required?: boolean;
  }>;
  submitterRoles: string[];
  isActive: boolean;
  lastSyncedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** DocuSeal Submission tracking */
export interface DocuSealSubmissionDoc {
  id: string;
  docusealSubmissionId: number;
  templateId: string;
  templateName: string;
  status: 'pending' | 'sent' | 'viewed' | 'completed' | 'declined' | 'expired';
  // Related entities
  organizationId?: string;
  organizationName?: string;
  opportunityId?: string;
  projectId?: string;
  // Submitters
  submitters: Array<{
    email: string;
    name: string;
    role: string;
    status: 'pending' | 'sent' | 'opened' | 'completed' | 'declined';
    completedAt?: Timestamp;
    signedDocumentUrl?: string;
  }>;
  // Document URLs
  combinedDocumentUrl?: string;
  auditLogUrl?: string;
  // Metadata
  sentAt?: Timestamp;
  completedAt?: Timestamp;
  expiresAt?: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Software License Keys
// ============================================================================

export type ToolType = 
  | 'apollo-search'
  | 'ai-workforce'
  | 'proposal-creator'
  | 'docuseal'
  | 'linkedin-content'
  | 'bug-tracker'
  | 'networking'
  | 'calendar'
  | 'all-tools';

export interface SoftwareKeyDoc {
  id: string;
  // Key details
  key: string;                    // The actual license key (e.g., "SVP-XXXX-XXXX-XXXX")
  name: string;                   // Friendly name for the key
  description?: string;
  // Tool access
  tools: ToolType[];              // Which tools this key enables
  // Assignment
  assignedTo?: string;            // User ID or organization ID
  assignedToName?: string;        // Name of assignee
  assignedToEmail?: string;       // Email of assignee
  assignmentType?: 'user' | 'organization' | 'affiliate';
  // Validity
  status: 'active' | 'inactive' | 'expired' | 'revoked';
  activatedAt?: Timestamp;
  expiresAt?: Timestamp;
  // Usage limits
  maxActivations?: number;        // Max number of devices/sessions
  currentActivations: number;
  // Metadata
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  notes?: string;
}

export interface KeyActivationDoc {
  id: string;
  keyId: string;
  userId: string;
  userEmail: string;
  deviceInfo?: string;
  ipAddress?: string;
  activatedAt: Timestamp;
  lastUsedAt: Timestamp;
  isActive: boolean;
}

// ============================================================================
// White-Label Deployments
// ============================================================================

export type DeploymentStatus = 'pending' | 'provisioning' | 'active' | 'suspended' | 'terminated';
export type LicenseType = 'trial' | 'starter' | 'professional' | 'enterprise';
export type InfrastructureProvider = 'vercel' | 'netlify' | 'self-hosted';

export interface WhiteLabelDeploymentDoc {
  id: string;
  // Deployment Identity
  name: string;
  slug: string;
  status: DeploymentStatus;
  // Branding Configuration
  branding: {
    companyName: string;
    shortName: string;
    initials: string;
    tagline: string;
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
    faviconUrl?: string;
  };
  // Domain Configuration
  domains: {
    primary: string;
    portal?: string;
    api?: string;
    customDomains?: string[];
    sslEnabled: boolean;
  };
  // Infrastructure
  infrastructure: {
    provider: InfrastructureProvider;
    projectId?: string;
    deploymentUrl?: string;
    firebaseProjectId?: string;
    region?: string;
  };
  // License & Billing
  license: {
    type: LicenseType;
    startDate: Timestamp;
    endDate?: Timestamp;
    maxUsers?: number;
    maxAffiliates?: number;
    softwareKeys: string[];
  };
  // Feature Overrides
  features: {
    enabledTools: ToolType[];
    customFeatures?: Record<string, boolean>;
  };
  // Contact Information
  owner: {
    userId?: string;
    name: string;
    email: string;
    phone?: string;
    company: string;
  };
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  provisionedAt?: Timestamp;
  lastActivityAt?: Timestamp;
  notes?: string;
}

// ============================================================================
// Legacy Growth IQ Quiz
// ============================================================================

/** Quiz Question document in Firestore */
export interface QuizQuestionDoc {
  id: string;
  questionNumber: number;
  question: string;
  category: 'independence' | 'vision' | 'leadership' | 'operations' | 'succession' | 'legacy';
  isActive: boolean;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string;
}

/** Quiz Answer option */
export interface QuizAnswerOption {
  value: number;
  label: string;
}

/** Quiz Submission document in Firestore */
export interface QuizSubmissionDoc {
  id: string;
  // Respondent info (optional - can be anonymous)
  respondentName?: string;
  respondentEmail?: string;
  respondentCompany?: string;
  respondentPhone?: string;
  // Answers - key is question ID, value is answer value (1-5)
  answers: Record<string, number>;
  // Calculated results
  totalScore: number;
  maxScore: number;
  percentage: number;
  scoreLevel: string; // "Critical" | "Vulnerable" | "Developing" | "Legacy-Ready"
  // Category scores
  categoryScores: {
    category: string;
    score: number;
    maxScore: number;
    percentage: number;
  }[];
  // Metadata
  completedAt: Timestamp;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  // Follow-up tracking
  followUpStatus?: 'pending' | 'contacted' | 'scheduled' | 'completed' | 'not_interested';
  followUpNotes?: string;
  assignedTo?: string;
  // Report delivery
  reportSentAt?: Timestamp;
  reportPdfUrl?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

/** Quiz Report Template Configuration */
export interface QuizReportTemplateDoc {
  id: string;
  name: string;
  isActive: boolean;
  // Executive Summary Section
  executiveSummary: {
    enabled: boolean;
    title: string;
    showOverallScore: boolean;
    showKeyStrengths: boolean;
    showDevelopmentAreas: boolean;
    customIntroText?: string;
  };
  // Detailed Analysis Sections
  detailedSections: {
    id: string;
    title: string;
    enabled: boolean;
    order: number;
    category: string; // maps to quiz category
    description: string;
    scoringCriteria: {
      low: { min: number; max: number; label: string; description: string };
      medium: { min: number; max: number; label: string; description: string };
      high: { min: number; max: number; label: string; description: string };
    };
  }[];
  // Recommendations Section
  recommendations: {
    enabled: boolean;
    title: string;
    showPrioritizedInitiatives: boolean;
    showImplementationGuidance: boolean;
    showExpectedOutcomes: boolean;
    // Custom recommendations per score level
    byScoreLevel: {
      critical: string[];
      vulnerable: string[];
      developing: string[];
      legacyReady: string[];
    };
  };
  // Call to Action
  callToAction: {
    enabled: boolean;
    title: string;
    description: string;
    buttonText: string;
    buttonUrl: string;
  };
  // Branding
  branding: {
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    companyName: string;
    contactEmail: string;
    contactPhone: string;
    website: string;
  };
  // Email Settings
  emailSettings: {
    subject: string;
    fromName: string;
    replyTo: string;
    introText: string;
    signatureText: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string;
}

// ============================================================================
// Hero Slide Types
// ============================================================================

/** Hero slide document in Firestore */
export interface HeroSlideDoc {
  id: string;
  badge: string;
  headline: string;
  highlightedText: string;
  subheadline: string;
  benefits: string[];
  primaryCta: {
    text: string;
    href: string;
  };
  secondaryCta: {
    text: string;
    href: string;
  };
  isPublished: boolean;
  order: number;
  backgroundImage?: {
    imageId: string; // Reference to Image Manager image
    url: string; // Cached data URL for display
    name: string; // Image name from Image Manager
  };
  animation?: {
    type: "fade" | "slide-up" | "slide-left" | "zoom" | "none";
    duration: number;
    delay: number;
  };
  overlay?: {
    enabled: boolean;
    color: string;
    opacity: number;
  };
  leadMagnet?: {
    enabled: boolean;
    type: "quiz" | "download" | "consultation" | "demo";
    urgency?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string;
  updatedBy?: string;
}

/** Success Story / Testimonial document in Firestore */
export interface SuccessStoryDoc {
  id: string;
  name: string; // Client name (e.g., "Alex Richardson")
  company: string; // Company name
  industry: string; // Industry type
  location: string; // Location (e.g., "Cincinnati, OH")
  quote: string; // Main testimonial quote
  challenge: string; // The challenge they faced
  solution?: string; // How AICenter4U helped (for featured stories)
  results: Array<{
    metric: string;
    value: string;
    period?: string; // Optional time period context
  }>;
  image?: {
    imageId: string;
    url: string;
    name: string;
  };
  isFeatured: boolean; // Featured stories get special layout
  isPublished: boolean;
  order: number; // For sorting display order
  rating: number; // 1-5 star rating
  tags?: string[]; // For filtering (e.g., ["restaurant", "succession", "profit-growth"])
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string;
  updatedBy?: string;
}

// ============================================================================
// Backup System Types
// ============================================================================

/** Backup metadata document in Firestore */
export interface BackupMetadataDoc {
  id: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  type: "full" | "incremental" | "collections";
  status: "pending" | "in_progress" | "success" | "failed" | "partial";
  size: number;
  compressedSize: number;
  duration: number;
  collections: string[];
  documentCounts: Record<string, number>;
  storageLocations: {
    provider: string;
    path: string;
    url?: string;
  }[];
  checksum: string;
  encryptionEnabled: boolean;
  triggeredBy: "manual" | "scheduled";
  scheduleId?: string;
  error?: string;
  metadata: Record<string, unknown>;
}

/** Backup schedule document in Firestore */
export interface BackupScheduleDoc {
  id: string;
  name: string;
  description?: string;
  cronExpression: string;
  timezone: string;
  enabled: boolean;
  backupType: "full" | "incremental" | "collections";
  collections?: string[];
  storageProviders: string[];
  compression: "gzip" | "zip" | "none";
  encryption: boolean;
  retentionPolicy: {
    keepLast: number;
    keepDailyFor: number;
    keepWeeklyFor: number;
    keepMonthlyFor: number;
  };
  notifications: {
    onSuccess: boolean;
    onFailure: boolean;
    emails: string[];
  };
  lastRunAt?: Timestamp;
  nextRunAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

/** Storage provider configuration document in Firestore */
export interface BackupStorageProviderDoc {
  id: string;
  name: string;
  type: "local" | "s3" | "gcs" | "azure" | "firebase";
  enabled: boolean;
  isDefault: boolean;
  config: {
    bucket?: string;
    region?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    endpoint?: string;
    projectId?: string;
    keyFile?: string;
    connectionString?: string;
    containerName?: string;
    basePath?: string;
    storageBucket?: string;
  };
  pathPrefix: string;
  usedStorage?: number;
  maxStorage?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Collection Names
// ============================================================================

export const COLLECTIONS = {
  USERS: "users",
  ORGANIZATIONS: "organizations",
  OPPORTUNITIES: "opportunities",
  PROJECTS: "projects",
  MEETINGS: "meetings",
  ACTION_ITEMS: "actionItems",
  DOCUMENTS: "documents",
  PLATFORM_DOCUMENTS: "platformDocuments",
  DOCUMENT_VERSIONS: "documentVersions",
  DOCUMENT_AI_EDITS: "documentAiEdits",
  SERVICES: "services",
  CERTIFICATIONS: "certifications",
  ACTIVITIES: "activities",
  NOTES: "notes",
  MILESTONES: "milestones",
  CAPABILITIES: "capabilities",
  // Affiliate Networking Collections
  AFFILIATE_BIOGRAPHIES: "affiliateBiographies",
  GAINS_PROFILES: "gainsProfiles",
  CONTACT_SPHERES: "contactSpheres",
  PREVIOUS_CUSTOMERS: "previousCustomers",
  ONE_TO_ONE_MEETINGS: "oneToOneMeetings",
  REFERRALS: "referrals",
  AFFILIATE_STATS: "affiliateStats",
  AI_MATCH_SUGGESTIONS: "aiMatchSuggestions",
  // Strategic Partners
  STRATEGIC_PARTNERS: "strategicPartners",
  // Team Members
  TEAM_MEMBERS: "teamMembers",
  // Platform Settings
  PLATFORM_SETTINGS: "platformSettings",
  // Apollo Purchased Contacts
  APOLLO_PURCHASED_CONTACTS: "apolloPurchasedContacts",
  // Apollo Saved Lists
  APOLLO_SAVED_LISTS: "apolloSavedLists",
  // Calendar Events (built-in calendar)
  CALENDAR_EVENTS: "calendarEvents",
  // 1-to-1 Scheduling Queue
  ONE_TO_ONE_QUEUE: "oneToOneQueue",
  // Team Member Availability & Bookings
  TEAM_MEMBER_AVAILABILITY: "teamMemberAvailability",
  BOOKINGS: "bookings",
  // SMS Opt-In Consent (A2P 10DLC compliance)
  SMS_OPT_INS: "smsOptIns",
  // DocuSeal Integration Collections
  DOCUSEAL_TEMPLATES: "docusealTemplates",
  DOCUSEAL_SUBMISSIONS: "docusealSubmissions",
  // Software License Keys
  SOFTWARE_KEYS: "softwareKeys",
  KEY_ACTIVATIONS: "keyActivations",
  // White-Label Deployments
  WHITE_LABEL_DEPLOYMENTS: "whiteLabelDeployments",
  DEPLOYMENT_ANALYTICS: "deploymentAnalytics",
  DEPLOYMENT_AUDIT_LOGS: "deploymentAuditLogs",
  // Book a Call Leads
  BOOK_CALL_LEADS: "bookCallLeads",
  // Events
  EVENTS: "events",
  EVENT_REGISTRATIONS: "eventRegistrations",
  // Legacy Growth IQ Quiz
  QUIZ_QUESTIONS: "quizQuestions",
  QUIZ_SUBMISSIONS: "quizSubmissions",
  QUIZ_REPORT_TEMPLATES: "quizReportTemplates",
  // AI Workforce
  AI_EMPLOYEES: "aiEmployees",
  AI_EMPLOYEE_CHATS: "aiEmployeeChats",
  // Bug Tracker
  BUG_TRACKER_ITEMS: "bugTrackerItems",
  // Backup System
  BACKUP_METADATA: "backupMetadata",
  BACKUP_SCHEDULES: "backupSchedules",
  BACKUP_STORAGE_PROVIDERS: "backupStorageProviders",
  // Hero Slides
  HERO_SLIDES: "heroSlides",
  // Success Stories (Testimonials)
  SUCCESS_STORIES: "successStories",
  // LinkedIn Content & Publishing
  LINKEDIN_ARTICLES: "linkedinArticles",
  LINKEDIN_CONNECTIONS: "linkedinConnections",
  LINKEDIN_LEADS: "linkedinLeads",
  // OAuth State (temporary, TTL-based)
  OAUTH_STATES: "oauthStates",
} as const;

/** Reference link stored with a LinkedIn article */
export interface LinkedInReferenceLink {
  id: string;
  url: string;
  title: string;
  status: "pending" | "valid" | "invalid" | "checking";
  description?: string;
}

/** LinkedIn article draft / scheduled / published post */
export interface LinkedInArticleDoc {
  id: string;
  title: string;
  content: string;
  hashtags?: string;
  images: string[];
  referenceLinks: LinkedInReferenceLink[];
  glossary: { term: string; definition: string }[];
  status: "draft" | "scheduled" | "published" | "failed";
  scheduledFor?: Timestamp | null;
  publishedAt?: Timestamp | null;
  linkedinPostId?: string | null; // URN from LinkedIn after publish
  linkedinPostUrl?: string | null; // Public URL of the published post
  linkedinError?: string | null;
  createdById: string;
  createdByName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** LinkedIn OAuth connection per user */
export interface LinkedInConnectionDoc {
  id: string;
  userId: string;
  profileId?: string | null;
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: Timestamp | null;
  profileName?: string | null;
  profileEmail?: string | null;
  profilePicture?: string | null;
  scopes?: string[];
  isActive: boolean;
  connectedAt: Timestamp;
  updatedAt: Timestamp;
}

/** Lead captured from a LinkedIn article form */
export interface LinkedInLeadDoc {
  id: string;
  articleId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  status: "new" | "contacted" | "qualified" | "converted" | "archived";
  source: "linkedin_article";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Temporary OAuth state for CSRF protection during OAuth flows */
export interface OAuthStateDoc {
  id: string;
  userId: string;
  provider: "linkedin" | "other";
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

// ============================================================================
// Collection References
// ============================================================================

/** Get typed collection reference */
export const getCollection = <T>(collectionName: string): CollectionReference<T> | null => {
  if (!db) return null;
  return collection(db, collectionName) as CollectionReference<T>;
};

/** Get typed document reference */
export const getDocRef = <T>(collectionName: string, docId: string): DocumentReference<T> | null => {
  if (!db) return null;
  return doc(db, collectionName, docId) as DocumentReference<T>;
};

// Pre-typed collection references
export const usersCollection = () => getCollection<UserDoc>(COLLECTIONS.USERS);
export const organizationsCollection = () => getCollection<OrganizationDoc>(COLLECTIONS.ORGANIZATIONS);
export const opportunitiesCollection = () => getCollection<OpportunityDoc>(COLLECTIONS.OPPORTUNITIES);
export const projectsCollection = () => getCollection<ProjectDoc>(COLLECTIONS.PROJECTS);
export const meetingsCollection = () => getCollection<MeetingDoc>(COLLECTIONS.MEETINGS);
export const actionItemsCollection = () => getCollection<ActionItemDoc>(COLLECTIONS.ACTION_ITEMS);

export const documentsCollection = () => getCollection<DocumentDoc>(COLLECTIONS.DOCUMENTS);
export const servicesCollection = () => getCollection<ServiceDoc>(COLLECTIONS.SERVICES);
export const activitiesCollection = () => getCollection<ActivityDoc>(COLLECTIONS.ACTIVITIES);
export const notesCollection = () => getCollection<NoteDoc>(COLLECTIONS.NOTES);

// Affiliate Networking collection references
export const affiliateBiographiesCollection = () => getCollection<AffiliateBiographyDoc>(COLLECTIONS.AFFILIATE_BIOGRAPHIES);
export const gainsProfilesCollection = () => getCollection<GainsProfileDoc>(COLLECTIONS.GAINS_PROFILES);
export const contactSpheresCollection = () => getCollection<ContactSphereDoc>(COLLECTIONS.CONTACT_SPHERES);
export const previousCustomersCollection = () => getCollection<PreviousCustomersDoc>(COLLECTIONS.PREVIOUS_CUSTOMERS);
export const oneToOneMeetingsCollection = () => getCollection<OneToOneMeetingDoc>(COLLECTIONS.ONE_TO_ONE_MEETINGS);
export const referralsCollection = () => getCollection<ReferralDoc>(COLLECTIONS.REFERRALS);
export const affiliateStatsCollection = () => getCollection<AffiliateStatsDoc>(COLLECTIONS.AFFILIATE_STATS);
export const aiMatchSuggestionsCollection = () => getCollection<AiMatchSuggestionDoc>(COLLECTIONS.AI_MATCH_SUGGESTIONS);

// Strategic Partners collection reference
export const strategicPartnersCollection = () => getCollection<StrategicPartnerDoc>(COLLECTIONS.STRATEGIC_PARTNERS);

// Team Members collection reference
export const teamMembersCollection = () => getCollection<TeamMemberDoc>(COLLECTIONS.TEAM_MEMBERS);

// Platform Settings collection reference
export const platformSettingsCollection = () => getCollection<PlatformSettingsDoc>(COLLECTIONS.PLATFORM_SETTINGS);



// Bug Tracker collection reference
export const bugTrackerItemsCollection = () => getCollection<BugTrackerItemDoc>(COLLECTIONS.BUG_TRACKER_ITEMS);

// Success Stories collection reference
export const successStoriesCollection = () => getCollection<SuccessStoryDoc>(COLLECTIONS.SUCCESS_STORIES);

// LinkedIn Content & Publishing collection references
export const linkedinArticlesCollection = () => getCollection<LinkedInArticleDoc>(COLLECTIONS.LINKEDIN_ARTICLES);
export const linkedinConnectionsCollection = () => getCollection<LinkedInConnectionDoc>(COLLECTIONS.LINKEDIN_CONNECTIONS);
export const linkedinLeadsCollection = () => getCollection<LinkedInLeadDoc>(COLLECTIONS.LINKEDIN_LEADS);
export const oauthStatesCollection = () => getCollection<OAuthStateDoc>(COLLECTIONS.OAUTH_STATES);

// ============================================================================
// Subcollection Helpers
// ============================================================================

/** Get milestones subcollection for a project */
export const projectMilestonesCollection = (projectId: string): CollectionReference<MilestoneDoc> | null => {
  if (!db) return null;
  return collection(db, COLLECTIONS.PROJECTS, projectId, "milestones") as CollectionReference<MilestoneDoc>;
};

/** Get action items subcollection for a meeting */
export const meetingActionItemsCollection = (meetingId: string): CollectionReference<ActionItemDoc> | null => {
  if (!db) return null;
  return collection(db, COLLECTIONS.MEETINGS, meetingId, "actionItems") as CollectionReference<ActionItemDoc>;
};


/** Get certifications subcollection for an organization */
export const organizationCertificationsCollection = (orgId: string): CollectionReference<CertificationDoc> | null => {
  if (!db) return null;
  return collection(db, COLLECTIONS.ORGANIZATIONS, orgId, "certifications") as CollectionReference<CertificationDoc>;
};

/** Get capabilities subcollection for an organization */
export const organizationCapabilitiesCollection = (orgId: string): CollectionReference<Capability> | null => {
  if (!db) return null;
  return collection(db, COLLECTIONS.ORGANIZATIONS, orgId, "capabilities") as CollectionReference<Capability>;
};

// ============================================================================
// Utility Functions
// ============================================================================

/** Convert Date to Firestore Timestamp */
export const toTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

/** Convert Firestore Timestamp to Date */
export const fromTimestamp = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

/** Generate a new document ID */
export const generateId = (collectionName: string): string | null => {
  if (!db) return null;
  return doc(collection(db, collectionName)).id;
};

// ============================================================================
// Database Schema Documentation
// ============================================================================

/**
 * FIRESTORE DATABASE STRUCTURE
 * ============================
 * 
 * /users/{userId}
 *   - UserDoc
 * 
 * /organizations/{orgId}
 *   - OrganizationDoc
 *   /certifications/{certId} - CertificationDoc
 *   /capabilities/{capId} - Capability
 * 
 * /opportunities/{oppId}
 *   - OpportunityDoc
 * 
 * /projects/{projectId}
 *   - ProjectDoc
 *   /milestones/{milestoneId} - MilestoneDoc
 * 
 * /meetings/{meetingId}
 *   - MeetingDoc
 *   /actionItems/{actionId} - ActionItemDoc
 * 
 * /documents/{docId}
 *   - DocumentDoc
 * 
 * /services/{serviceId}
 *   - ServiceDoc
 * 
 * /activities/{activityId}
 *   - ActivityDoc (polymorphic, linked to various entities)
 * 
 * /notes/{noteId}
 *   - NoteDoc (polymorphic, linked to various entities)
 * 
 * /actionItems/{actionId}
 *   - ActionItemDoc (top-level for cross-entity queries)
 * 
 * 
 * AFFILIATE NETWORKING SYSTEM
 * ===========================
 * /affiliateBiographies/{bioId}
 *   - AffiliateBiographyDoc (Member Bio Sheet)
 * 
 * /gainsProfiles/{profileId}
 *   - GainsProfileDoc (Goals, Accomplishments, Interests, Networks, Skills)
 * 
 * /contactSpheres/{sphereId}
 *   - ContactSphereDoc (Contact Sphere Planning)
 * 
 * /previousCustomers/{customersId}
 *   - PreviousCustomersDoc (Previous 10 Customers)
 * 
 * /oneToOneMeetings/{meetingId}
 *   - OneToOneMeetingDoc (Scheduled one-to-one meetings between affiliates)
 * 
 * /referrals/{referralId}
 *   - ReferralDoc (Referrals given/received, including SVP referrals)
 * 
 * /affiliateStats/{statsId}
 *   - AffiliateStatsDoc (Aggregated metrics per affiliate)
 * 
 * /aiMatchSuggestions/{suggestionId}
 *   - AiMatchSuggestionDoc (AI-generated partner suggestions)
 * 
 * 
 * SECURITY RULES CONSIDERATIONS
 * =============================
 * - Users can only read/write their own user document
 * - Organization members can read organization data
 * - Admins have full access to all collections
 * - Affiliates can only access assigned opportunities/projects
 * - Documents inherit permissions from parent entity
 * 
 * 
 * INDEXES REQUIRED
 * ================
 * - opportunities: organizationId + stage (composite)
 * - opportunities: ownerId + expectedCloseDate (composite)
 * - projects: organizationId + status (composite)
 * - activities: entityType + entityId + createdAt (composite)
 * - actionItems: assigneeId + status + dueDate (composite)
 * - rocks: ownerId + quarter (composite)
 */
