import { postApi } from "@/lib/api";
import { saveDocument } from "@/lib/firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFirebaseApp } from "@/lib/firebase/config";
import type { MentorFormData, MentorProfile } from "@/features/mentor/types/mentorTypes";

/**
 * Sends the mentor registration form to POST /mentors/register.
 * Saves the resulting profile under the authenticated user's UID in client cache & Firestore.
 */
export async function registerMentor(data: MentorFormData): Promise<MentorProfile> {
  const payload = {
    name: data.name,
    role: data.role,
    expertise: data.expertise,
    industry: data.industry,
    years_experience: data.years_experience,
    price: data.price,
    bio: data.bio,
    tags: data.tags.length > 0 ? data.tags : data.expertise,
  };

  const app = getFirebaseApp();
  const currentUid = app ? getAuth(app).currentUser?.uid ?? null : null;

  try {
    const profile = await postApi<MentorProfile>("/mentors/register", payload);
    const saveUid = profile.id || currentUid;
    if (saveUid) {
      await saveDocument("mentors", saveUid, profile as unknown as Record<string, unknown>);
    }
    return profile;
  } catch (err) {
    console.warn("Backend API call failed, writing mentor profile directly to Firestore:", err);

    const uid = currentUid ?? `mentor-${Date.now()}`;

    const profileData: MentorProfile = {
      id: uid,
      ...payload,
      rating: 0.0,
      sessions: 0,
      nextSlot: "TBD",
      review: "",
      status: "active",
      created_at: new Date().toISOString(),
    };

    await saveDocument("mentors", uid, profileData as unknown as Record<string, unknown>);
    return profileData;
  }
}
