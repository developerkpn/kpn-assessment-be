import { z, ZodType } from "zod";

export class FunctionMenuValidation {
  static readonly CREATE: ZodType = z.object({
    id: z.string().uuid({ message: "Invalid ID format. Please provide a valid UUID." }),
    fm_code: z
      .string()
      .trim()
      .min(1, { message: "Function menu code is required." })
      .max(10, { message: "Maximum's 10 characters on function menu code" }),
    fm_name: z
      .string()
      .trim()
      .min(1, { message: "Function menu name is required." })
      .max(100, { message: "Maximum's 100 characters on function menu name" }),
    is_active: z.boolean({
      required_error: "Please specify if the function menu is active.",
    }),
    created_by: z.string().trim().min(1, { message: "Creator information is required." }),
    created_date: z.date({
      required_error: "Creation date is required.",
      invalid_type_error: "Invalid date format. Please provide a valid date.",
    }),
  });

  static readonly UPDATE: ZodType = z.object({
    fm_code: z
      .string()
      .trim()
      .min(1, { message: "Function menu code cannot be empty if provided." })
      .max(10, { message: "Maximum's 10 characters on function menu code" })
      .optional(),
    fm_name: z
      .string()
      .trim()
      .min(1, { message: "Function menu name cannot be empty if provided." })
      .max(100, { message: "Maximum's 100 characters on function menu name" })
      .optional(),
    is_active: z.boolean({ invalid_type_error: "is_active must be true or false." }).optional(),
  });

  static readonly ID: ZodType = z.string().uuid({
    message: "Invalid ID format. Please provide a valid UUID.",
  });
}
