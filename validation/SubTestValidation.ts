import { z, ZodType } from "zod";

export class SubTestValidation {
  static readonly CREATE: ZodType = z
    .object({
      subtest_name: z.string().trim().min(1, "Subtest name is required").max(128, "Subtest name max length is 128"),
      subtest_code: z
        .string()
        .trim()
        .min(1, "Subtest code is required")
        .max(16, "Subtest code max length is 16")
        .transform((val) => val.toUpperCase()),
      is_duration: z.boolean(),
      subtest_duration: z
        .string()
        .regex(/^(?:[0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, "Invalid time format. Must be hh:mm:ss")
        .optional()
        .nullable(),
      series: z
        .array(
          z.object({
            series_id: z.string().uuid("Invalid UUID format for series_id"),
          })
        )
        .min(1, "At least one series must be provided"),
      intro_desc: z.string().trim().min(1).optional().nullable(),
      subtest_desc: z.string().trim().min(1, "Subtest description is required"),
      series_example_id: z.string().uuid().optional().nullable(),
      is_example_answer_shown: z.boolean().optional().nullable(),
      criteria_id: z.string().uuid("Criteria should be selected").optional().nullable(),
      is_criteria: z.boolean(),
      is_mandatory: z.boolean(),
      language_id: z.string().min(1, "Language is required"),
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
          message: "Duration must be null or omitted when is_duration is false",
          path: ["subtest_duration"],
        });
      }
      if (data.is_criteria && !data.criteria_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Criteria is required when is_criteria is true",
          path: ["criteria_id"],
        });
      }
      if (!data.is_criteria && data.criteria_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Criteria must be null or omitted when is_criteria is false",
          path: ["criteria_id"],
        });
      }
    });

  static readonly UPDATE: ZodType = z
    .object({
      subtest_name: z.string().trim().min(1).max(128).optional(),
      subtest_code: z
        .string()
        .trim()
        .min(1)
        .max(16)
        .transform((val) => val.toUpperCase())
        .optional(),
      is_duration: z.boolean().optional().nullable(),
      subtest_desc: z.string().min(1),
      subtest_duration: z
        .string()
        .regex(/^(?:[0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, "Invalid time format. Must be hh:mm:ss")
        .optional()
        .nullable(),
      intro_desc: z.string().trim().min(1).optional().nullable(),
      series_example_id: z.string().uuid().optional().nullable(),
      is_example_answer_shown: z.boolean().optional().nullable(),
      series: z.array(
        z.object({
          series_id: z.string().uuid("Invalid UUID format for selected_series.series_id"),
        })
      ),
      criteria_id: z.string().uuid("Criteria should be selected").optional().nullable(),
      is_criteria: z.boolean().nullable().optional(),
      is_mandatory: z.boolean().optional(),
      language_id: z.string().min(1, "Language is required").optional(),
      language_type: z.enum(["main", "sub"]).optional(),
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
          message: "Duration must be null or omitted when is_duration is false",
          path: ["subtest_duration"],
        });
      }
      if (data.is_criteria && !data.criteria_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Criteria is required when is_criteria is true",
          path: ["criteria_id"],
        });
      }
      if (!data.is_criteria && data.criteria_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Criteria must be null or omitted when is_criteria is false",
          path: ["criteria_id"],
        });
      }
    });

  static readonly ID: ZodType = z.string().uuid("Invalid UUID format for subtest ID");
}
