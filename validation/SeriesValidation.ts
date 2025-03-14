import { z, ZodType } from "zod";

export class SeriesValidation {
  static readonly CREATE: ZodType = z.object({
    series_name: z.string().min(1).max(128).trim(),
    series_code: z.string().min(1).max(16).trim().toUpperCase(),
    questions: z.array(
      z.object({
        question_id: z.string().uuid(),
      })
    ),
  });

  static readonly UPDATE: ZodType = z.object({
    series_name: z.string().min(1).optional(),
    series_code: z.string().min(1).max(16).trim().toUpperCase().optional(),
    is_active: z.boolean().optional(),
    questions: z.array(
      z
        .object({
          question_id: z.string().uuid(),
        })
        .optional()
    ),
  });

  static readonly ID: ZodType = z.string().uuid();
}
