export interface ResourceItem {
  id: string;
  title: string;
  category: "Templates" | "Learning Hub" | "Community";
  description: string;
  downloadFileName?: string;
  externalUrl: string;
  content?: string;
}

export const resources: ResourceItem[] = [
  {
    id: "msme-grant-template",
    title: "MSME Grant Application Template",
    category: "Templates",
    description: "A polished structure for eligibility, impact, budget, and timeline.",
    downloadFileName: "MSME_Grant_Application_Template.md",
    externalUrl: "https://dashboard.msme.gov.in/",
    content: `# MSME Grant Application & Scheme Proposal Template
**Platform**: Femtrex AI Co-founder Services for Women Entrepreneurs in India
**Target Schemes**: MSME Technological Upgradation, Stand-Up India, WEP Accelerator Grant, PMEGP

---

## 1. Executive Summary & Enterprise Details
- **Enterprise Name**: [Insert Company / Enterprise Name]
- **Founder Name**: [Insert Founder Name]
- **Udyam Registration Number**: [e.g., UDYAM-MH-00-1234567]
- **GSTIN**: [e.g., 27AAAAA0000A1Z5]
- **Sector / Industry**: [e.g., Textile Manufacturing / Agri-Tech / D2C Consumer Goods]
- **Operating Location**: [City, State]
- **Ownership**: Minimum 51% Women-Owned Enterprise (Verified)

---

## 2. Business Profile & Scalability Impact
- **Core Product / Service**: Briefly describe your value proposition, target market, and operational model.
- **Problem Statement**: What market inefficiency or demand does your business solve?
- **Competitive Advantage**: Why is your business uniquely positioned to succeed?

---

## 3. Project Scope & Fund Utilization Plan
| Expense Category | Purpose / Description | Estimated Amount (INR) |
| :--- | :--- | :--- |
| Capital Expenditure | Machinery, Hardware & Automation Equipment | ₹ [Amount] |
| Working Capital | Raw materials, Inventory & Operational Reserve | ₹ [Amount] |
| Compliance & IP | Quality certifications, Trademark, ISO, Lab testing | ₹ [Amount] |
| Tech & Marketing | Digital storefront, ERP software, Distribution setup | ₹ [Amount] |
| **Total Requested Fund** | | **₹ [Total Amount]** |

---

## 4. Implementation Timeline (12-Month Milestones)
- **Month 1 - 3**: Procurement of machinery & factory site readiness.
- **Month 4 - 6**: Trial runs, quality certification, initial hiring of local workforce.
- **Month 7 - 9**: Commercial launch & B2B distribution channel expansion.
- **Month 10 - 12**: Revenue generation scaling & grant milestone audit submission.

---

## 5. Required Attachments Checklist
- [ ] Udyam Registration Certificate
- [ ] GST Registration & Last 6-Month GST Returns
- [ ] Bank Account Statement (Last 12 Months)
- [ ] Vendor Quotations for Machinery / Assets
- [ ] PAN Card & Aadhaar of Founder(s)
- [ ] CA-Certified Audited Financial Statements / IT Returns

---
*Generated via Femtrex AI Founder Platform (https://femtrex.app)*
`
  },
  {
    id: "investor-readiness-sprint",
    title: "Investor Readiness Sprint",
    category: "Learning Hub",
    description: "Seven lessons to turn business metrics into a compelling capital story.",
    downloadFileName: "Investor_Readiness_Sprint_Guide.md",
    externalUrl: "https://www.startupindia.gov.in/",
    content: `# Investor Readiness Sprint Guide (7-Step Masterclass & Framework)
**Platform**: Femtrex AI Co-founder Services

---

## Step 1: The 10-Slide Pitch Deck Framework
1. **Title & Mission**: One line explaining what you build and why.
2. **Problem**: Clear description of the customer pain point ($ market size).
3. **Solution**: Product demo, key features, and USP.
4. **Market Opportunity**: TAM, SAM, and SOM calculations.
5. **Business Model**: Pricing, unit economics, and monetization strategy.
6. **Traction & Milestones**: Revenue growth, CAC, LTV, active customers.
7. **Go-To-Market (GTM)**: Acquisition channels, sales cycles, and partnerships.
8. **Competitive Landscape**: Positioning matrix showing unfair advantage.
9. **Financial Projections**: 3-year P&L, burn rate, and capital efficiency.
10. **The Ask & Use of Funds**: Exact funding round size and 18-month roadmap.

---

## Step 2: Key Financial & Unit Economics Metrics
- **Customer Acquisition Cost (CAC)**: Total Marketing & Sales spend / New Customers.
- **Lifetime Value (LTV)**: (Average Order Value x Purchase Frequency x Gross Margin %) / Churn.
- **LTV : CAC Ratio**: Target > 3:1 for venture scale.
- **Gross Margin Target**: > 60% for D2C / > 80% for SaaS.

---

## Step 3: Data Room Preparation Checklist
- [ ] Executive Summary / One-Pager
- [ ] Cap Table (Current shareholding breakdown)
- [ ] Incorporated Entity Documents (CoA, MoA, Incorporation Certificate)
- [ ] Historical Financial Statements & Tax Filings
- [ ] Customer Testimonials & Key Commercial Contracts
- [ ] 3-Year Financial Model (.xlsx format)

---
*Generated via Femtrex AI Founder Platform*
`
  },
  {
    id: "women-founder-circle",
    title: "Women Founder Community Circle",
    category: "Community",
    description: "Weekly peer rooms for operators raising non-dilutive and seed capital.",
    externalUrl: "https://wep.gov.in/"
  },
  {
    id: "compliance-document-checklist",
    title: "Compliance Document Checklist",
    category: "Templates",
    description: "Udyam, GST, bank, financial and registration documents in one workspace.",
    downloadFileName: "Compliance_Document_Checklist.md",
    externalUrl: "https://udyamregistration.gov.in/",
    content: `# Comprehensive Startup Compliance Document Checklist
**Platform**: Femtrex Business Credibility & Compliance Module

---

## Category A: Statutory & Registration Documents
- [ ] **Udyam Registration Certificate**: Essential for MSME subsidies and priority sector lending.
- [ ] **GST Registration Certificate**: Required for B2B transactions & inter-state sales.
- [ ] **PAN & TAN of Business Entity**: Primary tax identification numbers.
- [ ] **Certificate of Incorporation / Partnership Deed**: Legal entity proof.
- [ ] **Bank Account Cancelled Cheque**: Current business account proof.

---

## Category B: Financial & Bank Audit Records
- [ ] **Bank Statements (Last 12 Months)**: Showing active cash flows and vendor payments.
- [ ] **Audited Financial Statements (Last 2 Years)**: P&L, Balance Sheet, Notes to Accounts.
- [ ] **Income Tax Returns (ITR-V)**: Filed returns for the latest assessment years.
- [ ] **CA-Certified Net Worth Certificate**: Required for government credit schemes.

---

## Category C: Sectoral Licenses (Industry Specific)
- [ ] **FSSAI License** (Food & Agriculture businesses)
- [ ] **Pollution Control Board Clearance / Consent to Operate** (Manufacturing units)
- [ ] **Import Export Code (IEC)** (For export-focused enterprises)
- [ ] **ISO Certification / Quality Mark Documents**

---
*Generated via Femtrex AI Founder Platform*
`
  }
];

