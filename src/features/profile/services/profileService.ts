import { saveDocument } from "@/lib/firebase/firestore";
import type { FounderProfile } from "@/features/profile/types/profile";

export function saveProfile(profile: FounderProfile) {
  return saveDocument("profiles", "priya-demo", { ...profile, updatedAt: new Date().toISOString() });
}
