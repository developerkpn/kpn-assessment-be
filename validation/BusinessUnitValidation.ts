import { z, ZodType } from "zod";

export class BusinessUnitValidation {
  static readonly CREATE: ZodType = z.object({
    id: z.string().uuid({ message: "Invalid ID format. Please provide a valid UUID." }),
    bu_code: z
      .string()
      .trim()
      .min(1, { message: "Business Unit Code is required. Please enter a valid code." })
      .max(5, { message: "Maximum's 5 characters on bussiness unit code" }),
    bu_name: z
      .string()
      .trim()
      .min(1, { message: "Business Unit Name is required. Please enter a valid name." })
      .max(100, { message: "Maximum's 100 characters on bussiness unit name" }),
    is_active: z.boolean({ required_error: "is_active must be a boolean value (true or false)." }),
    created_by: z
      .string()
      .min(1, { message: "Created by field is required. Please provide the creator's name or ID." })
      .max(100, { message: "Maximum's 100 characters on function menu name" }),
    created_date: z.date({ required_error: "Created date is required. Please provide a valid date." }),
  });

  static readonly UPDATE: ZodType = z.object({
    bu_code: z
      .string()
      .trim()
      .min(1, { message: "Business Unit Code is required. Please enter a valid code." })
      .max(5, { message: "Maximum's 5 characters on bussiness unit code" })
      .optional(),
    bu_name: z
      .string()
      .trim()
      .min(1, { message: "Business Unit Name is required. Please enter a valid name." })
      .max(100, { message: "Maximum's 100 characters on bussiness unit name" })
      .optional(),
    is_active: z.boolean({ required_error: "is_active must be a boolean value (true or false)." }).optional(),
  });

  static readonly ID: ZodType = z.string().uuid({ message: "Invalid ID format. Please provide a valid UUID." });
}
