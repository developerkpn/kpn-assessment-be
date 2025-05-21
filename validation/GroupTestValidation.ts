import { z, ZodType } from "zod";

export class GroupTestValidation {
  static readonly CREATE: ZodType = z.object({
    grouptest_name: z
      .string()
      .trim()
      .min(1, { message: "Group test name is required." })
      .max(128, { message: "Group test name must not exceed 128 characters." }),
    grouptest_code: z
      .string()
      .trim()
      .min(1, { message: "Group test code is required." })
      .max(16, { message: "Group test code must not exceed 16 characters." })
      .transform((val) => val.toUpperCase()),
    tests: z
      .array(
        z.object({
          test_id: z.string().uuid({ message: "Invalid test_id format." }),
        })
      )
      .min(1, { message: "At least one test must be selected." }),
  });

  static readonly ID: ZodType = z.string().uuid({
    message: "Invalid ID format. Please provide a valid UUID.",
  });

  static readonly UPDATE: ZodType = z.object({
    grouptest_name: z
      .string()
      .trim()
      .min(1, { message: "Group test name cannot be empty if provided." })
      .max(128, { message: "Group test name must not exceed 128 characters." })
      .optional(),
    grouptest_code: z
      .string()
      .trim()
      .min(1, { message: "Group test code cannot be empty if provided." })
      .max(16, { message: "Group test code must not exceed 16 characters." })
      .transform((val) => val.toUpperCase())
      .optional(),
    is_active: z.boolean({ invalid_type_error: "is_active must be a boolean value." }).optional(),
    tests: z
      .array(
        z.object({
          test_id: z.string().uuid({ message: "Invalid test_id format." }),
        })
      )
      .optional(),
  });
}
