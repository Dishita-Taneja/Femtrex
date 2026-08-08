"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MentorFormData } from "@/features/mentor/types/mentorTypes";
import { registerMentor } from "@/features/mentor/services/mentorApplicationService";

const EMPTY_FORM: MentorFormData = {
  name: "",
  role: "",
  expertise: [],
  industry: "",
  years_experience: 0,
  price: "",
  bio: "",
  tags: [],
};

const REQUIRED_FIELDS: (keyof MentorFormData)[] = [
  "name",
  "role",
  "expertise",
  "industry",
  "years_experience",
  "price",
  "bio",
];

export function useMentorApplication(prefillName?: string) {
  const router = useRouter();
  const [form, setForm] = useState<MentorFormData>({
    ...EMPTY_FORM,
    name: prefillName ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof MentorFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedProfile, setSavedProfile] = useState<object | null>(null);

  function setField<K extends keyof MentorFormData>(key: K, value: MentorFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear field-level error on change
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function toggleTag(tag: string, field: "expertise" | "tags") {
    setForm((prev) => {
      const current = prev[field] as string[];
      const next = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag];
      return { ...prev, [field]: next };
    });
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof MentorFormData, string>> = {};

    if (!form.name.trim()) newErrors.name = "Full name is required.";
    if (!form.role.trim()) newErrors.role = "Role / title is required.";
    if (form.expertise.length === 0) newErrors.expertise = "Select at least one area of expertise.";
    if (!form.industry.trim()) newErrors.industry = "Industry focus is required.";
    if (!form.years_experience || form.years_experience <= 0) newErrors.years_experience = "Enter a valid number of years.";
    if (!form.price.trim()) newErrors.price = "Pricing / session fee is required.";
    if (!form.bio.trim() || form.bio.length < 30) newErrors.bio = "Bio must be at least 30 characters.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function submit() {
    setSubmitError(null);
    if (!validate()) return;

    const payload: MentorFormData = {
      ...form,
      tags: form.tags.length > 0 ? form.tags : form.expertise,
    };

    setSubmitting(true);
    try {
      const profile = await registerMentor(payload);
      setSavedProfile(profile);
      // Navigate to dashboard after successful registration
      router.push("/mentor-dashboard" as any);
    } catch (err: any) {
      setSubmitError(
        err?.message ?? "Registration failed. Please ensure the backend is running and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return {
    form,
    setField,
    toggleTag,
    errors,
    submitting,
    submitError,
    savedProfile,
    submit,
  };
}
