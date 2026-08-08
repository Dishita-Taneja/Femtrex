"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { getFirebaseApp } from "@/lib/firebase/config";
import { readDocument, queryDocuments } from "@/lib/firebase/firestore";
import type { MentorProfile, MentorSession } from "@/features/mentor/types/mentorTypes";

import { getApi } from "@/lib/api";

export function useMentorDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [sessions, setSessions] = useState<MentorSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const app = getFirebaseApp();

    // ── No Firebase config: can't authenticate → send to login ──
    if (!app) {
      setError("Authentication is unavailable. Please sign in.");
      setLoading(false);
      router.replace("/sign-up-login-screen" as any);
      return;
    }

    const auth = getAuth(app);

    // Wait for Firebase to rehydrate the persisted session before reading uid.
    // onAuthStateChanged fires once with the current user (or null) on mount.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // No authenticated session → redirect to sign-in; never show demo data
        setLoading(false);
        router.replace("/sign-up-login-screen" as any);
        return;
      }

      const currentUid = user.uid;
      setUid(currentUid);

      try {
        // 1. Fetch mentor profile from Firestore mentors/{uid} or local cache
        let mentorDoc = await readDocument("mentors", currentUid);
        
        // 2. Fallback: try fetching from backend API GET /mentors/{uid}
        if (!mentorDoc) {
          try {
            mentorDoc = await getApi<Record<string, unknown>>(`/mentors/${currentUid}`);
          } catch {}
        }

        if (mentorDoc) {
          setProfile(mentorDoc as unknown as MentorProfile);
        }

        // Fetch sessions booked with this mentor from mentor_sessions collection
        const sessionDocs = await queryDocuments("mentor_sessions", "mentor_id", currentUid);
        setSessions(sessionDocs as unknown as MentorSession[]);
      } catch (e: any) {
        console.warn("Dashboard load notice:", e);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  return { uid, profile, sessions, loading, error };
}
