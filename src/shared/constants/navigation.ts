import {
  BarChart3,
  BookOpen,
  Bot,
  MessageSquare,
  Settings,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";
import type { NavItem } from "@/shared/types/domain";

export const navigationItems: NavItem[] = [
  { label: "AI Copilot", href: "/ai-founder-copilot", icon: MessageSquare, section: "AI Tools" },
  { label: "Funding Intelligen...", href: "/funding-intelligence", icon: Zap, count: 12, section: "AI Tools" },
  { label: "Business Passport", href: "/business-passport", icon: BarChart3, section: "Business" },
  { label: "Mentor Network", href: "/mentor-network", icon: Users, count: 3, section: "Business" },
  { label: "Resource Library", href: "/resources", icon: BookOpen, section: "Business" },
  { label: "Growth Analytics", href: "/dashboard", icon: TrendingUp, section: "Business" },
  { label: "Settings", href: "/settings", icon: Settings, section: "Business" },
  { label: "Micro Mentorship", href: "/micro-mentorship", icon: Bot, section: "AI Tools" }
];
