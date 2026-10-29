"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { isSuperAdmin } from "@/lib/permissions";
import { collection, query, where, onSnapshot, terminate } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { useUserProfile } from "@/contexts/user-profile-context";
import { useFeatureVisibility } from "@/contexts/feature-visibility-context";
import { RoleSwitcherCompact } from "@/components/portal/role-switcher";
import { FeatureKey, SectionKey } from "@/lib/feature-visibility";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Factory,
  LayoutDashboard,
  Target,
  FolderKanban,
  Users,
  Building,
  FileText,
  Calendar,
  CalendarDays,
  CheckSquare,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Handshake,
  DollarSign,
  User,
  ImageIcon,
  Shield,
  Rocket,
  Battery,
  UserCog,
  Building2,
  Search,
  Linkedin,
  FileSignature,
  Bot,
  Plug,
  Bug,
  Heart,
  Phone,
  CalendarClock,
  GraduationCap,
  Paintbrush,
  BookOpen,
  Database,
  Ticket,
  UsersRound,
  Briefcase,
  Network,
  Menu,
  Presentation,
  Quote,
  ArrowRightLeft,
  Snowflake,
  Megaphone,
  BarChart3,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Admin Focused — Platform Management
const adminPlatformManagementItems: { title: string; href: string; icon: React.ElementType; badge?: string; featureKey: FeatureKey }[] = [
  { title: "Bug Tracker", href: "/portal/bug-tracker", icon: Bug, featureKey: "bugTracker" },
  { title: "Command Center", href: "/portal/command-center", icon: Rocket, featureKey: "commandCenter" },
  { title: "Academy Admin", href: "/portal/admin/academy", icon: GraduationCap, featureKey: "academyAdmin" },
  { title: "Documentation", href: "/portal/system-docs", icon: BookOpen, featureKey: "systemDocs" },
  { title: "Hero Carousel", href: "/portal/admin/hero", icon: Presentation, featureKey: "heroManagement" },
];

// Admin Focused — Deal Management
const adminDealManagementItems: { title: string; href: string; icon: React.ElementType; badge?: string; featureKey: FeatureKey }[] = [
  { title: "Proposal Creator", href: "/portal/proposals", icon: FileText, badge: "AI", featureKey: "proposals" },
  { title: "Team Members", href: "/portal/admin/team-members", icon: UserCog, featureKey: "teamMembers" },
  { title: "Customers", href: "/portal/customers", icon: Building, featureKey: "customers" },
];

// Admin Focused — Project Management
const adminProjectManagementItems: { title: string; href: string; icon: React.ElementType; badge?: string; featureKey: FeatureKey }[] = [
  { title: "Projects", href: "/portal/projects", icon: FolderKanban, featureKey: "projects" },
  { title: "Calendar", href: "/portal/calendar", icon: Calendar, featureKey: "calendar" },
  { title: "Meetings", href: "/portal/meetings", icon: Users, featureKey: "meetings" },
  { title: "Availability", href: "/portal/availability", icon: CalendarDays, featureKey: "availability" },
];

// Admin Focused — Marketing
const adminMarketingItems: { title: string; href: string; icon: React.ElementType; badge?: string; featureKey: FeatureKey }[] = [
  { title: "LinkedIn Posting", href: "/portal/linkedin-content", icon: Linkedin, featureKey: "linkedinContent" },
];

// System Management
const systemManagementItems: { title: string; href: string; icon: React.ElementType; badge?: string; featureKey: FeatureKey }[] = [];

// People
const peopleItems: { title: string; href: string; icon: React.ElementType; badge?: string; featureKey: FeatureKey }[] = [];

// Productivity
const productivityItems: { title: string; href: string; icon: React.ElementType; badge?: string; featureKey: FeatureKey }[] = [];

// Affiliate Center
const affiliateCenterItems: { title: string; href: string; icon: React.ElementType; badge?: string; featureKey: FeatureKey }[] = [];

// Content
const contentItems: { title: string; href: string; icon: React.ElementType; badge?: string; featureKey: FeatureKey }[] = [];

