"use client";

import { Building2, Mail, MapPin, Save, User, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/shared/components/SectionHeading";
import { ProgressRow } from "@/shared/components/ProgressRow";
import { profileSections } from "@/features/profile/constants/profile";
import { saveProfile } from "@/features/profile/services/profileService";
import { useProfile } from "@/features/profile/hooks/useProfile";

export function ProfilePage() {
  const { profile, setProfile } = useProfile();

  return (
    <section className="p-6 lg:p-8">
      <SectionHeading title="Profile" subtitle="Founder and business details that power Femtrex personalization." />
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="rounded-[24px] border border-femtrex-line bg-femtrex-panel p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Field icon={User} label="Founder name" value={profile.name} onChange={(name) => setProfile({ ...profile, name })} />
            <Field icon={Mail} label="Email" value={profile.email} onChange={(email) => setProfile({ ...profile, email })} />
            <Field icon={Building2} label="Company" value={profile.company} onChange={(company) => setProfile({ ...profile, company })} />
            <Field icon={MapPin} label="Industry" value={profile.industry} onChange={(industry) => setProfile({ ...profile, industry })} />
          </div>
          <Button variant="gradient" className="mt-6" onClick={() => saveProfile(profile)}><Save className="size-4" /> Save profile</Button>
        </div>
        <aside className="rounded-[24px] border border-femtrex-line bg-femtrex-panel p-6">
          <h3 className="text-xl font-semibold text-white">Profile completeness</h3>
          <div className="mt-5 space-y-5">
            {profileSections.map((section, index) => (
              <ProgressRow key={section} label={section} value={[95, 84, 67, 72][index]} />
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function Field({ icon: Icon, label, value, onChange }: { icon: LucideIcon; label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-3">
      <span className="flex items-center gap-2 text-sm font-medium text-white"><Icon className="size-4 text-femtrex-violet" /> {label}</span>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
