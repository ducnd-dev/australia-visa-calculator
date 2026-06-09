import type { VisaSubclass } from "./types";

export type VisaCategoryId =
  | "gsm"
  | "student"
  | "entrepreneur"
  | "employer"
  | "temporary-skilled"
  | "regional"
  | "graduate"
  | "talent"
  | "business"
  | "training"
  | "family"
  | "visitor";

export type VisaPointsSupport =
  | "schedule-6d"
  | "employer-criteria"
  | "sponsor-occupation"
  | "pathway-only"
  | "investment"
  | "student-criteria"
  | "entrepreneur-criteria"
  | "other";

/** Categories shown in calculator reference accordion (non-GSM). */
export const REFERENCE_VISA_CATEGORY_IDS: VisaCategoryId[] = [
  "student",
  "entrepreneur",
  "business",
  "employer",
  "temporary-skilled",
  "regional",
  "graduate",
  "talent",
];

export type VisaCatalogEntry = {
  code: string;
  label: string;
  stream?: string;
  description: string;
  category: VisaCategoryId;
  pointsSupport: VisaPointsSupport;
  /** Schedule 6D nomination bonus when applicable */
  nominationPoints?: number;
  calculatorHref?: string;
  status?: "active" | "legacy" | "limited";
};

export type VisaCategory = {
  id: VisaCategoryId;
  title: string;
  description: string;
};

export const VISA_CATEGORIES: VisaCategory[] = [
  {
    id: "gsm",
    title: "Points-tested skilled (GSM)",
    description:
      "SkillSelect Expression of Interest using Schedule 6D. Scored together in this calculator.",
  },
  {
    id: "student",
    title: "Study in Australia (Du học)",
    description:
      "Student visas to study at schools, VET, universities, or English courses. Genuine Temporary Entrant (GTE), funds, and enrolment (CoE) required.",
  },
  {
    id: "entrepreneur",
    title: "Entrepreneurs & business owners (Doanh nhân)",
    description:
      "Business ownership, innovation, and state-nominated business streams — separate points tests to skilled migration (Schedule 6D).",
  },
  {
    id: "employer",
    title: "Employer-sponsored permanent",
    description: "Nomination by an approved Australian employer — separate tests to GSM points.",
  },
  {
    id: "temporary-skilled",
    title: "Temporary skilled work",
    description: "Sponsored work visas; occupation lists, salary, and sponsor obligations apply.",
  },
  {
    id: "regional",
    title: "Regional skilled pathways",
    description: "Regional nomination, regional work, and permanent stages after provisional visas.",
  },
  {
    id: "graduate",
    title: "Post-study & graduate",
    description: "Temporary graduate streams after eligible Australian qualifications.",
  },
  {
    id: "talent",
    title: "Global Talent & distinguished",
    description: "Outstanding achievement pathways — not Schedule 6D.",
  },
  {
    id: "business",
    title: "Investment & significant investor",
    description: "Investor and significant investor (SIV) streams — complying investments and state nomination.",
  },
  {
    id: "training",
    title: "Training & youth mobility",
    description: "Workplace training and working holiday arrangements.",
  },
  {
    id: "family",
    title: "Family & partner",
    description: "Partner and family visas — relationship and sponsor requirements, not points-tested GSM.",
  },
  {
    id: "visitor",
    title: "Visitor & short stay",
    description: "Tourism, business visitor, and transit — outside skilled points scope.",
  },
];

