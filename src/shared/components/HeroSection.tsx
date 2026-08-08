"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/shared/components/BrandMark";
import { StatCard } from "@/shared/components/StatCard";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-femtrex-navy px-6 py-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <BrandMark />
        <Button asChild variant="outline">
          <Link href="/sign-up-login-screen">Sign in</Link>
        </Button>
      </div>
      <div className="mx-auto grid min-h-[calc(100vh-120px)] max-w-7xl items-center gap-12 py-12 lg:grid-cols-[1.05fr_.95fr]">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-femtrex-line bg-white/5 px-4 py-2 text-sm text-femtrex-soft">
            <Sparkles className="size-4 text-femtrex-pink" />
            Empowering Women Entrepreneurs with an AI Co-Founder
          </div>
          <h1 className="text-5xl font-semibold leading-tight text-white md:text-7xl">
            Femtrex, your <span className="gradient-text">AI Cofounder</span> for every milestone
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-femtrex-soft">
            Discover funding, track business readiness, connect with mentors, and execute with an AI built for women entrepreneurs.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="gradient" size="lg">
              <Link href="/dashboard">Open dashboard <ArrowRight className="size-5" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/ai-founder-copilot">Ask AI Copilot</Link>
            </Button>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="glass premium-border rounded-[24px] p-5">
          <div className="overflow-hidden rounded-[20px] border border-femtrex-line">
            <Image
              src="/assets/images/femtrex-copilot.png"
              alt="Femtrex AI Copilot interface with funding recommendations"
              width={1883}
              height={801}
              className="h-auto w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 mt-4" />
            <StatCard value="14,200+" label="Women Founders" />
            <StatCard value="₹320Cr+" label="Funding Unlocked" />
            <StatCard value="890+" label="Active Mentors" />
            <StatCard value="96%" label="Satisfaction Rate" />
          </div>
          <div className="mt-5 rounded-[24px] border border-femtrex-line bg-femtrex-panel p-5">
            <p className="text-sm uppercase tracking-[0.28em] text-femtrex-soft">Live AI insight</p>
            <p className="mt-4 text-2xl font-semibold text-white">3 active MSME schemes match TextCraft today.</p>
            <div className="mt-5 h-2 rounded-full bg-white/7">
              <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-femtrex-violet to-femtrex-pink" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
