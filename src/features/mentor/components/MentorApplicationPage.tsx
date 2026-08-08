"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, CheckCircle2, AlertCircle, ChevronRight,
  Briefcase, Tag, Globe2, DollarSign, FileText, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/shared/components/BrandMark";
import { useMentorApplication } from "@/features/mentor/hooks/useMentorApplication";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirebaseApp } from "@/lib/firebase/config";
import { readDocument } from "@/lib/firebase/firestore";

// ─── Expertise / Tag options ─────────────────────────────────────────────────
const EXPERTISE_OPTIONS = [
  "Manufacturing", "Export", "Pricing", "D2C", "Textile",
  "Grants", "Government Schemes", "Fundraising", "DPIIT", "Seed Stage",
  "Loans", "Compliance", "GST", "MSME", "Cash Flow",
  "Agriculture", "Rural Business", "NABARD", "Food Processing", "SHG",
  "Technology", "SaaS", "Product Development", "Startup India",
  "Retail", "E-commerce", "Brand Building", "Marketing",
  "Investor Relations", "Pitch Deck", "Angel Investors", "VC",
  "Handicraft", "GI Tags", "Legal", "Operations", "HR", "International Trade",
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
      <AlertCircle className="size-3" />
      {message}
    </p>
  );
}

function SectionTitle({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="grid size-9 place-items-center rounded-xl bg-femtrex-violet/15">
        <Icon className="size-4 text-femtrex-violet" />
      </div>
      <h3 className="text-base font-semibold text-white">{label}</h3>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function MentorApplicationPage() {
  const router = useRouter();

  // ── Firestore guard: redirect returning mentors before showing the form ──
  const [guardChecking, setGuardChecking] = useState(true);

  useEffect(() => {
    const app = getFirebaseApp();
    if (!app) {
      // No Firebase config — cannot authenticate, send to login
      router.replace("/sign-up-login-screen" as any);
      return;
    }

    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe(); // only need the first emission
      if (!user) {
        router.replace("/sign-up-login-screen" as any);
        return;
      }
      try {
        const existing = await readDocument("mentors", user.uid);
        if (existing) {
          // Profile already exists — skip form, go straight to dashboard
          router.replace("/mentor-dashboard" as any);
          return;
        }
      } catch {
        // If the check fails, let the user fill the form anyway
      }
      setGuardChecking(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Pre-fill name from Firebase current user's displayName
  const app = getFirebaseApp();
  const displayName = app ? getAuth(app).currentUser?.displayName ?? "" : "";

  const {
    form,
    setField,
    toggleTag,
    errors,
    submitting,
    submitError,
    savedProfile,
    submit,
  } = useMentorApplication(displayName);

  // ── Show full-screen spinner while the Firestore guard resolves ──
  if (guardChecking) {
    return (
      <main className="min-h-screen bg-femtrex-navy flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-femtrex-soft">
          <Loader2 className="size-10 animate-spin text-femtrex-violet" />
          <p className="text-sm">Checking your profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-femtrex-navy">
      {/* Top Nav */}
      <header className="border-b border-femtrex-line px-6 py-4 flex items-center gap-4">
        <BrandMark />
        <ChevronRight className="size-4 text-femtrex-soft" />
        <span className="text-femtrex-soft text-sm">Mentor Application</span>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Page heading */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-femtrex-violet/40 bg-femtrex-violet/10 px-4 py-1.5 text-sm text-femtrex-violet mb-5">
            <Star className="size-3.5" />
            Mentor Profile Setup
          </div>
          <h1 className="text-4xl font-semibold text-white leading-tight">
            Build Your <span className="gradient-text">Mentor Profile</span>
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-femtrex-soft leading-relaxed">
            Your profile is matched to founders in real-time using expertise tags.
            Fill in the details below — your profile goes live immediately on submit.
          </p>
        </div>

        {/* Submission error */}
        {submitError && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium mb-0.5">Submission failed</p>
              <p className="opacity-80">{submitError}</p>
            </div>
          </div>
        )}

        <div className="space-y-8">

          {/* ── Section 1: Basic Info ── */}
          <div className="rounded-[24px] border border-femtrex-line bg-femtrex-panel p-7">
            <SectionTitle icon={Briefcase} label="Basic Information" />
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Name */}
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="mentor-name">Full Name *</Label>
                <Input
                  id="mentor-name"
                  placeholder="e.g. Kavitha Reddy"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                />
                <FieldError message={errors.name} />
              </div>

              {/* Role */}
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="mentor-role">Role / Title *</Label>
                <Input
                  id="mentor-role"
                  placeholder="e.g. D2C Textile & Export Mentor"
                  value={form.role}
                  onChange={(e) => setField("role", e.target.value)}
                />
                <FieldError message={errors.role} />
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="mentor-industry">Industry Focus *</Label>
                <Input
                  id="mentor-industry"
                  placeholder="e.g. Textile Manufacturing"
                  value={form.industry}
                  onChange={(e) => setField("industry", e.target.value)}
                />
                <FieldError message={errors.industry} />
              </div>

              {/* Years Experience */}
              <div className="space-y-2">
                <Label htmlFor="mentor-years">Years of Experience *</Label>
                <Input
                  id="mentor-years"
                  type="number"
                  min={0}
                  max={60}
                  placeholder="e.g. 12"
                  value={form.years_experience || ""}
                  onChange={(e) => setField("years_experience", parseInt(e.target.value, 10) || 0)}
                />
                <FieldError message={errors.years_experience} />
              </div>
            </div>
          </div>

          {/* ── Section 2: Expertise Tags ── */}
          <div className="rounded-[24px] border border-femtrex-line bg-femtrex-panel p-7">
            <SectionTitle icon={Tag} label="Areas of Expertise *" />
            <p className="mb-5 text-sm text-femtrex-soft">
              Select all that apply. These tags are used by the AI matching algorithm to connect you with relevant founders.
            </p>
            <div className="flex flex-wrap gap-2">
              {EXPERTISE_OPTIONS.map((tag) => {
                const selected = form.expertise.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag, "expertise")}
                    className={`rounded-full border px-3.5 py-1.5 text-sm transition-all duration-150 ${
                      selected
                        ? "border-femtrex-violet bg-femtrex-violet text-white shadow-[0_0_12px_rgba(139,92,246,0.35)]"
                        : "border-femtrex-line text-femtrex-soft hover:border-femtrex-violet/50 hover:text-white"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            {form.expertise.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-femtrex-soft mr-1 self-center">Selected:</span>
                {form.expertise.map((t) => (
                  <Badge key={t} variant="violet">{t}</Badge>
                ))}
              </div>
            )}
            <FieldError message={errors.expertise} />
          </div>

          {/* ── Section 3: Pricing & Availability ── */}
          <div className="rounded-[24px] border border-femtrex-line bg-femtrex-panel p-7">
            <SectionTitle icon={DollarSign} label="Pricing & Availability" />
            <div className="space-y-2">
              <Label htmlFor="mentor-price">Session Price / Availability *</Label>
              <Input
                id="mentor-price"
                placeholder='e.g. "Free through WEP" or "₹499 / 30 min"'
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
              />
              <p className="text-xs text-femtrex-soft">You can update your time slots later from your dashboard.</p>
              <FieldError message={errors.price} />
            </div>
          </div>

          {/* ── Section 4: Bio ── */}
          <div className="rounded-[24px] border border-femtrex-line bg-femtrex-panel p-7">
            <SectionTitle icon={FileText} label="Short Bio *" />
            <div className="space-y-2">
              <Label htmlFor="mentor-bio">Tell founders about your journey and what you can help with</Label>
              <textarea
                id="mentor-bio"
                rows={5}
                placeholder="e.g. 18 years in textile manufacturing and exports. Built a ₹40 Cr D2C brand from a single loom. Specialist in export compliance, pricing strategy, and MSME scheme applications..."
                value={form.bio}
                onChange={(e) => setField("bio", e.target.value)}
                className="w-full resize-none rounded-2xl border border-femtrex-line bg-femtrex-navy px-4 py-3 text-sm text-white placeholder:text-femtrex-soft/50 focus:border-femtrex-violet focus:outline-none transition"
              />
              <div className="flex justify-between text-xs text-femtrex-soft">
                <FieldError message={errors.bio} />
                <span className={form.bio.length < 30 ? "text-red-400" : "text-femtrex-mint"}>
                  {form.bio.length} chars {form.bio.length < 30 ? `(${30 - form.bio.length} more needed)` : "✓"}
                </span>
              </div>
            </div>
          </div>

          {/* ── Section 5: Tags (optional, defaults to expertise) ── */}
          <div className="rounded-[24px] border border-femtrex-line bg-femtrex-panel p-7">
            <SectionTitle icon={Globe2} label="Additional Matching Tags" />
            <p className="mb-5 text-sm text-femtrex-soft">
              Optional. If left empty, your expertise tags above are used for matching. Add extra tags here to broaden your visibility.
            </p>
            <div className="flex flex-wrap gap-2">
              {EXPERTISE_OPTIONS.map((tag) => {
                const selected = form.tags.includes(tag);
                return (
                  <button
                    key={`tag-${tag}`}
                    type="button"
                    onClick={() => toggleTag(tag, "tags")}
                    className={`rounded-full border px-3.5 py-1.5 text-sm transition-all duration-150 ${
                      selected
                        ? "border-femtrex-pink bg-femtrex-pink/20 text-femtrex-pink"
                        : "border-femtrex-line text-femtrex-soft hover:border-femtrex-pink/40 hover:text-white"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Preview Card ── */}
          {(form.name || form.role || form.expertise.length > 0) && (
            <div className="rounded-[24px] premium-border p-7">
              <p className="mb-4 text-xs uppercase tracking-widest text-femtrex-soft">Profile Preview</p>
              <div className="flex items-start gap-4">
                <div className="grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-femtrex-violet to-femtrex-pink font-bold text-lg text-white">
                  {form.name ? form.name.split(" ").map((p) => p[0]).join("").slice(0, 2) : "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-lg font-semibold text-white">{form.name || "Your Name"}</h4>
                  <p className="text-femtrex-soft text-sm">{form.role || "Your Role"}</p>
                  {form.industry && <p className="text-xs text-femtrex-soft/70 mt-0.5">{form.industry} · {form.years_experience || 0} yrs exp</p>}
                  {form.expertise.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {form.expertise.slice(0, 5).map((t) => (
                        <Badge key={t} variant="violet">{t}</Badge>
                      ))}
                      {form.expertise.length > 5 && (
                        <span className="text-xs text-femtrex-soft">+{form.expertise.length - 5} more</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Submit ── */}
          <div className="flex flex-col items-center gap-4 pt-2 pb-8">
            <Button
              id="mentor-apply-submit"
              type="button"
              variant="gradient"
              size="lg"
              className="w-full max-w-md text-base h-14"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? (
                <><Loader2 className="size-5 animate-spin" /> Submitting Profile...</>
              ) : (
                <><CheckCircle2 className="size-5" /> Submit Mentor Profile</>
              )}
            </Button>
            <p className="text-xs text-center text-femtrex-soft max-w-xs">
              Your profile is saved to our database immediately and is matchable to founders right away.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
