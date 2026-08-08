import { BarChart3, BookOpen, MessageSquare, ShieldCheck, TrendingUp, Users, Zap } from "lucide-react";

export const dashboardMetrics = [
  { icon: TrendingUp, label: "Business Score", value: "66", delta: "+8 this month" },
  { icon: Zap, label: "Funding Matches", value: "12", delta: "3 urgent" },
  { icon: Users, label: "Mentor Matches", value: "3", delta: "1 today" },
  { icon: ShieldCheck, label: "Verified Items", value: "7/10", delta: "+2 complete" }
];

export const dashboardCards = [
  { icon: Zap, title: "Funding Intelligence", description: "12 schemes matched to TextCraft with 6 high-fit recommendations." },
  { icon: BarChart3, title: "Business Passport", description: "Compliance is strong. Funding readiness and investor narrative need attention." },
  { icon: Users, title: "Mentor Network", description: "3 mentors are available for textile manufacturing, grant strategy, and MSME finance." },
  { icon: MessageSquare, title: "AI Founder Copilot", description: "Ask for eligibility checks, pitch rewrites, grant checklists, and weekly action plans." },
  { icon: BookOpen, title: "Resource Library", description: "Templates, learning paths, and community playbooks curated for women founders." }
];
