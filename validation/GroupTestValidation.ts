import { z, ZodType } from "zod";

export class GroupTestValidation {
  static readonly CREATE: ZodType = z.object({
    grouptest_name: z.string().min(1).max(128).trim(),
    grouptest_code: z.string().min(1).max(16).trim().toUpperCase(),
    tests: z.array(
      z.object({
        test_id: z.string().uuid(),
      })
    ),
  });

  static readonly ID: ZodType = z.string().uuid();

  static readonly UPDATE: ZodType = z.object({
    grouptest_name: z.string().min(1).max(128).optional(),
    grouptest_code: z.string().min(1).max(16).trim().toUpperCase().optional(),
    is_active: z.boolean().optional(),
    tests: z.array(
      z
        .object({
          test_id: z.string().uuid(),
        })
        .optional()
    ),
  });
}
