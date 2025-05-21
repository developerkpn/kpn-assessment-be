import { z, ZodType } from "zod";

export class TermsPPValidation {
  static readonly UPDATE_BASE = z
    .object({
      name: z.string().trim().min(1, "Name is required"),
      updated_by: z.string().trim().min(1, "Updated by is required"),
      updated_date: z.date(),
    })
    .strict();

  static readonly UPDATETERMS = TermsPPValidation.UPDATE_BASE;
  static readonly UPDATEPP = TermsPPValidation.UPDATE_BASE;

  static readonly UPDATESB: ZodType = z
    .object({
      short_brief_name: z.string().trim().min(1, "Short brief name is required"),
      updated_by: z.string().trim().min(1, "Updated by is required"),
      updated_date: z.date(),
    })
    .strict();
}
