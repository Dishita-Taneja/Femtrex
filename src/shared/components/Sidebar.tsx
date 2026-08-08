"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Settings } from "lucide-react";
import { navigationItems } from "@/shared/constants/navigation";
import { founderProfile } from "@/shared/constants/demo-data";
import { BrandMark } from "@/shared/components/BrandMark";
import { ProfileCard } from "@/shared/components/ProfileCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils/cn";

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const visible = navigationItems.filter((item) => item.label !== "Settings" && item.label !== "Micro Mentorship");
  const groups = ["AI Tools", "Business"] as const;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-[296px] flex-col border-r border-femtrex-line bg-femtrex-panel transition-transform lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-[78px] items-center justify-between border-b border-femtrex-line px-5">
        <BrandMark />
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
          <ChevronLeft className="size-5" />
        </Button>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-24 hidden rounded-full border border-femtrex-line bg-femtrex-panel lg:flex"
        aria-label="Collapse sidebar"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <nav className="flex-1 space-y-8 overflow-y-auto px-5 py-6">
        {groups.map((group) => (
          <div key={group}>
            <p className="mb-4 text-sm uppercase tracking-[0.28em] text-femtrex-soft">{group}</p>
            <div className="space-y-2">
              {visible
                .filter((item) => item.section === group)
                .map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href as any}
                      className={cn(
                        "flex items-center gap-4 rounded-2xl px-1 py-3 text-lg text-femtrex-soft transition hover:text-white",
                        active && "text-femtrex-violet"
                      )}
                    >
                      <Icon className="size-6 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.count && <span className="text-sm text-femtrex-violet">{item.count}</span>}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-femtrex-line p-5">
        <Link href={"/settings" as any} className="mb-6 flex items-center gap-4 rounded-2xl text-lg text-femtrex-soft hover:text-white">
          <Settings className="size-6" />
          Settings
        </Link>
        <ProfileCard />
        <p className="sr-only">Signed in as {founderProfile.email}</p>
      </div>
    </aside>
  );
}
