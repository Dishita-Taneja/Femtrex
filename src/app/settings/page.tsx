import { AppShell } from "@/shared/layouts/AppShell";
import { SettingsPage } from "@/features/settings/components/SettingsPage";

export default function SettingsRoute() {
  return (
    <AppShell>
      <SettingsPage />
    </AppShell>
  );
}
