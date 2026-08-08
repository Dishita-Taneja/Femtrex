import { AppShell } from "@/shared/layouts/AppShell";
import { CopilotPage } from "@/features/ai-founder-copilot/components/CopilotPage";

export default function AIFounderCopilotRoute() {
  return (
    <AppShell>
      <CopilotPage />
    </AppShell>
  );
}
