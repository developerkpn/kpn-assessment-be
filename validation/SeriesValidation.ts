import { z, ZodType } from "zod";

export class SeriesValidation {
  static readonly CREATE: ZodType = z.object({
    series_name: z
      .string()
      .trim()
      .min(1, { message: "Series name is required." })
      .max(128, { message: "Series name must not exceed 128 characters." }),
    series_code: z
      .string()
      .trim()
      .min(1, { message: "Series code is required." })
      .max(16, { message: "Series code must not exceed 16 characters." })
      .transform((val) => val.toUpperCase()),
    questions: z
      .array(
        z.object({
          question_id: z.string().uuid({ message: "Invalid question_id format." }),
        })
      )
      .min(1, { message: "At least one question must be provided." }),
  });

  static readonly UPDATE: ZodType = z.object({
    series_name: z
      .string()
      .trim()
      .min(1, { message: "Series name cannot be empty if provided." })
      .max(128, { message: "Series name must not exceed 128 characters." })
      .optional(),
    series_code: z
      .string()
      .trim()
      .min(1, { message: "Series code cannot be empty if provided." })
      .max(16, { message: "Series code must not exceed 16 characters." })
      .transform((val) => val.toUpperCase())
      .optional(),
    is_active: z.boolean({ invalid_type_error: "is_active must be a boolean." }).optional(),
    questions: z
      .array(
        z.object({
          question_id: z.string().uuid({ message: "Invalid question_id format." }),
        })
      )
      .optional(),
  });

  static readonly ID: ZodType = z.string().uuid({
    message: "Invalid ID format. Expected a valid UUID.",
  });
}
