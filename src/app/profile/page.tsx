import { AppShell } from "@/shared/layouts/AppShell";
import { ProfilePage } from "@/features/profile/components/ProfilePage";

export default function ProfileRoute() {
  return (
    <AppShell>
      <ProfilePage />
    </AppShell>
  );
}
