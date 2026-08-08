"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export function DashboardCard({
  icon: Icon,
  title,
  description,
  action,
  className
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={cn("glass rounded-[24px] p-6", className)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="grid size-12 place-items-center rounded-2xl bg-femtrex-violet/15 text-femtrex-violet">
          <Icon className="size-5" />
        </div>
        {action}
      </div>
      <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-femtrex-soft">{description}</p>
    </motion.div>
  );
}
