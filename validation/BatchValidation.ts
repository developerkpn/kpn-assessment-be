import { z, ZodType } from "zod";

export class BatchValidation {
  static readonly CREATE: ZodType = z.object({
    batch_name: z.string().trim().min(1),
    batch_code: z.string().trim().min(1).max(16).toUpperCase(),
    grouptest_id: z.string().uuid(),
    bu_id: z.string().uuid(),
    function_id: z.string().uuid(),
    template_email_id: z.string().uuid(),
    start_period: z.string().min(1),
    end_period: z.string().min(1),
    is_mic: z.boolean(),
    is_screenshot: z.boolean(),
    note: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1),
  });

  static readonly UPDATE: ZodType = z.object({
    batch_name: z.string().trim().min(1).optional(),
    batch_code: z.string().trim().min(1).max(16).toUpperCase().optional(),
    grouptest_id: z.string().uuid().optional(),
    bu_id: z.string().uuid().optional(),
    function_id: z.string().uuid().optional(),
    template_email_id: z.string().uuid().optional(),
    start_period: z.string().min(1).optional(),
    end_period: z.string().min(1).optional(),
    is_mic: z.boolean().optional(),
    is_screenshot: z.boolean().optional(),
    note: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
  });

  static readonly ADDASSESSEEMANUALLY: z.ZodSchema = z.object({
    assessee_nik: z.string().length(11),
    // assessee_name: z.string().trim().min(1),
    // assessee_email: z.string().email(),
  });

  static readonly ID: ZodType = z.string().uuid();

  static readonly ASSESSEE: ZodType = z.array(
    z.object({
      id: z.string().uuid(),
      batch_id: z.string().uuid(),
      assessee_nik: z.string().trim().length(11),
      assessee_name: z.string().trim().min(1),
      assessee_email: z.string().email(),
    })
  );
}