export const VISA_CATALOG: VisaCatalogEntry[] = [
  // GSM — calculator
  {
    code: "189",
    label: "Skilled Independent",
    description: "Permanent skilled visa without state/territory nomination. Competitive invitation via SkillSelect.",
    category: "gsm",
    pointsSupport: "schedule-6d",
    nominationPoints: 0,
    calculatorHref: "/calculator?visa=189",
    status: "active",
  },
  {
    code: "190",
    label: "Skilled Nominated",
    description: "Permanent skilled visa with nomination from an Australian state or territory (+5 Schedule 6D points).",
    category: "gsm",
    pointsSupport: "schedule-6d",
    nominationPoints: 5,
    calculatorHref: "/calculator?visa=190",
    status: "active",
  },
  {
    code: "491",
    label: "Skilled Work Regional",
    stream: "State / territory / family sponsored",
    description:
      "Provisional regional skilled visa (+15 Schedule 6D points). Pathway to subclass 191 permanent residence.",
    category: "gsm",
    pointsSupport: "schedule-6d",
    nominationPoints: 15,
    calculatorHref: "/calculator?visa=491",
    status: "active",
  },

  // Study (du học)
  {
    code: "500",
    label: "Student",
    stream: "Higher education",
    description:
      "Study a bachelor, master, or doctoral degree at an Australian university or higher education provider (CRICOS).",
    category: "student",
    pointsSupport: "student-criteria",
    status: "active",
  },
  {
    code: "500",
    label: "Student",
    stream: "Vocational education (VET)",
    description:
      "Study a certificate, diploma, or advanced diploma at a registered vocational provider — common pathway to skilled migration.",
    category: "student",
    pointsSupport: "student-criteria",
    status: "active",
  },
  {
    code: "500",
    label: "Student",
    stream: "Schools",
    description: "Primary or secondary school study in Australia for school-age students.",
    category: "student",
    pointsSupport: "student-criteria",
    status: "active",
  },
  {
    code: "500",
    label: "Student",
    stream: "ELICOS (English language)",
    description: "Intensive English courses before further study — often packaged with a main course.",
    category: "student",
    pointsSupport: "student-criteria",
    status: "active",
  },
  {
    code: "500",
    label: "Student",
    stream: "Non-award / research",
    description: "Non-award study or student exchange programs linked to an Australian institution.",
    category: "student",
    pointsSupport: "student-criteria",
    status: "active",
  },
  {
    code: "590",
    label: "Student Guardian",
    description:
      "For parents or guardians to stay in Australia while a child under 18 holds a student visa (subclass 500).",
    category: "student",
    pointsSupport: "student-criteria",
    status: "active",
  },
  {
    code: "570",
    label: "Independent ELICOS",
    description: "Legacy standalone English student visa — replaced by subclass 500 ELICOS sector.",
    category: "student",
    pointsSupport: "pathway-only",
    status: "legacy",
  },

  // Entrepreneurs & business owners (doanh nhân)
  {
    code: "188",
    label: "Business Innovation and Investment (Provisional)",
    stream: "Business Innovation — entrepreneur / SME",
    description:
      "For business owners with turnover, assets, and a qualifying business — state/territory nomination usually required. Points-tested business criteria (not Schedule 6D).",
    category: "entrepreneur",
    pointsSupport: "entrepreneur-criteria",
    status: "active",
  },
  {
    code: "188",
    label: "Business Innovation and Investment (Provisional)",
    stream: "Entrepreneur",
    description:
      "Former Entrepreneur stream for funding innovative ideas in Australia — new applications generally closed; check current BIIP policy.",
    category: "entrepreneur",
    pointsSupport: "entrepreneur-criteria",
    status: "legacy",
  },
  {
    code: "132",
    label: "Business Talent (Permanent)",
    stream: "Significant business history",
    description:
      "Legacy permanent visa for high-calibre business owners — largely replaced by the 188/888 BIIP pathway.",
    category: "entrepreneur",
    pointsSupport: "pathway-only",
    status: "legacy",
  },
  {
    code: "888",
    label: "Business Innovation and Investment (Permanent)",
    stream: "After Business Innovation (188A)",
    description:
      "Permanent residence after meeting residence, business, and investment requirements on the Business Innovation stream.",
    category: "entrepreneur",
    pointsSupport: "pathway-only",
    status: "active",
  },
  {
    code: "888",
    label: "Business Innovation and Investment (Permanent)",
    stream: "After Investor / SIV",
    description: "Permanent stage for complying investors following subclass 188B or 188C.",
    category: "business",
    pointsSupport: "pathway-only",
    status: "active",
  },

  // Employer permanent
  {
    code: "186",
    label: "Employer Nomination Scheme",
    stream: "Direct Entry",
    description: "Permanent employer-sponsored visa for skilled workers nominated by an approved employer.",
    category: "employer",
    pointsSupport: "employer-criteria",
    status: "active",
  },
  {
    code: "186",
    label: "Employer Nomination Scheme",
    stream: "Temporary Residence Transition",
    description: "Permanent visa for 482/457 holders transitioning with the same employer (eligibility rules apply).",
    category: "employer",
    pointsSupport: "pathway-only",
    status: "active",
  },
  {
    code: "186",
    label: "Employer Nomination Scheme",
    stream: "Labour Agreement",
    description: "Permanent visa under a labour agreement between the Australian Government and employers.",
    category: "employer",
    pointsSupport: "employer-criteria",
    status: "active",
  },

  // Temporary skilled
  {
    code: "482",
    label: "Skills in Demand",
    stream: "Core Skills Pathway",
    description: "Temporary work visa for occupations on the Core Skills Occupation List and eligible sponsors.",
    category: "temporary-skilled",
    pointsSupport: "sponsor-occupation",
    status: "active",
  },
  {
    code: "482",
    label: "Skills in Demand",
    stream: "Specialist Skills Pathway",
    description: "Temporary visa for highly specialised roles meeting salary and skills thresholds.",
    category: "temporary-skilled",
    pointsSupport: "sponsor-occupation",
    status: "active",
  },
  {
    code: "482",
    label: "Skills in Demand",
    stream: "Labour Agreement",
    description: "Temporary visa under industry labour agreements when standard pathways do not apply.",
    category: "temporary-skilled",
    pointsSupport: "employer-criteria",
    status: "active",
  },
  {
    code: "457",
    label: "Temporary Work (Skilled)",
    description: "Legacy subclass — largely replaced by subclass 482. Some holders still on transitional arrangements.",
    category: "temporary-skilled",
    pointsSupport: "pathway-only",
    status: "legacy",
  },

  // Regional
  {
    code: "494",
    label: "Skilled Employer Sponsored Regional",
    description: "Provisional regional employer-sponsored visa. Work in designated regional areas for nominated occupations.",
    category: "regional",
    pointsSupport: "employer-criteria",
    status: "active",
  },
  {
    code: "191",
    label: "Permanent Residence (Skilled Regional)",
    description: "Permanent visa for eligible subclass 491 or 494 holders meeting residence and income requirements.",
    category: "regional",
    pointsSupport: "pathway-only",
    status: "active",
  },
  {
    code: "887",
    label: "Skilled Regional",
    description: "Legacy permanent regional pathway for former provisional regional visa holders (new applications generally closed).",
    category: "regional",
    pointsSupport: "pathway-only",
    status: "legacy",
  },
  {
    code: "489",
    label: "Skilled Regional (Provisional)",
    description: "Closed skilled regional provisional visa — replaced by subclass 491.",
    category: "regional",
    pointsSupport: "pathway-only",
    status: "legacy",
  },

  // Graduate
  {
    code: "485",
    label: "Temporary Graduate",
    stream: "Post-Higher Education Work",
    description: "Work in Australia after completing an eligible higher education degree in Australia.",
    category: "graduate",
    pointsSupport: "pathway-only",
    status: "active",
  },
  {
    code: "485",
    label: "Temporary Graduate",
    stream: "Post-Vocational Education Work",
    description: "Work after completing eligible vocational education courses linked to skilled occupations.",
    category: "graduate",
    pointsSupport: "pathway-only",
    status: "active",
  },
  {
    code: "485",
    label: "Temporary Graduate",
    stream: "Second Post-Higher Education Work",
    description: "Additional graduate work stream where a further eligible Australian qualification is completed.",
    category: "graduate",
    pointsSupport: "pathway-only",
    status: "active",
  },
  {
    code: "485",
    label: "Temporary Graduate",
    stream: "Graduate Work",
    description: "For graduates with skills and qualifications linked to occupations on skilled lists.",
    category: "graduate",
    pointsSupport: "pathway-only",
    status: "active",
  },
  {
    code: "476",
    label: "Skilled Recognised Graduate",
    description: "Temporary visa for recent engineering graduates from recognised institutions (limited eligibility).",
    category: "graduate",
    pointsSupport: "other",
    status: "limited",
  },

  // Talent
  {
    code: "858",
    label: "Global Talent",
    description: "Permanent visa for internationally recognised talent in target sectors — separate merit process.",
    category: "talent",
    pointsSupport: "other",
    status: "active",
  },
  {
    code: "124",
    label: "Distinguished Talent",
    description: "Permanent visa for individuals with an internationally recognised record of achievement (legacy reference).",
    category: "talent",
    pointsSupport: "other",
    status: "legacy",
  },

  // Investment (business category)
  {
    code: "188",
    label: "Business Innovation and Investment (Provisional)",
    stream: "Investor",
    description:
      "Provisional visa for complying investment in an Australian state or territory — asset and investment thresholds apply.",
    category: "business",
    pointsSupport: "investment",
    status: "active",
  },
  {
    code: "188",
    label: "Business Innovation and Investment (Provisional)",
    stream: "Significant Investor (SIV)",
    description:
      "High-net-worth pathway with significant complying investments — streamlined residence requirements when eligible.",
    category: "business",
    pointsSupport: "investment",
    status: "active",
  },
  {
    code: "405",
    label: "Investor Retirement",
    description:
      "Legacy retirement visa for self-funded retirees — closed to new applicants; limited transitional arrangements may apply.",
    category: "business",
    pointsSupport: "investment",
    status: "legacy",
  },

  // Training & mobility
  {
    code: "407",
    label: "Training",
    description: "Temporary visa for workplace-based occupational training or professional development.",
    category: "training",
    pointsSupport: "other",
    status: "active",
  },
  {
    code: "417",
    label: "Working Holiday",
    description: "Temporary holiday and work for passport holders of eligible countries (age limits apply).",
    category: "training",
    pointsSupport: "other",
    status: "active",
  },
  {
    code: "462",
    label: "Work and Holiday",
    description: "Similar to subclass 417 for other partner countries — check eligibility by nationality.",
    category: "training",
    pointsSupport: "other",
    status: "active",
  },

  // Family
  {
    code: "820",
    label: "Partner",
    stream: "Temporary (onshore)",
    description: "Temporary partner visa for applicants in Australia married to or in a de facto relationship with an AU citizen/PR.",
    category: "family",
    pointsSupport: "other",
    status: "active",
  },
  {
    code: "801",
    label: "Partner",
    stream: "Permanent (onshore)",
    description: "Permanent partner stage following subclass 820 (or combined 820/801 application).",
    category: "family",
    pointsSupport: "pathway-only",
    status: "active",
  },
  {
    code: "309",
    label: "Partner",
    stream: "Provisional (offshore)",
    description: "Temporary partner visa applied for outside Australia.",
    category: "family",
    pointsSupport: "other",
    status: "active",
  },
  {
    code: "100",
    label: "Partner",
    stream: "Permanent (offshore)",
    description: "Permanent partner visa after subclass 309 requirements are met.",
    category: "family",
    pointsSupport: "pathway-only",
    status: "active",
  },
  {
    code: "300",
    label: "Prospective Marriage",
    description: "Temporary visa to marry an Australian citizen, permanent resident, or eligible NZ citizen.",
    category: "family",
    pointsSupport: "other",
    status: "active",
  },
  {
    code: "143",
    label: "Contributory Parent",
    description: "Permanent parent visa with higher visa charges and queue arrangements.",
    category: "family",
    pointsSupport: "other",
    status: "active",
  },

  // Visitor
  {
    code: "600",
    label: "Visitor",
    description: "Tourism, family visits, or business visitor activities for a temporary stay.",
    category: "visitor",
    pointsSupport: "other",
    status: "active",
  },
  {
    code: "651",
    label: "eVisitor",
    description: "Electronic visitor for passport holders of eligible European countries.",
    category: "visitor",
    pointsSupport: "other",
    status: "active",
  },
];

