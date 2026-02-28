export interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  description: string;
  pattern?: string; // CSS selector or keyword to look for on the page
}

export interface SupportResource {
  title: string;
  description: string;
  link: string;
  category: "Legal" | "Food" | "Housing" | "Health";
}

export const getChecklistForUrl = (url: string): ChecklistItem[] => {
  if (url.includes("healthcare.gov")) {
    return [
      { id: "1", task: "Social Security Numbers", completed: false, description: "For everyone in your household.", pattern: "ssn,social" },
      { id: "2", task: "Employer & Income Info", completed: false, description: "W-2s, pay stubs, or tax returns.", pattern: "income,employer,w2" },
      { id: "3", task: "Policy Numbers", completed: false, description: "If anyone has current health insurance.", pattern: "policy,insurance" },
      { id: "4", task: "Immigration Documents", completed: false, description: "If applicable.", pattern: "immigration,visa,document" },
    ];
  }
  return [
    { id: "1", task: "Proof of Identity", completed: false, description: "Driver's license or ID card.", pattern: "identity,license,id-card" },
    { id: "2", task: "Proof of Residency", completed: false, description: "Utility bill or lease agreement.", pattern: "residency,utility,lease" },
    { id: "3", task: "Income Verification", completed: false, description: "Last 4 weeks of pay stubs.", pattern: "income,paystub,salary" },
    { id: "4", task: "Household Expenses", completed: false, description: "Rent/mortgage and utility amounts.", pattern: "expense,rent,mortgage" },
  ];
};

export const getWelcomeMessage = () => ({
  title: "Boost Your Success Rate",
  message: "GovGuide AI is your helping hand. We help you understand complex terms, answer questions via AI chat, and track your next steps even after you submit.",
  features: [
    "Highlight words for instant explanations",
    "Prepare for interviews with our AI coach",
    "Get alerts for deadlines & next steps"
  ]
});

export const getProactiveTip = (url: string): string | null => {
  if (url.includes("snap") || url.includes("benefits.gov")) {
    return "⚠️ Important: Most SNAP applications require a follow-up phone interview. Don't forget to check your mail for the date!";
  }
  if (url.includes("healthcare.gov")) {
    return "💡 Tip: You may need to provide proof of income within 90 days of signing up to keep your coverage.";
  }
  return null;
};

export const getNextSteps = () => [
  { label: "Application Received", status: "completed", date: "Today" },
  { label: "Eligibility Review", status: "pending", date: "Est. 3-5 days" },
  { label: "Interview Scheduled", status: "upcoming", date: "TBD" },
  { label: "Final Determination", status: "upcoming", date: "TBD" },
];

export const getSupportResources = (): SupportResource[] => [
  {
    title: "Legal Aid Society",
    description: "Free legal assistance for benefit appeals and housing issues.",
    link: "https://legalaid.org",
    category: "Legal"
  },
  {
    title: "Feeding America",
    description: "Find your local food bank while waiting for SNAP approval.",
    link: "https://feedingamerica.org",
    category: "Food"
  },
  {
    title: "Community Health Centers",
    description: "Access low-cost medical care in your neighborhood.",
    link: "https://findahealthcenter.hrsa.gov",
    category: "Health"
  }
];
