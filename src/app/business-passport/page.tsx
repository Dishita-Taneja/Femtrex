import { AppShell } from "@/shared/layouts/AppShell";
import { BusinessPassportPage } from "@/features/business-passport/components/BusinessPassportPage";

export default function BusinessPassportRoute() {
  return (
    <AppShell>
      <BusinessPassportPage />
    </AppShell>
  );
}