export const GSM_VISA_CODES = ["189", "190", "491"] as const satisfies readonly VisaSubclass[];

export function catalogEntryId(entry: VisaCatalogEntry): string {
  return `${entry.code}-${entry.stream ?? "default"}`;
}

export function getVisasByCategory(categoryId: VisaCategoryId): VisaCatalogEntry[] {
  return VISA_CATALOG.filter((v) => v.category === categoryId);
}

export function getCategory(id: VisaCategoryId): VisaCategory {
  return VISA_CATEGORIES.find((c) => c.id === id)!;
}

export function getNonGsmVisas(): VisaCatalogEntry[] {
  return VISA_CATALOG.filter((v) => v.pointsSupport !== "schedule-6d");
}

export function getActiveVisaCount(): number {
  return VISA_CATALOG.filter((v) => v.status !== "legacy").length;
}

/** GSM pathways for Schedule 6D calculator (derived from catalog). */
export function getGsmPathwaysFromCatalog() {
  return GSM_VISA_CODES.map((code) => {
    const entry = VISA_CATALOG.find((v) => v.code === code && v.pointsSupport === "schedule-6d")!;
    return {
      code,
      label: entry.label,
      shortLabel:
        code === "189" ? "Independent" : code === "190" ? "State/Territory" : "Regional",
      nominationPoints: entry.nominationPoints ?? 0,
      nominationNote:
        code === "189"
          ? "No state or regional nomination required"
          : code === "190"
            ? "Nomination by an Australian state or territory"
            : "State/territory or eligible family sponsorship in regional Australia",
      citation: code === "189" ? "6D" : code === "190" ? "6D.12" : "6D.13",
    };
  });
}

export function pointsSupportLabel(support: VisaPointsSupport): string {
  switch (support) {
    case "schedule-6d":
      return "Schedule 6D calculator";
    case "student-criteria":
      return "GTE · CoE · funds";
    case "entrepreneur-criteria":
      return "BIIP / business points";
    case "employer-criteria":
      return "Employer nomination criteria";
    case "sponsor-occupation":
      return "Sponsor & occupation lists";
    case "pathway-only":
      return "Pathway / residence rules";
    case "investment":
      return "Investment thresholds";
    default:
      return "Separate criteria";
  }
}
