import { z, ZodType } from "zod";

export class SubTestValidation {
  static readonly CREATE: ZodType = z
    .object({
      subtest_name: z.string().min(1).max(128).trim(),
      subtest_code: z.string().min(1).max(16).trim().toUpperCase(),
      is_duration: z.boolean(),
      subtest_duration: z
        .string()
        .regex(/^(?:[0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, "Invalid time format. Must be hh:mm:ss")
        .nullable(),
      series: z.array(
        z.object({
          series_id: z.string().uuid(),
        })
      ),
      intro_desc: z.string().min(1),
      report_description: z.string().trim().min(1),
      series_example_id: z.string().uuid(),
    })
    .superRefine((data, ctx) => {
      if (data.is_duration && !data.subtest_duration) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Duration is required when is_duration is true",
          path: ["subtest_duration"],
        });
      }
      if (!data.is_duration && data.subtest_duration) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Duration must be null/omitted when is_duration is false",
          path: ["subtest_duration"],
        });
      }
    });

  static readonly ID: ZodType = z.string().uuid();

  static readonly UPDATE: ZodType = z
    .object({
      subtest_name: z.string().min(1).max(128).optional(),
      subtest_code: z.string().min(1).max(16).trim().toUpperCase().optional(),
      is_duration: z.boolean().optional(),
      subtest_duration: z
        .string()
        .regex(/^(?:[0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, "Invalid time format. Must be hh:mm:ss")
        .nullable()
        .optional(),
      is_active: z.boolean().optional(),
      intro_desc: z.string().trim().min(1).optional(),
      report_description: z.string().trim().min(1).optional(),
      series_example_id: z.string().uuid().optional(),
      deleted_series: z
        .array(
          z
            .object({
              series_id: z.string().uuid(),
            })
            .optional()
        )
        .optional(),
      selected_series: z
        .array(
          z
            .object({
              series_id: z.string().uuid(),
            })
            .optional()
        )
        .optional(),
    })
    .superRefine((data, ctx) => {
      if (data.is_duration && !data.subtest_duration) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Duration is required when is_duration is true",
          path: ["subtest_duration"],
        });
      }
      if (!data.is_duration && data.subtest_duration) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Duration must be null/omitted when is_duration is false",
          path: ["subtest_duration"],
        });
      }
    });
}
