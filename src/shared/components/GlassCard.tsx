"use client";

import { motion } from "framer-motion";
import { cn } from "@/shared/utils/cn";

export function GlassCard({
  className,
  children,
  hover = true
}: {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ duration: 0.2 }}
      className={cn("glass rounded-[24px]", className)}
    >
      {children}
    </motion.div>
  );
}
