import { z, ZodType } from "zod";

export class EmailTemplateValidation {
  static readonly CREATE: ZodType = z.object({
    subject: z.string().trim().min(1, { message: "Subject is required. Please enter a subject line." }),
    title: z.string().trim().min(1, { message: "Title is required. Please enter a title." }),
    header: z.string().trim().min(1, { message: "Header is required. Please provide a header." }),
    body: z.string().trim().min(1, { message: "Body is required. Please provide the main content." }),
    footer: z.string().trim().min(1, { message: "Footer is required. Please enter a footer." }),
  });

  static readonly UPDATE: ZodType = z.object({
    subject: z.string().trim().min(1, { message: "Subject cannot be empty if provided." }).optional(),
    title: z.string().trim().min(1, { message: "Title cannot be empty if provided." }).optional(),
    header: z.string().trim().min(1, { message: "Header cannot be empty if provided." }).optional(),
    body: z.string().trim().min(1, { message: "Body cannot be empty if provided." }).optional(),
    footer: z.string().trim().min(1, { message: "Footer cannot be empty if provided." }).optional(),
  });

  static readonly ID: ZodType = z.string().uuid({
    message: "Invalid ID format. Please use a valid UUID.",
  });
}
