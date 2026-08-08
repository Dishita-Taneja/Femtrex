"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2, AlertCircle, Star, Users, CalendarCheck,
  Briefcase, Tag, DollarSign, ChevronRight, Edit3,
  BookOpen, Clock, CheckCircle2, Globe2, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/shared/components/BrandMark";
import { useMentorDashboard } from "@/features/mentor/hooks/useMentorDashboard";
import { logout } from "@/lib/firebase/auth";
import type { MentorSession } from "@/features/mentor/types/mentorTypes";

function StatPill({ value, label, icon: Icon }: { value: string | number; label: string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-femtrex-line bg-femtrex-navy/50 px-5 py-4 text-center">
      <Icon className="size-5 text-femtrex-violet mb-1" />
      <span className="text-2xl font-bold text-white">{value}</span>
      <span className="text-xs text-femtrex-soft">{label}</span>
    </div>
  );
}

function SessionCard({ session }: { session: MentorSession }) {
  return (
    <div className="rounded-[20px] border border-femtrex-line bg-femtrex-navy/40 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-medium ${
              session.status === "confirmed"
                ? "bg-femtrex-mint/15 text-femtrex-mint"
                : "bg-femtrex-amber/15 text-femtrex-amber"
            }`}>
              <CheckCircle2 className="size-3" />
              {session.status}
            </span>
          </div>
          <p className="text-sm font-medium text-white truncate">
            {session.agenda?.[0] ?? "Session booked"}
          </p>
          {session.notes && (
            <p className="mt-1 text-xs text-femtrex-soft line-clamp-2">{session.notes}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <div className="flex items-center gap-1.5 text-xs text-femtrex-soft">
            <Clock className="size-3" />
            {session.preferred_slot || "TBD"}
          </div>
          <p className="mt-1 text-xs text-femtrex-soft/70">Booking: {(session.id ?? "").slice(0, 8)}</p>
        </div>
      </div>
    </div>
  );
}

export function MentorDashboardPage() {
  const router = useRouter();
  const { uid, profile, sessions, loading, error } = useMentorDashboard();

  async function handleSignOut() {
    await logout();
    router.push("/sign-up-login-screen" as any);
  }

  return (
    <main className="min-h-screen bg-femtrex-navy">
      {/* Top Nav */}
      <header className="border-b border-femtrex-line px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BrandMark />
          <ChevronRight className="size-4 text-femtrex-soft" />
          <span className="text-femtrex-soft text-sm">Mentor Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href={"/dashboard" as any}>
            <Button variant="outline" size="sm" className="gap-2">
              <BookOpen className="size-3.5" />
              Main Dashboard
            </Button>
          </Link>
          <Button
            id="mentor-signout"
            variant="outline"
            size="sm"
            className="gap-2 text-red-400 border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
            onClick={handleSignOut}
          >
            <LogOut className="size-3.5" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-femtrex-soft gap-4">
            <Loader2 className="size-8 animate-spin text-femtrex-violet" />
            <p className="text-lg font-medium text-white">Loading your mentor dashboard...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-medium">Could not load dashboard</p>
              <p className="text-sm opacity-80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* No profile found */}
        {!loading && !error && !profile && (
          <div className="text-center py-16">
            <BookOpen className="size-12 text-femtrex-violet mx-auto mb-5 opacity-60" />
            <h2 className="text-2xl font-semibold text-white mb-3">No mentor profile found</h2>
            <p className="text-femtrex-soft mb-7 max-w-sm mx-auto">
              It looks like your profile hasn't been set up yet. Complete the application to go live.
            </p>
            <Link href={"/mentor-apply" as any}>
              <Button variant="gradient" size="lg">
                Complete Mentor Application
              </Button>
            </Link>
          </div>
        )}

        {/* Profile loaded */}
        {!loading && profile && (
          <div className="space-y-8">

            {/* ── Hero Profile Card ── */}
            <div className="rounded-[28px] premium-border p-8">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="grid size-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-femtrex-violet to-femtrex-pink text-2xl font-bold text-white shadow-[0_0_30px_rgba(139,92,246,0.4)]">
                  {profile.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                      <p className="text-femtrex-soft mt-0.5">{profile.role}</p>
                      <p className="text-xs text-femtrex-soft/70 mt-1">{profile.industry} · {profile.years_experience} years experience</p>
                    </div>
                    {profile.status && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-femtrex-mint/15 border border-femtrex-mint/30 px-3 py-1 text-xs font-medium text-femtrex-mint">
                        <span className="size-1.5 rounded-full bg-femtrex-mint" />
                        {profile.status}
                      </span>
                    )}
                  </div>

                  {/* Expertise Tags */}
                  {profile.expertise.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {profile.expertise.map((tag) => (
                        <Badge key={tag} variant="violet">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="mt-6 p-4 rounded-2xl border border-femtrex-violet/20 bg-femtrex-violet/5">
                  <p className="text-sm text-femtrex-soft leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Price */}
              {profile.price && (
                <div className="mt-4 flex items-center gap-2 text-sm text-femtrex-soft">
                  <DollarSign className="size-4 text-femtrex-mint" />
                  <span className="text-white font-medium">{profile.price}</span>
                </div>
              )}
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-3 gap-4">
              <StatPill value={profile.rating ?? 0} label="Rating" icon={Star} />
              <StatPill value={profile.sessions ?? 0} label="Sessions" icon={Users} />
              <StatPill value={sessions.length} label="Pending Bookings" icon={CalendarCheck} />
            </div>

            {/* ── Firestore Document Preview ── */}
            <div className="rounded-[24px] border border-femtrex-line bg-femtrex-panel p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid size-8 place-items-center rounded-lg bg-femtrex-amber/15">
                  <Globe2 className="size-4 text-femtrex-amber" />
                </div>
                <h3 className="font-semibold text-white text-sm">Firestore Document — mentors/{uid}</h3>
              </div>
              <pre className="text-xs text-femtrex-soft bg-femtrex-navy rounded-2xl p-4 overflow-x-auto leading-relaxed">
                {JSON.stringify(
                  {
                    id: uid,
                    name: profile.name,
                    role: profile.role,
                    expertise: profile.expertise,
                    industry: profile.industry,
                    years_experience: profile.years_experience,
                    rating: profile.rating ?? 0,
                    sessions: profile.sessions ?? 0,
                    price: profile.price,
                    nextSlot: profile.nextSlot ?? "TBD",
                    bio: profile.bio,
                    tags: profile.tags,
                    review: profile.review ?? "",
                    status: profile.status ?? "active",
                    created_at: profile.created_at ?? "—",
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            {/* ── Booked Sessions ── */}
            <div className="rounded-[24px] border border-femtrex-line bg-femtrex-panel p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="grid size-8 place-items-center rounded-lg bg-femtrex-violet/15">
                  <CalendarCheck className="size-4 text-femtrex-violet" />
                </div>
                <h3 className="font-semibold text-white">Sessions Booked with You</h3>
                {sessions.length > 0 && (
                  <span className="ml-auto rounded-full bg-femtrex-violet/20 px-2.5 py-0.5 text-xs font-medium text-femtrex-violet">
                    {sessions.length}
                  </span>
                )}
              </div>
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-femtrex-soft">
                  <CalendarCheck className="size-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No sessions booked yet.</p>
                  <p className="text-xs opacity-60 mt-1">Sessions appear here as founders book with you.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              )}
            </div>

            {/* ── Tags breakdown ── */}
            {profile.tags && profile.tags.length > 0 && (
              <div className="rounded-[24px] border border-femtrex-line bg-femtrex-panel p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="grid size-8 place-items-center rounded-lg bg-femtrex-pink/15">
                    <Tag className="size-4 text-femtrex-pink" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">Matching Tags (used by AI)</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-femtrex-pink/30 bg-femtrex-pink/10 px-3 py-1 text-xs text-femtrex-pink">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
