"use client";

import { Bell } from "lucide-react";
import { notifications } from "@/shared/constants/demo-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function Notification() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2.5 rounded-full bg-femtrex-pink" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {notifications.map((item) => (
            <div key={item.id} className="rounded-2xl border border-femtrex-line bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-4">
                <p className="font-semibold text-white">{item.title}</p>
                <span className="text-xs text-femtrex-soft">{item.time}</span>
              </div>
              <p className="mt-1 text-sm text-femtrex-soft">{item.body}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
