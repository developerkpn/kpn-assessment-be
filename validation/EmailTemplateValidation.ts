import { z, ZodType } from "zod";

export class EmailTemplateValidation {
  static readonly CREATE: ZodType = z.object({
    subject: z.string().trim().min(1),
    title: z.string().trim().min(1),
    header: z.string().trim().min(1),
    footer: z.string().trim().min(1),
  });

  static readonly UPDATE: ZodType = z.object({
    subject: z.string().trim().min(1).optional(),
    title: z.string().trim().min(1).optional(),
    header: z.string().trim().min(1).optional(),
    footer: z.string().trim().min(1).optional(),
  });

  static readonly ID: ZodType = z.string().uuid();
}
