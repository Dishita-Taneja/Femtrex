import type { Mentor, NotificationItem, ReadinessPillar, Scheme } from "@/shared/types/domain";

export const founderProfile = {
  name: "Priya Sharma",
  email: "priya@texcraft.in",
  company: "TextCraft",
  initials: "PS",
  location: "Maharashtra",
  industry: "Textile Manufacturing"
};

export const schemes: Scheme[] = [
  {
    id: "wep-accelerator",
    name: "WEP Accelerator Program - Cohort 8",
    type: "Accelerator",
    description: "Women Entrepreneurship Platform accelerator offering grant funding, mentorship, market access and investor readiness.",
    amount: "₹5 Lakhs + VC Access",
    deadline: "20 Aug 2026",
    sector: "All Sectors",
    match: 81,
    closingSoon: true,
    womenOnly: true,
    checklist: ["Pitch deck", "Founder profile", "Business registration", "Three month execution roadmap"]
  },
  {
    id: "startup-seed",
    name: "Startup India Seed Fund Scheme",
    type: "Grant",
    description: "Seed funding for early-stage startups to validate proof of concept and prototype development.",
    amount: "₹20 Lakhs",
    deadline: "15 Aug 2026",
    sector: "Technology",
    match: 79,
    closingSoon: true,
    checklist: ["DPIIT recognition", "Prototype demo", "Budget plan", "Incubator application"]
  },
  {
    id: "ficci-flo",
    name: "FICCI FLO Women Startup Grant",
    type: "Grant",
    description: "Annual grant by FICCI Ladies Organisation for women-led startups demonstrating social and economic impact.",
    amount: "₹3 Lakhs",
    deadline: "10 Aug 2026",
    sector: "All Sectors",
    match: 76,
    closingSoon: true,
    womenOnly: true,
    checklist: ["Impact statement", "Company profile", "Founder video", "Use-of-funds note"]
  },
  {
    id: "msme-tech",
    name: "MSME Technology Upgradation Fund",
    type: "Grant",
    description: "Capital subsidy for technology modernization in MSME units. Covers machinery, process upgrades and digital systems.",
    amount: "₹25 Lakhs",
    deadline: "30 Sep 2026",
    sector: "Manufacturing",
    match: 92,
    checklist: ["Udyam certificate", "Vendor quotation", "Bank statement", "Technology upgrade proposal"]
  },
  {
    id: "mudra-tarun",
    name: "Pradhan Mantri Mudra Yojana - Tarun",
    type: "Loan",
    description: "Collateral-free loans up to ₹10 Lakhs for small business and micro enterprises under the Tarun category.",
    amount: "₹10 Lakhs",
    deadline: "Rolling",
    sector: "All Sectors",
    match: 91,
    checklist: ["KYC documents", "Business plan", "Projected cash flow", "Bank application"]
  },
  {
    id: "mahila-udyam",
    name: "Mahila Udyam Nidhi Scheme",
    type: "Loan",
    description: "Soft loans for women-led small enterprises to establish or expand business operations.",
    amount: "₹10 Lakhs",
    deadline: "31 Dec 2026",
    sector: "Women Entrepreneurs",
    match: 88,
    womenOnly: true,
    checklist: ["Entrepreneur profile", "Project report", "Collateral declaration", "Repayment estimate"]
  }
];

