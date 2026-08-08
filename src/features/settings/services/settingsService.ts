import { saveDocument } from "@/lib/firebase/firestore";
import type { SettingsState } from "@/features/settings/types/settings";

export function saveSettings(settings: SettingsState) {
  return saveDocument("settings", "priya-demo", { ...settings, updatedAt: new Date().toISOString() });
}
