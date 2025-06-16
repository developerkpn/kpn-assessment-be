import { z, ZodType } from "zod";

export class CriteriaValidation {
  static readonly CREATEGROUP: ZodType = z.object({
    id: z.string().uuid({ message: "Invalid ID format. Please use a valid UUID." }),
    value_code: z
      .string()
      .trim()
      .min(1, { message: "Value code is required. Please enter a valid value." })
      .max(10, { message: "Maximum's 10 characters on category code" }),
    value_name: z
      .string()
      .trim()
      .min(1, { message: "Value name is required. Please enter a valid name." })
      .max(255, { message: "Maximum's 255 characters on category name" }),
    created_by: z.string().trim().min(1, { message: "Creator is required. Please provide the creator's ID." }),
    created_date: z.date({
      required_error: "Created date is required. Please provide a valid date.",
    }),
    value_group: z.string().min(1, { message: "Value group is required. Please enter a valid value." }),
  });

  static readonly CREATECRITERIA: ZodType = z
    .array(
      z
        .object({
          id: z.string().uuid({ message: "Invalid ID format. Must be a valid UUID." }),
          category_fk: z.string().uuid({ message: "Invalid category ID format. Use UUID." }),
          created_by: z.string().uuid({ message: "Invalid creator ID format. Use UUID." }),
          created_date: z.date({
            required_error: "Created date is required. Please provide a valid date.",
          }),
          criteria_name: z
            .string()
            .trim()
            .min(1, { message: "Criteria name is required. Please enter a name." })
            .max(100, { message: "Maximum's 50 characters on criteria name" }),
          minimum_score: z.preprocess(
            (val) => (typeof val === "string" ? Number(val) : val),
            z
              .number({ invalid_type_error: "Minimum score must be a number." })
              .int({ message: "Minimum score must be an integer." })
              .min(0, { message: "Minimum score must be 0 or greater." })
          ),
          maximum_score: z.preprocess(
            (val) => (typeof val === "string" ? Number(val) : val),
            z
              .number({ invalid_type_error: "Maximum score must be a number." })
              .int({ message: "Maximum score must be an integer." })
              .min(0, { message: "Maximum score must be 0 or greater." })
          ),
          description: z.string().trim().min(1, { message: "Description is required. Please enter a description." }),
          color_id: z.number().positive(),
        })
        .refine((data) => data.maximum_score > data.minimum_score, {
          message: "Maximum score must be greater than minimum score.",
          path: ["maximum_score"],
        })
    )
    .refine(
      (data) => {
        // Extract all color_id values
        const colorIds = data.map((item) => item.color_id);

        // Check if all color_id values are unique
        const uniqueColorIds = new Set(colorIds);

        return colorIds.length === uniqueColorIds.size;
      },
      {
        message: "Each criteria must have a different color. Duplicate color_id found.",
        path: ["color_id"],
      }
    );

  static readonly ID: ZodType = z.string().uuid({
    message: "Invalid ID format. Must be a valid UUID.",
  });
}
