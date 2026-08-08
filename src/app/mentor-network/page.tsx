import { AppShell } from "@/shared/layouts/AppShell";
import { MentorNetworkPage } from "@/features/mentor-network/components/MentorNetworkPage";

export default function MentorNetworkRoute() {
  return (
    <AppShell>
      <MentorNetworkPage />
    </AppShell>
  );
}
