"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/shared/components/SearchBar";
import { Notification } from "@/shared/components/Notification";
import { founderProfile } from "@/shared/constants/demo-data";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-[78px] items-center justify-between border-b border-femtrex-line bg-femtrex-navy/92 px-4 backdrop-blur-xl lg:pl-8 lg:pr-6">
      <div className="flex flex-1 items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="size-5" />
        </Button>
        <SearchBar className="hidden w-full max-w-[480px] md:block" />
      </div>
      <div className="flex items-center gap-4">
        <Notification />
        <div className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-femtrex-violet to-femtrex-pink text-sm font-bold text-white">
          {founderProfile.initials}
        </div>
      </div>
    </header>
  );
}
