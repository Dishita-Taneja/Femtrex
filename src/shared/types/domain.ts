import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  count?: number;
  section: "AI Tools" | "Business";
};

export type Scheme = {
  id: string;
  name: string;
  type: "Grant" | "Loan" | "Subsidy" | "Incubator" | "Accelerator";
  description: string;
  amount: string;
  deadline: string;
  sector: string;
  match: number;
  closingSoon?: boolean;
  womenOnly?: boolean;
  checklist: string[];
};

export type Mentor = {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  rating: number;
  sessions: number;
  price: string;
  nextSlot: string;
  review: string;
};

export type ReadinessPillar = {
  id: string;
  label: string;
  subtitle: string;
  score: number;
  status: "Strong" | "Good" | "Developing" | "Needs Work";
  color: "violet" | "pink" | "mint" | "amber" | "blue";
  metrics: { label: string; value: number; note: string }[];
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
};
