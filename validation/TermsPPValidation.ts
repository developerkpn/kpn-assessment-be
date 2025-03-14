import { z, ZodType } from "zod";

export class TermsPPValidation {
  static readonly UPDATETERMS: ZodType = z.object({
    name: z.string().trim().min(1),
    updated_by: z.string().trim().min(1),
    updated_date: z.date(),
  });

  static readonly UPDATEPP: ZodType = z.object({
    name: z.string().trim().min(1),
    updated_by: z.string().trim().min(1),
    updated_date: z.date(),
  });

  static readonly UPDATESB: ZodType = z.object({
    short_brief_name: z.string().trim().min(1),
    updated_by: z.string().trim().min(1),
    updated_date: z.date(),
  });
}
