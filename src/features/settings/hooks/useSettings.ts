"use client";

import { useState } from "react";
import type { SettingsState } from "@/features/settings/types/settings";

export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>({ emailAlerts: true, mentorUpdates: true, aiMemory: true });
  function update(key: keyof SettingsState, value: boolean) {
    setSettings((current) => ({ ...current, [key]: value }));
  }
  return { settings, update };
}
