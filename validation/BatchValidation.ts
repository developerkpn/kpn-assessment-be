import { z, ZodType } from "zod";

export class BatchValidation {
  static readonly CREATE: ZodType = z.object({
    batch_name: z.string().trim().min(1),
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
    type: z.string().trim().length(8),
    // is_published: z.boolean(),
    cc_email: z.object({
      roles: z
        .array(
          z.object({
            role_id: z.string().uuid(),
          })
        )
        .optional(),
      emails: z
        .array(
          z.object({
            cc_email: z.string().email(),
          })
        )
        .optional(),
    }),
    assessees: z.array(
      z.object({
        assessee_nik: z.string().trim().length(11).optional(),
        assessee_name: z.string().trim().min(1),
        assessee_email: z.string().email(),
      })
    ),
  });

  static readonly UPDATE: ZodType = z.object({
    batch_name: z.string().trim().min(1).optional(),
    grouptest_id: z.string().uuid().optional(),
    bu_id: z.string().uuid().optional(),
    function_id: z.string().uuid().optional(),
    template_email_id: z.string().uuid().optional(),
    start_period: z.string().min(1).optional(),
    end_period: z.string().min(1).optional(),
    is_mic: z.boolean().optional(),
    is_screenshot: z.boolean().optional(),
    note: z.string().trim().min(1).optional().optional(),
    description: z.string().trim().min(1).optional(),
    type: z.string().trim().length(8).optional(),
    is_published: z.boolean().optional(),
    cc_email: z
      .object({
        roles: z
          .array(
            z.object({
              role_id: z.string().uuid(),
            })
          )
          .optional(),
        emails: z
          .array(
            z.object({
              cc_email: z.string().email(),
            })
          )
          .optional(),
      })
      .optional(),
  });

  static readonly ADDASSESSEEMANUALLY: z.ZodSchema = z.array(
    z.object({
      assessee_nik: z.string().min(11).optional(),
      assessee_name: z.string().trim().min(1),
      assessee_email: z.string().email(),
    })
  );

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
