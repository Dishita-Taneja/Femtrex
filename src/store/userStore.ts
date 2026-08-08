"use client";

import { create } from "zustand";
import { founderProfile } from "@/shared/constants/demo-data";

type UserState = {
  user: typeof founderProfile;
  onboardingComplete: boolean;
  setUser: (user: typeof founderProfile) => void;
  completeOnboarding: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: founderProfile,
  onboardingComplete: false,
  setUser: (user) => set({ user }),
  completeOnboarding: () => set({ onboardingComplete: true })
}));
