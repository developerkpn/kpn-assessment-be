import { z, ZodType } from "zod";

export class CategoryValidation {
  static readonly CREATE: ZodType = z.object({
    category_name: z
      .string()
      .trim()
      .min(1, { message: "Category name is required. Please enter a valid name." })
      .max(128, { message: "Category name cannot exceed 128 characters." }),

    category_code: z
      .string()
      .trim()
      .min(1, { message: "Category code is required. Please enter a valid code." })
      .max(16, { message: "Category code cannot exceed 16 characters." })
      .transform((val) => val.toUpperCase()),

    criteria_id: z.string().uuid({ message: "Invalid criteria ID. Please provide a valid UUID." }),

    created_by: z.string().trim().length(36, { message: "Created by must be exactly 36 characters (UUID format)." }),

    created_at: z.date({ required_error: "Created at date is required. Please provide a valid date." }),

    is_active: z.boolean({ required_error: "is_active must be a boolean value (true or false)." }),
  });

  static readonly UPDATE: ZodType = z
    .object({
      category_name: z
        .string()
        .trim()
        .min(1, { message: "Category name cannot be empty." })
        .max(128, { message: "Category name cannot exceed 128 characters." })
        .optional(),

      criteria_id: z.string().uuid({ message: "Invalid criteria ID. Please provide a valid UUID." }),

      updated_by: z
        .string()
        .trim()
        .min(1, { message: "Updated by is required. Please enter the updater's identifier." }),

      updated_at: z.date({ required_error: "Updated at date is required. Please provide a valid date." }),

      is_active: z.boolean({ required_error: "is_active must be a boolean value (true or false)." }).optional(),
    })
    .strict();

  static readonly ID: ZodType = z.number().positive({ message: "ID must be a positive number." });
}
