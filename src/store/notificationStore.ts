"use client";

import { create } from "zustand";
import { notifications as seed } from "@/shared/constants/demo-data";
import type { NotificationItem } from "@/shared/types/domain";

type NotificationState = {
  notifications: NotificationItem[];
  markAllRead: () => void;
  push: (item: NotificationItem) => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: seed,
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((item) => ({ ...item, unread: false }))
    })),
  push: (item) => set((state) => ({ notifications: [item, ...state.notifications] }))
}));