export function PortalSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { getDisplayName, getInitials, profile, linkedTeamMember } = useUserProfile();
  const { canSeeFeature, canSeeSection, isPreviewMode } = useFeatureVisibility();
  const [bookCallLeadsCount, setBookCallLeadsCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const currentUserRole = linkedTeamMember?.role || "affiliate";
  const showSuperAdminLink = isSuperAdmin(currentUserRole);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      // Terminate Firestore to prevent internal assertion errors when switching users
      if (db) {
        try {
          await terminate(db);
          console.log("Firestore terminated before sign out");
        } catch (terminateError) {
          console.warn("Could not terminate Firestore:", terminateError);
        }
      }
      
      // Sign out from Firebase Auth
      if (auth) {
        await auth.signOut();
      }
      // Clear session storage
      sessionStorage.removeItem("svp_authenticated");
      sessionStorage.removeItem("svp_user_email");
      sessionStorage.removeItem("svp_firebase_uid");
      sessionStorage.removeItem("svp_user_name");
      sessionStorage.removeItem("svp_team_member_id");
      sessionStorage.removeItem("svp_user_role");
      // Clear local storage remember me
      localStorage.removeItem("svp_remembered_email");
      localStorage.removeItem("svp_remember_me");
      // Force a full page reload to reinitialize Firebase cleanly
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
      window.location.href = "/";
    }
  };

  // Subscribe to BookCallLeads count (new leads only)
  useEffect(() => {
    if (!db) return;
    
    const q = query(
      collection(db, COLLECTIONS.BOOK_CALL_LEADS),
      where("status", "==", "new")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBookCallLeadsCount(snapshot.size);
    });
    
    return () => unsubscribe();
  }, []);

  // Subscribe to Projects count (active projects)
  useEffect(() => {
    if (!db) return;
    
    const q = query(
      collection(db, COLLECTIONS.PROJECTS),
      where("status", "in", ["planning", "in_progress", "on_hold"])
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProjectsCount(snapshot.size);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Collapsible state for each section
  const [openSections, setOpenSections] = useState({
    adminFocused: true,
    systemManagement: true,
    people: false,
    productivity: false,
    affiliateCenter: false,
    content: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Get dynamic count for specific items
  const getDynamicCount = (href: string): number | null => {
    if (href === "/portal/projects") return projectsCount > 0 ? projectsCount : null;
    return null;
  };

  // Helper to render menu items
  const renderMenuItems = (items: typeof systemManagementItems) => (
    <SidebarMenu>
      {items.filter(item => canSeeFeature(item.featureKey)).map((item) => {
        const dynamicCount = getDynamicCount(item.href);
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
              tooltip={item.title}
            >
              <Link href={item.href}>
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
            {dynamicCount !== null ? (
              <SidebarMenuBadge>{dynamicCount}</SidebarMenuBadge>
            ) : item.badge ? (
              <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
            ) : null}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  // Helper to render a collapsible section
  const renderSection = (
    sectionKey: keyof typeof openSections,
    label: string,
    items: typeof systemManagementItems
  ) => {
    const visibleItems = items.filter(item => canSeeFeature(item.featureKey));
    if (visibleItems.length === 0) return null;

    return (
      <Collapsible open={openSections[sectionKey]} onOpenChange={() => toggleSection(sectionKey)}>
        <SidebarGroup>
          <CollapsibleTrigger asChild>
            <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/50 rounded-md flex items-center justify-between pr-2">
              <span>{label}</span>
              {openSections[sectionKey] ? (
                <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
              ) : (
                <ChevronRight className="h-4 w-4 text-sidebar-foreground/60" />
              )}
            </SidebarGroupLabel>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarGroupContent>
              {renderMenuItems(visibleItems)}
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    );
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/portal" className="flex items-center gap-2 px-2 py-4">
          <span className="text-xl font-bold tracking-tight">
            AICenter<span className="text-amber-500">4U</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Preview Mode Indicator */}
        {isPreviewMode && (
          <div className="mx-2 mb-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-md">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              👁️ Preview Mode Active
            </p>
          </div>
        )}

        {/* Manpreet Focused */}
        {canSeeSection("adminFocused") && (
          <Collapsible open={openSections.adminFocused} onOpenChange={() => toggleSection("adminFocused")}>
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/50 rounded-md flex items-center justify-between pr-2">
                  <span className="flex items-center gap-1.5">
                    <Snowflake className="h-3.5 w-3.5 text-cyan-500" />
                    Admin Focused
                  </span>
                  {openSections.adminFocused ? (
                    <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-sidebar-foreground/60" />
                  )}
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  {/* Platform Management */}
                  {adminPlatformManagementItems.filter(item => canSeeFeature(item.featureKey)).length > 0 && (
                    <div className="mb-1">
                      <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40 flex items-center gap-1">
                        <Wrench className="h-3 w-3" />
                        Platform Management
                      </p>
                      {renderMenuItems(adminPlatformManagementItems.filter(item => canSeeFeature(item.featureKey)))}
                    </div>
                  )}
                  {/* Deal Management */}
                  {adminDealManagementItems.filter(item => canSeeFeature(item.featureKey)).length > 0 && (
                    <div className="mb-1">
                      <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40 flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        Deal Management
                      </p>
                      {renderMenuItems(adminDealManagementItems.filter(item => canSeeFeature(item.featureKey)))}
                    </div>
                  )}
                  {/* Project Management */}
                  {adminProjectManagementItems.filter(item => canSeeFeature(item.featureKey)).length > 0 && (
                    <div className="mb-1">
                      <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40 flex items-center gap-1">
                        <FolderKanban className="h-3 w-3" />
                        Project Management
                      </p>
                      {renderMenuItems(adminProjectManagementItems.filter(item => canSeeFeature(item.featureKey)))}
                    </div>
                  )}
                  {/* Marketing */}
                  {adminMarketingItems.filter(item => canSeeFeature(item.featureKey)).length > 0 && (
                    <div className="mb-1">
                      <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40 flex items-center gap-1">
                        <Megaphone className="h-3 w-3" />
                        Marketing
                      </p>
                      {renderMenuItems(adminMarketingItems.filter(item => canSeeFeature(item.featureKey)))}
                    </div>
                  )}
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

        {/* System Management */}
        {renderSection("systemManagement", "System Management", systemManagementItems)}

        {/* Productivity */}
        {renderSection("productivity", "Productivity", productivityItems)}

        {/* People */}
        {renderSection("people", "People", peopleItems)}

        {/* Affiliate Center */}
        {renderSection("affiliateCenter", "Affiliate Center", affiliateCenterItems)}

        {/* Content */}
        {renderSection("content", "Content", contentItems)}

        {/* SuperAdmin Controls - Only visible to superadmins */}
        {showSuperAdminLink && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/portal/admin/superadmin"}
                    tooltip="SuperAdmin Controls"
                  >
                    <Link href="/portal/admin/superadmin">
                      <Shield className="h-4 w-4" />
                      <span>SuperAdmin Controls</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {/* Role Switcher for SuperAdmin */}
        <RoleSwitcherCompact />
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">{getDisplayName()}</span>
                    <span className="text-xs text-sidebar-foreground/60 capitalize">{profile.role.replace("_", " ")}</span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/portal/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/portal/settings?tab=notifications">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/portal/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
