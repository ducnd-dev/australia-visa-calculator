import { z } from "zod";
export const calculatorAnswersSchema = z.object({
  visaSubclass: z.enum(["189", "190", "491"]),
  ageBand: z.enum(["18-24", "25-32", "33-39", "40-44", "45+"]),
  english: z.enum(["competent", "proficient", "superior"]),
  overseasYears: z.enum(["0", "3", "5", "8"]),
  australianYears: z.enum(["0", "1", "3", "5", "8"]),
  qualification: z.enum(["none", "diploma", "bachelor", "doctorate"]),
  australianStudy: z.boolean(),
  regionalStudy: z.boolean(),
  specialistEducation: z.boolean(),
  naati: z.boolean(),
  professionalYear: z.boolean(),
  partnerStatus: z.enum(["single", "partner-english", "partner-skilled"]),
  clientReference: z.string().optional(),
});
export type CalculatorAnswers = z.infer<typeof calculatorAnswersSchema>;
