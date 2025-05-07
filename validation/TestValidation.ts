import { z, ZodType } from "zod";

export class TestValidation {
  static readonly CREATE: ZodType = z.object({
    test_name: z.string().trim().min(1).max(128),
    test_code: z.string().trim().min(1).max(16).toUpperCase(),
    category_id: z.number().positive(),
    summary_type: z
      .enum(["SUBTEST", "CATEGORY"], {
        errorMap: () => ({
          message: "Summary Type must value either 'SUBTEST' OR 'CATEGORY'",
        }),
      })
      .optional(),
    summary_formula: z
      .enum(["SUM", "AVG"], {
        errorMap: () => ({
          message: "Summary Formula must value either 'SUM' OR 'AVG'",
        }),
      })
      .optional(),
    description: z.string().trim().min(1),
    subtests: z.array(
      z.object({
        subtest_id: z.string().uuid(),
      })
    ),
  });

  static readonly ID: ZodType = z.string().uuid();

  static readonly UPDATE: ZodType = z.object({
    test_name: z.string().trim().min(1).max(128).optional(),
    test_code: z.string().trim().min(1).max(16).toUpperCase().optional(),
    category_id: z.number().positive().optional(),
    summary_type: z
      .enum(["SUBTEST", "CATEGORY"], {
        errorMap: () => ({
          message: "Summary Type must value either 'SUBTEST' OR 'CATEGORY'",
        }),
      })
      .optional(),
    summary_formula: z
      .enum(["SUM", "AVG"], {
        errorMap: () => ({
          message: "Summary Formula must value either 'SUM' OR 'AVG'",
        }),
      })
      .optional(),
    is_active: z.boolean().optional(),
    description: z.string().trim().min(1).optional(),
    subtests: z
      .array(
        z
          .object({
            subtest_id: z.string().uuid(),
          })
          .optional()
      )
      .optional(),
  });
}
