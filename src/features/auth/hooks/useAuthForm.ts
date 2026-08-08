"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { demoAccounts } from "@/features/auth/constants/demoAccounts";
import { loginWithGoogle, submitAuth } from "@/features/auth/services/authService";
import type { AuthFormValues, AuthMode } from "@/features/auth/types/auth";

const schema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
  remember: z.boolean().optional()
});

export function useAuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "priya@texcraft.in", password: "founder123", remember: false }
  });

  async function onSubmit(values: AuthFormValues) {
    setLoading(true);
    try {
      await submitAuth(mode, values);
      router.push("/dashboard");
    } catch (err) {
      console.warn("Auth submission error:", err);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err) {
      console.warn("Google auth error:", err);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  function autofill(email: string) {
    const account = demoAccounts.find((item) => item.email === email);
    form.setValue("email", email);
    form.setValue("password", account?.password ?? "founder123");
  }

  return { form, mode, setMode, loading, onSubmit, google, autofill };
}
