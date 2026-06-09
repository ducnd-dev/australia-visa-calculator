export const RULES_VERSION = "schedule-6d-2026-06-01";
export const LAST_UPDATED = "2026-06-01";
export const EOI_MINIMUM_POINTS = 65;
export type OfficialSource = { id: string; title: string; url: string; tier: "legislation" | "dha" | "instrument" | "reference"; appliesTo: string[]; };
export const OFFICIAL_SOURCES: OfficialSource[] = [
  { id: "schedule-6d", title: "Schedule 6D", url: "https://classic.austlii.edu.au/au/legis/cth/consol_reg/mr1994227/sch6d.html", tier: "legislation", appliesTo: ["189","190","491"] },
  { id: "skillselect", title: "SkillSelect", url: "https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect", tier: "dha", appliesTo: ["189","190","491"] },
];
