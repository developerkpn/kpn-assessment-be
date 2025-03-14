import { z, ZodType } from "zod";

export class CategoryValidation {
  static readonly CREATE: ZodType = z.object({
    category_name: z.string().trim().min(1).max(128),
    category_code: z.string().trim().min(1).max(16).toUpperCase(),
    created_by: z.string().trim().length(36),
    created_at: z.date(),
    is_active: z.boolean(),
  });

  static readonly UPDATE: ZodType = z
    .object({
      category_name: z.string().trim().min(1).max(128).optional(),
      updated_by: z.string().trim().min(1),
      updated_at: z.date(),
      is_active: z.boolean().optional(),
    })
    .strict();

  static readonly ID: ZodType = z.number().positive();
}
