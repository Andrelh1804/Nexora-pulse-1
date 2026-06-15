import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import eventBus from "../lib/eventBus";
import logger from "../lib/logger";

export type NotificationChannel = "in_app" | "email" | "whatsapp" | "push";
export type NotificationType =
  | "success" | "error" | "warning" | "info"
  | "xp_gained" | "badge_unlocked" | "alert_metric"
  | "lead_created" | "campaign_alert" | "ai_ready" | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  tenantId?: string;
  userId?: string;
  isRead: boolean;
  isDismissed: boolean;
  createdAt: Date;
  expiresAt?: Date;
  actionLabel?: string;
  actionCallback?: () => void;
  data?: Record<string, unknown>;
  xpAmount?: number;
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  add: (params: Omit<Notification, "id" | "isRead" | "isDismissed" | "createdAt">) => Notification;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  toast: Notification | null;
  clearToast: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const MAX_NOTIFICATIONS = 100;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toast, setToast] = useState<Notification | null>(null);

  const add = useCallback((params: Omit<Notification, "id" | "isRead" | "isDismissed" | "createdAt">): Notification => {
    const notification: Notification = {
      ...params,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      isRead: false,
      isDismissed: false,
      createdAt: new Date(),
    };

    setNotifications((prev) => [notification, ...prev].slice(0, MAX_NOTIFICATIONS));

    if (params.channel === "in_app") {
      setToast(notification);
      setTimeout(() => setToast(null), 4500);
    }

    logger.info(`[Notification] ${notification.type}: ${notification.title}`, {
      tenantId: params.tenantId,
      module: "Notifications",
      data: { channel: params.channel, type: params.type },
    });

    eventBus.emit("notification.sent", {
      tenantId: params.tenantId ?? "system",
      userId: params.userId ?? "system",
      type: params.type,
      channel: params.channel,
    });

    return notification;
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isDismissed: true } : n))
    );
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isDismissed: true })));
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  const unreadCount = notifications.filter((n) => !n.isRead && !n.isDismissed).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications: notifications.filter((n) => !n.isDismissed),
        unreadCount,
        add,
        markAsRead,
        markAllAsRead,
        dismiss,
        dismissAll,
        toast,
        clearToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
}

export default NotificationContext;
