import type { VisaSubclass } from "../types";
import { getGsmPathwaysFromCatalog } from "../visa-catalog";

export type GsmPathway = {
  code: VisaSubclass;
  label: string;
  shortLabel: string;
  nominationPoints: number;
  nominationNote: string;
  citation: string;
};

/** Subclasses using Schedule 6D in this calculator. */
export const GSM_PATHWAYS: GsmPathway[] = getGsmPathwaysFromCatalog();

export function gsmPathwayByCode(code: VisaSubclass): GsmPathway {
  return GSM_PATHWAYS.find((p) => p.code === code)!;
}
