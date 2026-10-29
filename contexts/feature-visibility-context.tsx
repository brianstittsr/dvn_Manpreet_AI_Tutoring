"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  FeatureVisibilitySettings,
  UserRole,
  FeatureKey,
  SectionKey,
  PlatformToolKey,
  DEFAULT_ROLE_VISIBILITY,
  subscribeToFeatureVisibility,
  isFeatureVisible,
  isSectionVisible,
  isPlatformToolVisible,
} from "@/lib/feature-visibility";
import { useUserProfile } from "@/contexts/user-profile-context";
import { isSuperAdmin } from "@/lib/permissions";

interface FeatureVisibilityContextType {
  settings: FeatureVisibilitySettings;
  isLoading: boolean;
  // Current effective role (actual role or preview role)
  effectiveRole: UserRole;
  // Preview mode for SuperAdmin
  previewRole: UserRole | null;
  setPreviewRole: (role: UserRole | null) => void;
  isPreviewMode: boolean;
  // Visibility checks
  canSeeFeature: (featureKey: FeatureKey) => boolean;
  canSeeSection: (sectionKey: SectionKey) => boolean;
  canSeePlatformTool: (toolKey: PlatformToolKey) => boolean;
  // Refresh settings
  refreshSettings: () => void;
}

const FeatureVisibilityContext = createContext<FeatureVisibilityContextType | undefined>(undefined);

export function FeatureVisibilityProvider({ children }: { children: React.ReactNode }) {
  const { linkedTeamMember } = useUserProfile();
  const actualRole = (linkedTeamMember?.role as UserRole) || "affiliate";
  const isSuperAdminUser = isSuperAdmin(actualRole);

  const [settings, setSettings] = useState<FeatureVisibilitySettings>({
    roleVisibility: DEFAULT_ROLE_VISIBILITY,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [previewRole, setPreviewRole] = useState<UserRole | null>(null);

  // Effective role is preview role if in preview mode, otherwise actual role
  const effectiveRole = previewRole || actualRole;
  const isPreviewMode = previewRole !== null && isSuperAdminUser;

  // Subscribe to settings changes
  useEffect(() => {
    const unsubscribe = subscribeToFeatureVisibility((newSettings) => {
      setSettings(newSettings);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Clear preview role if user is no longer superadmin
  useEffect(() => {
    if (!isSuperAdminUser && previewRole) {
      setPreviewRole(null);
    }
  }, [isSuperAdminUser, previewRole]);

  const canSeeFeature = useCallback(
    (featureKey: FeatureKey): boolean => {
      // SuperAdmin always sees everything when not in preview mode
      if (isSuperAdminUser && !isPreviewMode) {
        return true;
      }
      return isFeatureVisible(featureKey, effectiveRole, settings);
    },
    [effectiveRole, settings, isSuperAdminUser, isPreviewMode]
  );

  const canSeeSection = useCallback(
    (sectionKey: SectionKey): boolean => {
      // SuperAdmin always sees everything when not in preview mode
      if (isSuperAdminUser && !isPreviewMode) {
        return true;
      }
      return isSectionVisible(sectionKey, effectiveRole, settings);
    },
    [effectiveRole, settings, isSuperAdminUser, isPreviewMode]
  );

  const canSeePlatformTool = useCallback(
    (toolKey: PlatformToolKey): boolean => {
      // SuperAdmin always sees everything when not in preview mode
      if (isSuperAdminUser && !isPreviewMode) {
        return true;
      }
      return isPlatformToolVisible(toolKey, effectiveRole, settings);
    },
    [effectiveRole, settings, isSuperAdminUser, isPreviewMode]
  );

  const refreshSettings = useCallback(() => {
    setIsLoading(true);
    // The subscription will automatically update
  }, []);

  const handleSetPreviewRole = useCallback(
    (role: UserRole | null) => {
      if (!isSuperAdminUser) return;
      setPreviewRole(role);
    },
    [isSuperAdminUser]
  );

  return (
    <FeatureVisibilityContext.Provider
      value={{
        settings,
        isLoading,
        effectiveRole,
        previewRole,
        setPreviewRole: handleSetPreviewRole,
        isPreviewMode,
        canSeeFeature,
        canSeeSection,
        canSeePlatformTool,
        refreshSettings,
      }}
    >
      {children}
    </FeatureVisibilityContext.Provider>
  );
}

export function useFeatureVisibility() {
  const context = useContext(FeatureVisibilityContext);
  if (context === undefined) {
    throw new Error("useFeatureVisibility must be used within a FeatureVisibilityProvider");
  }
  return context;
}
