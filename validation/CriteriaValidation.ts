import { z, ZodType } from "zod";

export class CriteriaValidation {
  static readonly CREATEGROUP: ZodType = z.object({
    id: z.string().uuid(),
    value_code: z.string().trim().min(1),
    value_name: z.string().trim().min(1),
    created_by: z.string().trim().min(1),
    created_date: z.date(),
    value_group: z.string().min(1),
  });

  static readonly CREATECRITERIA: ZodType = z.array(
    z
      .object({
        id: z.string().uuid("Invalid ID format"), // UUID format check
        category_fk: z.string().uuid("Invalid category_fk format"), // UUID format check
        created_by: z.string().uuid("Invalid creator ID format"), // UUID format check
        created_date: z.date(),
        criteria_name: z.string().trim().min(1, "Criteria name is required"),
        minimum_score: z.number().int("Minimum score must be an integer").min(0, "Minimum score must be 0 or greater"),
        maximum_score: z.number().int("Maximum score must be an integer").min(0, "Maximum score must be 0 or greater"),
        description: z.string().trim().min(1),
      })
      .refine((data) => data.maximum_score > data.minimum_score, {
        message: "Maximum score must be greater than minimum score",
        path: ["maximum_score"],
      })
  );

  static readonly ID: ZodType = z.string().uuid();
}
