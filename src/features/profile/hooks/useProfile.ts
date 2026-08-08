"use client";

import { useState } from "react";
import { founderProfile } from "@/shared/constants/demo-data";

export function useProfile() {
  const [profile, setProfile] = useState({
    name: founderProfile.name,
    email: founderProfile.email,
    company: founderProfile.company,
    industry: founderProfile.industry
  });
  return { profile, setProfile };
}
