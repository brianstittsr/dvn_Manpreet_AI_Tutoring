/**
 * In-Browser Notification System
 *
 * Shows in-browser toasts and browser notifications while the site is open.
 */

import { toast } from "sonner";

/** Notification event identifier (free-form string, e.g. "rock_completed"). */
export type NotificationEventType = string;

const NOTIFICATION_LABELS: Record<string, string> = {
  meeting_logged: "Meeting Logged",
  meeting_completed: "Meeting Completed",
  team_member_added: "Team Member Added",
  new_lead: "New Lead",
  affiliate_joined: "Affiliate Joined",
  referral_submitted: "Referral Submitted",
};

export interface InAppNotification {
  id: string;
  type: NotificationEventType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: Record<string, unknown>;
}

// Notification styling based on event type
const getNotificationStyle = (eventType: NotificationEventType): {
  icon: string;
  variant: "default" | "success" | "warning" | "error" | "info";
} => {
  switch (eventType) {
    // Success events
    case "meeting_completed":
      return { icon: "✅", variant: "success" };

    // Info events
    case "new_lead":
    case "affiliate_joined":
    case "referral_submitted":
      return { icon: "🎉", variant: "info" };
    
    // Default events
    default:
      return { icon: "📢", variant: "default" };
  }
};

// Format notification title based on event type
const getNotificationTitle = (eventType: NotificationEventType): string => {
  return NOTIFICATION_LABELS[eventType] || "Notification";
};

// Format notification message based on event type and data
const formatNotificationMessage = (
  eventType: NotificationEventType,
  data: Record<string, unknown>
): string => {
  switch (eventType) {
    case "new_lead":
      return `New lead: ${data.name || data.company || "Unknown"}`;

    case "team_member_added":
      return `Welcome ${data.name || "new team member"}!`;
    
    case "affiliate_joined":
      return `New affiliate: ${data.name || data.company || "Unknown"}`;
    
    case "meeting_completed":
      return `Meeting completed: ${data.title || data.type || "Meeting"}`;
    
    case "referral_submitted":
      return `New referral from ${data.referrer || "affiliate"}`;

    default:
      return data.message ? String(data.message) : "New notification";
  }
};

/**
 * Show an in-browser notification toast
 */
export function showInAppNotification(
  eventType: NotificationEventType,
  data: Record<string, unknown>,
  options?: {
    duration?: number;
    action?: { label: string; onClick: () => void };
  }
): void {
  const { icon, variant } = getNotificationStyle(eventType);
  const title = getNotificationTitle(eventType);
  const message = formatNotificationMessage(eventType, data);
  
  const toastOptions: Parameters<typeof toast>[1] = {
    description: message,
    duration: options?.duration || 5000,
  };
  
  if (options?.action) {
    toastOptions.action = {
      label: options.action.label,
      onClick: options.action.onClick,
    };
  }
  
  // Use appropriate toast variant
  switch (variant) {
    case "success":
      toast.success(`${icon} ${title}`, toastOptions);
      break;
    case "warning":
      toast.warning(`${icon} ${title}`, toastOptions);
      break;
    case "error":
      toast.error(`${icon} ${title}`, toastOptions);
      break;
    case "info":
      toast.info(`${icon} ${title}`, toastOptions);
      break;
    default:
      toast(`${icon} ${title}`, toastOptions);
  }
}

/**
 * Show a browser notification (requires permission)
 */
export async function showBrowserNotification(
  eventType: NotificationEventType,
  data: Record<string, unknown>
): Promise<boolean> {
  if (!("Notification" in window)) {
    return false;
  }
  
  if (Notification.permission === "denied") {
    return false;
  }
  
  if (Notification.permission !== "granted") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return false;
    }
  }
  
  const title = getNotificationTitle(eventType);
  const message = formatNotificationMessage(eventType, data);
  const { icon } = getNotificationStyle(eventType);
  
  new Notification(`${icon} ${title}`, {
    body: message,
    icon: "/curioquest-logo.svg",
    tag: eventType,
  });
  
  return true;
}

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!("Notification" in window)) {
    return "unsupported";
  }
  
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission;
  }
  
  return await Notification.requestPermission();
}

/**
 * Check if browser notifications are supported and enabled
 */
export function getBrowserNotificationStatus(): "granted" | "denied" | "default" | "unsupported" {
  if (!("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}
