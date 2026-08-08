import { AppShell } from "@/shared/layouts/AppShell";
import { DashboardPage } from "@/features/dashboard/components/DashboardPage";

export default function DashboardRoute() {
  return (
    <AppShell>
      <DashboardPage />
    </AppShell>
  );
}
