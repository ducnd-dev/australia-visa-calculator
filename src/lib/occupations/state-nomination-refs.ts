/** Curated state nomination reference links — not live occupation lists. */

export type StateNominationRef = {
  state: string;
  code: string;
  subclass190Url: string;
  subclass491Url: string;
  notes: string;
};

export const STATE_NOMINATION_REFS: StateNominationRef[] = [
  {
    state: "New South Wales",
    code: "NSW",
    subclass190Url: "https://www.nsw.gov.au/visas-and-migration/skilled-visas",
    subclass491Url: "https://www.nsw.gov.au/visas-and-migration/skilled-visas",
    notes: "Check current occupation lists and minimum points before lodging.",
  },
  {
    state: "Victoria",
    code: "VIC",
    subclass190Url: "https://liveinmelbourne.vic.gov.au/migrate/skilled-migration-visas",
    subclass491Url: "https://liveinmelbourne.vic.gov.au/migrate/skilled-migration-visas",
    notes: "ROI required; occupation caps may apply.",
  },
  {
    state: "Queensland",
    code: "QLD",
    subclass190Url: "https://migration.qld.gov.au/",
    subclass491Url: "https://migration.qld.gov.au/",
    notes: "Verify skilled occupation list and work experience requirements.",
  },
  {
    state: "Western Australia",
    code: "WA",
    subclass190Url: "https://migration.wa.gov.au/",
    subclass491Url: "https://migration.wa.gov.au/",
    notes: "Graduate occupation list may differ from general list.",
  },
  {
    state: "South Australia",
    code: "SA",
    subclass190Url: "https://www.migration.sa.gov.au/",
    subclass491Url: "https://www.migration.sa.gov.au/",
    notes: "Talent and Innovators streams have separate criteria.",
  },
  {
    state: "Tasmania",
    code: "TAS",
    subclass190Url: "https://www.migration.tas.gov.au/",
    subclass491Url: "https://www.migration.tas.gov.au/",
    notes: "Living in Tasmania requirements for some pathways.",
  },
  {
    state: "Australian Capital Territory",
    code: "ACT",
    subclass190Url: "https://www.canberrayourfuture.com.au/",
    subclass491Url: "https://www.canberrayourfuture.com.au/",
    notes: "Matrix points system — confirm occupation eligibility.",
  },
  {
    state: "Northern Territory",
    code: "NT",
    subclass190Url: "https://theterritory.com.au/migrate",
    subclass491Url: "https://theterritory.com.au/migrate",
    notes: "Smaller occupation lists; confirm with NT Government.",
  },
];

/** Curated occupation-specific hints — not live state lists. */
export const OCCUPATION_STATE_NOTES: Record<string, string> = {
  "221111": "Accountants are on most state lists but often require skills assessment (CPA/CA/IPA) and may face higher points thresholds in NSW and VIC.",
  "221112": "Management accountants — confirm state list availability; SA and WA often have separate accounting streams.",
  "221113": "Taxation specialists — check whether your assessing authority outcome matches the nominated ANZSCO.",
  "232111": "Architects typically need registration or eligibility in Australia; VIC and NSW may require local project evidence.",
  "233111": "Chemical engineers — strong demand in WA mining; verify occupation ceiling on Skills Priority List.",
  "233211": "Civil engineers — widely nominated; QLD and WA often seek infrastructure experience.",
  "233311": "Electrical engineers — confirm whether your role maps to 233311 vs 261313 (ICT crossover cases).",
  "233411": "Electronics engineers — check state-specific work experience and English requirements.",
  "233512": "Mechanical engineers — common on 190/491 lists; TAS and SA may require regional commitment.",
  "233611": "Mining engineers — WA nomination pathways often prioritise resources sector experience.",
  "234111": "Agricultural consultants — smaller occupation groups; NT and regional QLD may be more accessible.",
  "234211": "Chemists — verify laboratory vs quality-control role mapping before ROI.",
  "241111": "Early childhood teachers — high demand in VIC and QLD; skills assessment via AITSL required.",
  "241411": "Secondary school teachers — subject specialisation must match assessing authority requirements.",
  "251211": "Medical diagnostic radiographers — health occupations often need AHPRA or relevant registration pathway.",
  "251312": "Occupational therapists — health roles may have separate state caps; check SA and TAS health lists.",
  "251511": "Physiotherapists — AHPRA registration usually required before EOI; state lists change frequently.",
  "252211": "Acupuncturists — not on all state lists; confirm ANZSCO eligibility before state ROI.",
  "252311": "Dentists — limited places; specialist dentists may map to different ANZSCOs.",
  "252411": "General practitioners — strong registration requirements; verify rural workforce streams.",
  "252511": "Physiotherapists (alternative code) — cross-check Home Affairs list vs your assessment outcome.",
  "252611": "Podiatrists — health occupations often require provisional registration evidence.",
  "252711": "Audiologists — smaller cohort; ACT and SA matrix may treat health roles differently.",
  "254111": "Midwives — nursing/midwifery often bundled in state health priorities; AHPRA essential.",
  "254211": "Nurse educators — may not appear on all skilled lists; confirm against current state health lists.",
  "254411": "Nurse practitioners — advanced practice roles; verify assessing body and registration.",
  "254415": "Registered nurses — among the most nominated health occupations; state ROI competition is high.",
  "254418": "Enrolled nurses — fewer state pathways than RNs; check 491 regional options.",
  "261111": "ICT business analysts — compare with 261312 (developer) if your duties overlap.",
  "261112": "Systems analysts — NSW and VIC often require demonstrated ICT employment in Australia.",
  "261211": "Multimedia specialists — verify portfolio evidence for skills assessment (ACS).",
  "261312": "Developer programmers — high volume occupation; points and English thresholds are competitive.",
  "261313": "Software engineers — ACS skills assessment required; check state ROI minimum points.",
  "262112": "ICT security specialists — growing demand; confirm ANZSCO mapping with ACS case officer.",
  "271111": "Barristers — legal occupations have strict admission requirements; limited state nomination.",
  "271311": "Solicitors — may need local admission; not all states nominate legal professionals.",
  "272311": "Psychologists — AHPRA general registration pathway; health list caps apply.",
  "272511": "Social workers — AASW assessment; VIC and SA health/human services streams.",
  "351311": "Chefs — trades pathway via TRA; verify commercial kitchen experience years.",
  "351411": "Cooks — distinguish from chefs (351311) for skills assessment and state lists.",
  "452311": "Diving instructors — niche occupation; confirm list presence before EOI.",
  "599612": "Insurance agents — not on all GSM lists; verify Skilled Occupation List status.",
};

export function occupationStateNote(anzscoCode: string | null): string | null {
  if (!anzscoCode) return null;
  return OCCUPATION_STATE_NOTES[anzscoCode] ?? null;
}
