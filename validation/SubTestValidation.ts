import { z, ZodType } from "zod";

export class SubTestValidation {
  static readonly CREATE: ZodType = z.object({
    subtest_name: z.string().min(1).max(128).trim(),
    subtest_code: z.string().min(1).max(16).trim().toUpperCase(),
    subtest_duration: z
      .string()
      .regex(/^(?:[0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, "Invalid time format. Must be hh:mm:ss"),
    criteria_id: z.string().uuid(),
    series: z.array(
      z.object({
        series_id: z.string().uuid(),
      })
    ),
    intro_desc: z.string().min(1),
    series_example_id: z.string().uuid(),
  });

  static readonly ID: ZodType = z.string().uuid();

  static readonly UPDATE: ZodType = z.object({
    subtest_name: z.string().min(1).max(128).optional(),
    subtest_code: z.string().min(1).max(16).trim().toUpperCase().optional(),
    subtest_duration: z
      .string()
      .regex(/^(?:[0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, "Invalid time format. Must be hh:mm:ss")
      .optional(),
    is_active: z.boolean().optional(),
    criteria_id: z.string().uuid().optional(),
    intro_desc: z.string().min(1).optional(),
    series_example_id: z.string().uuid(),
    deleted_series: z.array(
      z
        .object({
          series_id: z.string().uuid(),
        })
        .optional()
    ),
    selected_series: z.array(
      z
        .object({
          series_id: z.string().uuid(),
        })
        .optional()
    ),
  });
}
