import { z, ZodType } from "zod";

export class TestValidation {
  static readonly CREATE: ZodType = z.object({
    test_name: z.string().trim().min(1, "Test name is required").max(128, "Test name must be at most 128 characters"),
    test_code: z
      .string()
      .trim()
      .min(1, "Test code is required")
      .max(16, "Test code must be at most 16 characters")
      .transform((val) => val.toUpperCase()),
    category_id: z.number().positive("Category ID must be a positive number"),
    description: z.string().trim().min(1, "Description is required"),
    subtests: z.array(
      z.object({
        subtest_id: z.string().uuid("Subtest ID must be a valid UUID"),
      })
    ),
  });

  static readonly ID: ZodType = z.string().uuid("ID must be a valid UUID");

  static readonly UPDATE: ZodType = z.object({
    test_name: z
      .string()
      .trim()
      .min(1, "Test name cannot be empty")
      .max(128, "Test name must be at most 128 characters")
      .optional(),
    test_code: z
      .string()
      .trim()
      .min(1, "Test code cannot be empty")
      .max(16, "Test code must be at most 16 characters")
      .transform((val) => val.toUpperCase())
      .optional(),
    category_id: z.number().positive("Category ID must be a positive number").optional(),
    is_active: z.boolean().optional(),
    description: z.string().trim().min(1, "Description cannot be empty").optional(),
    subtests: z
      .array(
        z
          .object({
            subtest_id: z.string().uuid("Subtest ID must be a valid UUID"),
          })
          .optional()
      )
      .optional(),
  });
}
