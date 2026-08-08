import { AppShell } from "@/shared/layouts/AppShell";
import { FundingPage } from "@/features/funding-intelligence/components/FundingPage";

export default function FundingIntelligenceRoute() {
  return (
    <AppShell>
      <FundingPage />
    </AppShell>
  );
}
