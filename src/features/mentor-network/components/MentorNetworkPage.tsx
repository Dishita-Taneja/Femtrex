"use client";

import { CalendarCheck, Star, Video, RefreshCw, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/shared/components/SectionHeading";
import { mentorExpertise } from "@/features/mentor-network/constants/filters";
import { useMentors } from "@/features/mentor-network/hooks/useMentors";

export function MentorNetworkPage() {
  const { query, setQuery, expertise, setExpertise, mentors, loading, error, bookingStatus, bookSession, refetch } = useMentors("priya-demo");

  return (
    <section className="p-6 lg:p-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <SectionHeading title="Mentor Network" subtitle="AI-matched mentors powered by tag overlap & Gemini match explanations." />
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => refetch()} title="Refresh Mentors">
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search mentors, skills, sectors..." className="xl:max-w-md" />
        </div>
      </div>

      {bookingStatus && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-femtrex-mint/30 bg-femtrex-mint/10 p-4 text-femtrex-mint">
          <CheckCircle2 className="size-5 shrink-0" />
          <p className="text-sm font-medium">{bookingStatus}</p>
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-5 text-red-400" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="border-red-500/40 text-red-300 hover:bg-red-500/20">
            <RefreshCw className="mr-2 size-3" /> Retry
          </Button>
        </div>
      )}

      <div className="mt-7 flex gap-3 overflow-x-auto pb-1">
        {mentorExpertise.map((item) => (
          <button
            key={item}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${
              expertise === item ? "border-femtrex-violet bg-femtrex-violet text-white" : "border-femtrex-line text-femtrex-soft hover:text-white"
            }`}
            onClick={() => setExpertise(expertise === item ? undefined : item)}
          >
            {item}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-[24px] border border-femtrex-line bg-femtrex-panel p-16 text-femtrex-soft">
          <Loader2 className="size-8 animate-spin text-femtrex-violet mb-4" />
          <p className="text-lg font-medium text-white">Matching top advisors from FastAPI Mentor Network...</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          {mentors.map((mentor: any) => (
            <article key={mentor.id} className="rounded-[24px] border border-femtrex-line bg-femtrex-panel p-6 transition hover:-translate-y-1 hover:border-femtrex-violet flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{mentor.name}</h3>
                    <p className="mt-1 text-femtrex-soft">{mentor.role}</p>
                  </div>
                  <div className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-femtrex-violet to-femtrex-pink font-bold text-white shrink-0">
                    {mentor.name.split(" ").map((p: string) => p[0]).join("")}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(mentor.expertise || []).map((tag: string) => (
                    <Badge key={tag} variant="violet">{tag}</Badge>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-femtrex-soft">
                  <span className="flex items-center gap-2"><Star className="size-4 text-femtrex-amber" /> {mentor.rating} rating</span>
                  <span>{mentor.sessions} sessions</span>
                  <span className="col-span-2 flex items-center gap-2"><CalendarCheck className="size-4 text-femtrex-mint" /> {mentor.nextSlot || "Tomorrow, 10:00 AM"}</span>
                </div>

                <div className="mt-5 rounded-2xl border border-femtrex-violet/20 bg-femtrex-violet/5 p-4 text-xs text-femtrex-violet leading-relaxed">
                  <span className="font-semibold block mb-1">Why this mentor fits you:</span>
                  {mentor.why_fits || mentor.review || "Deep expertise in funding and scaling."}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3 border-t border-femtrex-line/50 pt-4">
                <span className="text-sm text-femtrex-soft font-medium">{mentor.price || "Free through WEP"}</span>
                <Button
                  variant="gradient"
                  onClick={() => bookSession(mentor.id, `Discuss ${mentor.role} strategy for my business`)}
                >
                  <Video className="size-4" /> Book Session
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
