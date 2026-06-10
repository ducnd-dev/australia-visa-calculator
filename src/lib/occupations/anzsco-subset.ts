import { ANZSCO_ADDITIONAL } from "./anzsco-data/additional";

export type AnzscoOccupation = { code: string; title: string };

/** Curated dataset version — update when occupations list changes. */
export const ANZSCO_DATASET_VERSION = "2026-06";

const ANZSCO_CORE: AnzscoOccupation[] = [
  { code: "261111", title: "ICT Business Analyst" },
  { code: "261112", title: "Systems Analyst" },
  { code: "261211", title: "Multimedia Specialist" },
  { code: "261212", title: "Web Developer" },
  { code: "261311", title: "Analyst Programmer" },
  { code: "261312", title: "Developer Programmer" },
  { code: "261313", title: "Software Engineer" },
  { code: "261314", title: "Software Tester" },
  { code: "261399", title: "Software and Applications Programmers nec" },
  { code: "262112", title: "ICT Security Specialist" },
  { code: "262113", title: "Systems Administrator" },
  { code: "233211", title: "Civil Engineer" },
  { code: "233512", title: "Mechanical Engineer" },
  { code: "233611", title: "Mining Engineer (excluding Petroleum)" },
  { code: "233911", title: "Aeronautical Engineer" },
  { code: "234111", title: "Agricultural Consultant" },
  { code: "234112", title: "Agricultural Scientist" },
  { code: "241111", title: "Early Childhood (Pre-primary School) Teacher" },
  { code: "241411", title: "Secondary School Teacher" },
  { code: "241511", title: "Special Needs Teacher" },
  { code: "251211", title: "Medical Diagnostic Radiographer" },
  { code: "251212", title: "Medical Radiation Therapist" },
  { code: "251311", title: "Environmental Health Officer" },
  { code: "251312", title: "Occupational Health and Safety Adviser" },
  { code: "251511", title: "Hospital Pharmacist" },
  { code: "251512", title: "Industrial Pharmacist" },
  { code: "251513", title: "Retail Pharmacist" },
  { code: "252311", title: "Dental Specialist" },
  { code: "252312", title: "Dentist" },
  { code: "252411", title: "Occupational Therapist" },
  { code: "252511", title: "Physiotherapist" },
  { code: "252611", title: "Podiatrist" },
  { code: "252711", title: "Audiologist" },
  { code: "252712", title: "Speech Pathologist" },
  { code: "253111", title: "General Practitioner" },
  { code: "253211", title: "Anaesthetist" },
  { code: "253311", title: "Specialist Physician (General Medicine)" },
  { code: "253411", title: "Psychiatrist" },
  { code: "253511", title: "Surgeon (General)" },
  { code: "253911", title: "Dermatologist" },
  { code: "254111", title: "Midwife" },
  { code: "254411", title: "Nurse Practitioner" },
  { code: "254415", title: "Registered Nurse (Critical Care and Emergency)" },
  { code: "254418", title: "Registered Nurse (Medical)" },
  { code: "254421", title: "Registered Nurse (Medical Practice)" },
  { code: "254422", title: "Registered Nurse (Mental Health)" },
  { code: "254423", title: "Registered Nurse (Perioperative)" },
  { code: "254499", title: "Registered Nurses nec" },
  { code: "271311", title: "Solicitor" },
  { code: "271312", title: "Barrister" },
  { code: "272311", title: "Clinical Psychologist" },
  { code: "272511", title: "Social Worker" },
  { code: "272612", title: "Welfare Worker" },
  { code: "351311", title: "Chef" },
  { code: "351411", title: "Cook" },
  { code: "411211", title: "Dental Hygienist" },
  { code: "411411", title: "Enrolled Nurse" },
  { code: "612115", title: "Real Estate Agent" },
  { code: "221111", title: "Accountant (General)" },
  { code: "221112", title: "Management Accountant" },
  { code: "221113", title: "Taxation Accountant" },
  { code: "221213", title: "External Auditor" },
  { code: "224711", title: "Management Consultant" },
  { code: "225113", title: "Marketing Specialist" },
  { code: "232214", title: "Surveyor" },
  { code: "233111", title: "Chemical Engineer" },
  { code: "233214", title: "Structural Engineer" },
  { code: "233215", title: "Transport Engineer" },
  { code: "234611", title: "Medical Laboratory Scientist" },
  { code: "241213", title: "Primary School Teacher" },
  { code: "241311", title: "Middle School Teacher" },
  { code: "242111", title: "University Lecturer" },
  { code: "263111", title: "Computer Network and Systems Engineer" },
  { code: "263211", title: "ICT Quality Assurance Engineer" },
  { code: "263212", title: "ICT Support Engineer" },
  { code: "263213", title: "ICT Systems Test Engineer" },
  { code: "263311", title: "Telecommunications Engineer" },
  { code: "312211", title: "Civil Engineering Draftsperson" },
  { code: "312312", title: "Electrical Engineering Draftsperson" },
  { code: "323211", title: "Fitter (General)" },
  { code: "331111", title: "Bricklayer" },
  { code: "331212", title: "Carpenter" },
  { code: "332211", title: "Painting Trades Worker" },
  { code: "341111", title: "Electrician (General)" },
  { code: "342111", title: "Airconditioning and Refrigeration Mechanic" },
  { code: "399111", title: "Boat Builder and Repairer" },
];

function mergeUnique(sets: AnzscoOccupation[]): AnzscoOccupation[] {
  const map = new Map<string, AnzscoOccupation>();
  for (const o of sets) {
    if (!map.has(o.code)) map.set(o.code, o);
  }
  return [...map.values()].sort((a, b) => a.title.localeCompare(b.title));
}

/** Curated GSM-relevant occupations — verify against current skilled lists before lodging. */
export const ANZSCO_SUBSET = mergeUnique([...ANZSCO_CORE, ...ANZSCO_ADDITIONAL]);

export function searchAnzsco(query: string, limit = 12): AnzscoOccupation[] {
  const q = query.trim().toLowerCase();
  if (!q) return ANZSCO_SUBSET.slice(0, limit);
  return ANZSCO_SUBSET.filter(
    (o) => o.code.includes(q) || o.title.toLowerCase().includes(q)
  ).slice(0, limit);
}

export function findAnzscoByCode(code: string): AnzscoOccupation | undefined {
  return ANZSCO_SUBSET.find((o) => o.code === code);
}
