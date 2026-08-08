"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, ShieldCheck, Users, BookOpen, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/shared/components/BrandMark";
import { StatCard } from "@/shared/components/StatCard";
import { demoAccounts } from "@/features/auth/constants/demoAccounts";
import { useAuthForm } from "@/features/auth/hooks/useAuthForm";
import { signupMentorWithEmail, loginMentorWithGoogle, loginWithEmail } from "@/lib/firebase/auth";
import { readDocument } from "@/lib/firebase/firestore";

type UserRole = "founder" | "mentor";
type MentorAuthMode = "login" | "signup";

// ─── Mentor Auth Panel ──────────────────────────────────────────────────────
function MentorAuthPanel() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<MentorAuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkAndRoute(uid: string) {
    // Check if mentor profile already exists in Firestore
    try {
      const existing = await readDocument("mentors", uid);
      if (existing) {
        router.push("/mentor-dashboard" as any);
      } else {
        router.push("/mentor-apply" as any);
      }
    } catch {
      router.push("/mentor-apply" as any);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (authMode === "signup") {
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    try {
      if (authMode === "signup") {
        // ── New mentor: create Firebase account, then check Firestore ──
        const result = await signupMentorWithEmail(email, password);
        const uid = (result as any)?.user?.uid ?? (result as any)?.uid;
        if (!uid) throw new Error("Could not determine user ID after sign-up.");
        await checkAndRoute(uid);
      } else {
        // ── Returning mentor: sign in with existing credentials ──
        const result = await loginWithEmail(email, password);
        const uid = (result as any)?.user?.uid ?? (result as any)?.uid;
        if (!uid) throw new Error("Could not determine user ID after sign-in.");
        await checkAndRoute(uid);
      }
    } catch (err: any) {
      // Map Firebase error codes to human-readable messages
      const code = err?.code ?? "";
      if (code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Try signing in instead.");
        setAuthMode("login");
      } else if (code === "auth/weak-password") {
        setError("Password is too weak. Use at least 8 characters.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/wrong-password" || code === "auth/user-not-found" || code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else {
        setError(err?.message ?? "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    try {
      const result = await loginMentorWithGoogle();
      // Read uid directly from the credential — no async currentUser race
      const uid = (result as any)?.user?.uid ?? (result as any)?.uid;
      if (!uid) throw new Error("Google sign-in did not return a user ID.");
      await checkAndRoute(uid);
    } catch (err: any) {
      setError(err?.message ?? "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xl">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-femtrex-violet/40 bg-femtrex-violet/10 px-4 py-1.5 text-sm text-femtrex-violet mb-4">
          <BookOpen className="size-3.5" />
          Mentor Portal
        </div>
        <h2 className="text-3xl font-semibold text-white">
          {authMode === "signup" ? "Join as a Mentor" : "Welcome back"}
        </h2>
        <p className="mt-2 text-femtrex-soft">
          {authMode === "signup"
            ? "Create your account and build your mentor profile"
            : "Sign in to your mentor account"}
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="mentor-email">Email address</Label>
          <Input
            id="mentor-email"
            type="email"
            placeholder="yourname@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="mentor-password">Password {authMode === "signup" && <span className="text-femtrex-soft text-xs">(min 8 characters)</span>}</Label>
          <div className="relative">
            <Input
              id="mentor-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={authMode === "signup" ? "new-password" : "current-password"}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-femtrex-soft hover:text-white transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password — sign-up only */}
        {authMode === "signup" && (
          <div className="space-y-2">
            <Label htmlFor="mentor-confirm">Confirm Password</Label>
            <div className="relative">
              <Input
                id="mentor-confirm"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>
        )}

        <Button
          id="mentor-auth-submit"
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <><Loader2 className="size-4 animate-spin" /> Working...</>
          ) : authMode === "signup" ? (
            "Create Mentor Account"
          ) : (
            "Sign In"
          )}
        </Button>

        <div className="flex items-center gap-4 text-sm text-femtrex-soft">
          <div className="h-px flex-1 bg-femtrex-line" />
          or
          <div className="h-px flex-1 bg-femtrex-line" />
        </div>

        <Button
          id="mentor-google-signin"
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <Mail className="size-5" />
          Continue with Google
        </Button>
      </form>

      <div className="mt-6 flex justify-center gap-1 text-sm text-femtrex-soft">
        <span>{authMode === "signup" ? "Already have an account?" : "New mentor?"}</span>
        <button
          id="mentor-toggle-mode"
          type="button"
          className="text-femtrex-violet hover:underline"
          onClick={() => { setAuthMode(authMode === "signup" ? "login" : "signup"); setError(null); }}
        >
          {authMode === "signup" ? "Sign in" : "Create account"}
        </button>
      </div>

      {/* Info note */}
      <div className="mt-6 rounded-[20px] border border-femtrex-line bg-femtrex-panel p-4 text-xs text-femtrex-soft leading-relaxed">
        <p className="font-medium text-white mb-1">After signing up</p>
        <p>You'll complete a short profile form covering your expertise, industry focus, and availability. Your profile goes live immediately and becomes matchable to founders.</p>
      </div>
    </div>
  );
}

// ─── Main AuthScreen ────────────────────────────────────────────────────────
export function AuthScreen() {
  const [role, setRole] = useState<UserRole>("founder");
  const { form, mode, setMode, loading, onSubmit, google, autofill } = useAuthForm();
  const title = mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset password" : "Welcome back";

  return (
    <main className="grid min-h-screen bg-femtrex-navy lg:grid-cols-2">
      {/* Left — branding */}
      <section className="flex min-h-[48vh] flex-col justify-between p-8 lg:min-h-screen lg:p-14">
        <BrandMark />
        <div className="max-w-xl">
          <h1 className="text-4xl font-light leading-tight text-white md:text-5xl">
            Your AI Cofounder for <span className="gradient-text">every milestone</span>
          </h1>
          <p className="mt-7 max-w-md text-lg leading-8 text-femtrex-soft">
            Discover funding, track business readiness, and connect with mentors — all powered by AI built for women entrepreneurs.
          </p>
          <div className="mt-12 grid max-w-lg grid-cols-2 gap-5">
            <StatCard value="14,200+" label="Women Founders" />
            <StatCard value="₹320Cr+" label="Funding Unlocked" />
            <StatCard value="890+" label="Active Mentors" />
            <StatCard value="96%" label="Satisfaction Rate" />
          </div>
          <div className="mt-5 rounded-[24px] border border-femtrex-line bg-femtrex-panel p-6 text-femtrex-soft">
            <p className="text-lg italic text-white">
              "Femtrex helped me discover ₹18L in grants I had no idea existed. The AI Copilot walked me through every application step."
            </p>
            <p className="mt-4 text-sm">- Apoorva Singh, Founder</p>
          </div>
        </div>
      </section>

      {/* Right — auth forms */}
      <section className="flex items-center justify-center p-8 lg:p-14">
        <div className="w-full max-w-xl">
          {/* Role Toggle */}
          <div className="mb-8 flex rounded-2xl border border-femtrex-line bg-femtrex-panel p-1.5">
            <button
              id="tab-founder"
              type="button"
              onClick={() => setRole("founder")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
                role === "founder"
                  ? "bg-gradient-to-r from-femtrex-violet to-femtrex-pink text-white shadow-lg"
                  : "text-femtrex-soft hover:text-white"
              }`}
            >
              <Users className="size-4" />
              Founder / Entrepreneur
            </button>
            <button
              id="tab-mentor"
              type="button"
              onClick={() => setRole("mentor")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
                role === "mentor"
                  ? "bg-gradient-to-r from-femtrex-violet to-femtrex-pink text-white shadow-lg"
                  : "text-femtrex-soft hover:text-white"
              }`}
            >
              <BookOpen className="size-4" />
              Mentor
            </button>
          </div>

          {/* Founder Panel */}
          {role === "founder" && (
            <>
              <h2 className="text-3xl font-semibold text-white">{title}</h2>
              <p className="mt-2 text-femtrex-soft">
                {mode === "signup" ? "Start your Femtrex workspace" : "Sign in to your Femtrex account"}
              </p>
              <form className="mt-10 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                {mode === "signup" && (
                  <div className="space-y-3">
                    <Label>Name</Label>
                    <Input placeholder="Priya Sharma" {...form.register("name")} />
                  </div>
                )}
                <div className="space-y-3">
                  <Label>Email address</Label>
                  <Input placeholder="you@yourstartup.in" {...form.register("email")} />
                </div>
                {mode !== "forgot" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Password</Label>
                      <button type="button" className="text-sm text-femtrex-violet" onClick={() => setMode("forgot")}>
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input type="password" placeholder="••••••••" {...form.register("password")} />
                      <Eye className="absolute right-5 top-1/2 size-5 -translate-y-1/2 text-femtrex-soft" />
                    </div>
                  </div>
                )}
                {mode === "login" && (
                  <label className="flex items-center gap-3 text-femtrex-soft">
                    <Checkbox
                      checked={form.watch("remember")}
                      onCheckedChange={(value) => form.setValue("remember", Boolean(value))}
                    />
                    Remember me for 30 days
                  </label>
                )}
                <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
                  {loading
                    ? "Working..."
                    : mode === "forgot"
                    ? "Send reset link"
                    : mode === "signup"
                    ? "Create Femtrex account"
                    : "Sign in to Femtrex"}
                </Button>
                <div className="flex items-center gap-4 text-sm text-femtrex-soft">
                  <div className="h-px flex-1 bg-femtrex-line" />
                  or
                  <div className="h-px flex-1 bg-femtrex-line" />
                </div>
                <Button type="button" variant="outline" size="lg" className="w-full" onClick={google}>
                  <Mail className="size-5" /> Continue with Google
                </Button>
              </form>
              <div className="mt-8 rounded-[24px] border border-femtrex-line bg-femtrex-panel p-6">
                <p className="mb-4 text-sm uppercase tracking-[0.24em] text-femtrex-soft">Demo accounts</p>
                <div className="space-y-3">
                  {demoAccounts.map((account) => (
                    <button
                      key={account.email}
                      className="flex w-full items-center gap-3 text-left text-femtrex-soft"
                      onClick={() => autofill(account.email)}
                    >
                      <ShieldCheck className="size-4 text-femtrex-violet" />
                      <span className="text-femtrex-violet">{account.role}</span>
                      <span>{account.email}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex justify-center gap-4 text-sm text-femtrex-soft">
                <button onClick={() => setMode(mode === "signup" ? "login" : "signup")}>
                  {mode === "signup" ? "Already have an account?" : "Create account"}
                </button>
                {mode === "forgot" && <button onClick={() => setMode("login")}>Back to sign in</button>}
              </div>
            </>
          )}

          {/* Mentor Panel */}
          {role === "mentor" && <MentorAuthPanel />}
        </div>
      </section>
    </main>
  );
}