export const readinessPillars: ReadinessPillar[] = [
  {
    id: "startup",
    label: "Startup Readiness",
    subtitle: "Business model, team, product-market fit",
    score: 72,
    status: "Developing",
    color: "violet",
    metrics: [
      { label: "Business Model", value: 80, note: "Strong" },
      { label: "Team Strength", value: 65, note: "Good" },
      { label: "Product-Market Fit", value: 70, note: "Good" },
      { label: "Execution Capability", value: 75, note: "Good" }
    ]
  },
  {
    id: "funding",
    label: "Funding Readiness",
    subtitle: "Capital plan, documents, lender fit",
    score: 58,
    status: "Needs Work",
    color: "pink",
    metrics: [
      { label: "Pitch Materials", value: 54, note: "Needs Work" },
      { label: "Use of Funds", value: 63, note: "Developing" },
      { label: "Revenue Evidence", value: 57, note: "Needs Work" },
      { label: "Application Quality", value: 61, note: "Developing" }
    ]
  },
  {
    id: "compliance",
    label: "Compliance",
    subtitle: "Registration, tax, licenses",
    score: 85,
    status: "Strong",
    color: "mint",
    metrics: [
      { label: "Udyam Registration", value: 95, note: "Strong" },
      { label: "GST Hygiene", value: 78, note: "Good" },
      { label: "Licenses", value: 84, note: "Strong" },
      { label: "Financial Records", value: 83, note: "Strong" }
    ]
  },
  {
    id: "financial",
    label: "Financial Health",
    subtitle: "Cash flow, margins, repayment strength",
    score: 63,
    status: "Developing",
    color: "amber",
    metrics: [
      { label: "Cash Flow", value: 68, note: "Good" },
      { label: "Margin Quality", value: 62, note: "Developing" },
      { label: "Receivables", value: 57, note: "Needs Work" },
      { label: "Repayment Capacity", value: 65, note: "Good" }
    ]
  },
  {
    id: "investor",
    label: "Investor Readiness",
    subtitle: "Deck, traction, narrative",
    score: 54,
    status: "Needs Work",
    color: "blue",
    metrics: [
      { label: "Pitch Deck", value: 51, note: "Needs Work" },
      { label: "Traction Proof", value: 57, note: "Needs Work" },
      { label: "Market Story", value: 60, note: "Developing" },
      { label: "Data Room", value: 48, note: "Needs Work" }
    ]
  }
];

export const mentors: Mentor[] = [
  {
    id: "kavitha",
    name: "Kavitha Reddy",
    role: "D2C Textile Mentor",
    expertise: ["Manufacturing", "Export", "Pricing"],
    rating: 4.9,
    sessions: 218,
    price: "Free through WEP",
    nextSlot: "Today, 6:30 PM",
    review: "Helped me turn a grant application into a clear two-page funding story."
  },
  {
    id: "ananya",
    name: "Ananya Singh",
    role: "Seed Fund Advisor",
    expertise: ["Grants", "Investor Decks", "Government Schemes"],
    rating: 4.8,
    sessions: 164,
    price: "₹499 / 15 min",
    nextSlot: "Tomorrow, 10:00 AM",
    review: "Very tactical. I left with exact changes for my pitch deck."
  },
  {
    id: "meera",
    name: "Meera Kapoor",
    role: "MSME Finance Operator",
    expertise: ["Loans", "Cash Flow", "Compliance"],
    rating: 4.7,
    sessions: 132,
    price: "₹399 / 15 min",
    nextSlot: "Fri, 2:15 PM",
    review: "Mapped the right lender and fixed our checklist in one session."
  }
];

export const notifications: NotificationItem[] = [
  {
    id: "closing",
    title: "3 schemes closing soon",
    body: "WEP, Startup India Seed Fund and FICCI FLO all close in the next 30 days.",
    time: "12m ago",
    unread: true
  },
  {
    id: "mentor",
    title: "Mentor match found",
    body: "Kavitha Reddy has a high-fit slot for manufacturing expansion.",
    time: "1h ago",
    unread: true
  },
  {
    id: "passport",
    title: "Passport score updated",
    body: "Compliance improved to 85 after your Udyam details were verified.",
    time: "Today"
  }
];

export const conversations = [
  {
    id: "msme",
    title: "MSME Grant Eligibility",
    preview: "You qualify for 3 schemes under M...",
    time: "1d ago"
  },
  {
    id: "funding-readiness",
    title: "Improving Funding Readiness",
    preview: "Your funding readiness is at 67%...",
    time: "3d ago"
  },
  {
    id: "mentor-agri",
    title: "Mentor for Agri-Tech",
    preview: "I found 2 mentors with agri-tech ex...",
    time: "3d ago"
  },
  {
    id: "compliance",
    title: "Startup Compliance Check",
    preview: "You're missing 2 critical complianc...",
    time: "4d ago"
  },
  {
    id: "deck",
    title: "Pitch Deck Review",
    preview: "Your investor readiness score is 54...",
    time: "5d ago"
  }
];
