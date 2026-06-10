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
