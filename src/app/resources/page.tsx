import { AppShell } from "@/shared/layouts/AppShell";
import { ResourcesPage } from "@/features/resources/components/ResourcesPage";

export default function ResourcesRoute() {
  return (
    <AppShell>
      <ResourcesPage />
    </AppShell>
  );
}
