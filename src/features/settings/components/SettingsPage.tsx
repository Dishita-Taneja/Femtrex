"use client";

import { Save, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SectionHeading } from "@/shared/components/SectionHeading";
import { settingRows } from "@/features/settings/constants/settings";
import { saveSettings } from "@/features/settings/services/settingsService";
import { useSettings } from "@/features/settings/hooks/useSettings";

export function SettingsPage() {
  const { settings, update } = useSettings();

  return (
    <section className="p-6 lg:p-8">
      <SectionHeading title="Settings" subtitle="Control notifications, AI memory, security, and workspace preferences." />
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="rounded-[24px] border border-femtrex-line bg-femtrex-panel p-6">
          <div className="space-y-4">
            {settingRows.map((row) => (
              <div key={row.key} className="flex items-center justify-between gap-6 rounded-2xl bg-white/[0.03] p-5">
                <div>
                  <p className="font-semibold text-white">{row.title}</p>
                  <p className="mt-1 text-sm text-femtrex-soft">{row.body}</p>
                </div>
                <Switch checked={settings[row.key]} onCheckedChange={(value) => update(row.key, value)} />
              </div>
            ))}
          </div>
          <Button variant="gradient" className="mt-6" onClick={() => saveSettings(settings)}><Save className="size-4" /> Save settings</Button>
        </div>
        <aside className="rounded-[24px] border border-femtrex-line bg-femtrex-panel p-6">
          <ShieldCheck className="size-10 text-femtrex-mint" />
          <h3 className="mt-5 text-xl font-semibold text-white">Security ready</h3>
          <p className="mt-3 text-sm leading-6 text-femtrex-soft">
            Firebase Authentication is wired for Google, email/password, reset flows, and role-ready Firestore data paths.
          </p>
        </aside>
      </div>
    </section>
  );
}
