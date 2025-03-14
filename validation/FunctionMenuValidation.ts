import { z, ZodType } from "zod";

export class FunctionMenuValidation {
  static readonly CREATE: ZodType = z.object({
    id: z.string().uuid(),
    fm_code: z.string().trim().min(1),
    fm_name: z.string().trim().min(1),
    is_active: z.boolean(),
    created_by: z.string().trim().min(1),
    created_date: z.date(),
  });

  static readonly UPDATE: ZodType = z.object({
    fm_code: z.string().trim().min(1).optional(),
    fm_name: z.string().trim().min(1).optional(),
    is_active: z.boolean().optional(),
  });

  static readonly ID: ZodType = z.string().uuid();
}
