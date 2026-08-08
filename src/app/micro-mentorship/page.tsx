import { AppShell } from "@/shared/layouts/AppShell";
import { MicroMentorshipPage } from "@/features/micro-mentorship/components/MicroMentorshipPage";

export default function MicroMentorshipRoute() {
  return (
    <AppShell>
      <MicroMentorshipPage />
    </AppShell>
  );
}
