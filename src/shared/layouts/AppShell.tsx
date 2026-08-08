"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "@/shared/components/Sidebar";
import { Topbar } from "@/shared/components/Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-femtrex-navy text-white">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-[296px]">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <AnimatePresence mode="wait">
          <motion.main
            key="app-content"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="min-h-[calc(100vh-78px)] overflow-x-hidden"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
