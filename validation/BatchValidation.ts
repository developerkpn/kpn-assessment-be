import { z, ZodType } from "zod";

export class BatchValidation {
  static readonly CREATE: ZodType = z.object({
    batch_name: z.string().trim().min(1, { message: "Batch name is required. Please enter a valid name." }),
    grouptest_id: z.string().uuid({ message: "Invalid Group Test ID. Please provide a valid UUID." }),
    bu_id: z.string().uuid({ message: "Invalid BU ID. Please provide a valid UUID." }),
    function_id: z.string().uuid({ message: "Invalid Function ID. Please provide a valid UUID." }),
    template_email_id: z.string().uuid({ message: "Invalid Template Email ID. Please provide a valid UUID." }),
    start_period: z.string().min(1, { message: "Start period is required. Please provide a valid value." }),
    end_period: z.string().min(1, { message: "End period is required. Please provide a valid value." }),
    is_mic: z.boolean(),
    is_screenshot: z.boolean(),
    note: z.string().trim().min(1, { message: "Note cannot be empty if provided." }).optional(),
    description: z.union([
      // String for legacy/simple description (edit mode)
      z.string().trim().min(1, { message: "Description is required. Please enter a description." }),
      // Array for multi-language descriptions (create mode)
      z
        .array(
          z.object({
            language_id: z.string().min(1, { message: "Language ID is required." }),
            description: z.string().trim().min(1, { message: "Language description is required." }),
            language_type: z.enum(["main", "sub"], { message: "Language type must be either 'main' or 'sub'." }),
          })
        )
        .min(1, { message: "At least one language description is required." }),
    ]),
    type: z.string().trim().length(8, { message: "Type must be exactly 8 characters." }),
    cc_email: z.object({
      roles: z
        .array(
          z.object({
            role_id: z.string().uuid({ message: "Invalid Role ID. Please provide a valid UUID." }),
          })
        )
        .optional(),
      emails: z
        .array(
          z.object({
            cc_email: z.string().trim().email({ message: "Invalid CC email format." }),
          })
        )
        .optional(),
    }),
    assessees: z
      .array(
        z.object({
          assessee_nik: z.string().trim().length(11, { message: "NIK must be exactly 11 characters." }).optional(),
          assessee_name: z.string().trim().min(1, { message: "Assessee name is required." }),
          assessee_email: z.string().trim().email({ message: "Invalid assessee email format." }),
        })
      )
      .min(1, { message: "Assessee must be filled in" }),
  });

  static readonly UPDATE: ZodType = z.object({
    batch_name: z.string().trim().min(1, { message: "Batch name cannot be empty." }).optional(),
    grouptest_id: z.string().uuid({ message: "Invalid Group Test ID." }).optional(),
    bu_id: z.string().uuid({ message: "Invalid BU ID." }).optional(),
    function_id: z.string().uuid({ message: "Invalid Function ID." }).optional(),
    template_email_id: z.string().uuid({ message: "Invalid Template Email ID." }).optional(),
    start_period: z.string().min(1, { message: "Start period cannot be empty." }).optional(),
    end_period: z.string().min(1, { message: "End period cannot be empty." }).optional(),
    is_mic: z.boolean().optional(),
    is_screenshot: z.boolean().optional(),
    note: z.string().trim().min(1, { message: "Note cannot be empty." }).optional(),
    description: z.string().trim().min(1, { message: "Description cannot be empty." }).optional(),
    type: z.string().trim().length(8, { message: "Type must be exactly 8 characters." }).optional(),
    language_type: z.string().trim().optional(),
    language_id: z.string().trim().optional(),
    cc_email: z.object({
      roles: z.object({
        deleted_roles: z
          .array(
            z.object({
              role_id: z.string().uuid({ message: "Invalid Role ID in deleted roles." }),
            })
          )
          .optional(),
        selected_roles: z
          .array(
            z.object({
              role_id: z.string().uuid({ message: "Invalid Role ID in selected roles." }),
            })
          )
          .optional(),
      }),
      emails: z.object({
        deleted_emails: z
          .array(
            z.object({
              cc_email: z.string().trim().email({ message: "Invalid deleted CC email format." }),
            })
          )
          .optional(),
        selected_emails: z
          .array(
            z.object({
              cc_email: z.string().trim().email({ message: "Invalid selected CC email format." }),
            })
          )
          .optional(),
      }),
    }),
    assessees: z.object({
      deleted_assessees: z.array(
        z.object({
          id: z.string().uuid({ message: "Invalid deleted assessee ID." }),
        })
      ),
      selected_assessees: z.array(
        z.object({
          assessee_nik: z.string().trim().length(11, { message: "NIK must be exactly 11 characters." }).optional(),
          assessee_name: z.string().trim().min(1, { message: "Assessee name is required." }),
          assessee_email: z.string().trim().email({ message: "Invalid assessee email format." }),
        })
      ),
    }),
  });

  static readonly ADDASSESSEEMANUALLY: z.ZodSchema = z.array(
    z.object({
      assessee_nik: z.string().min(11, { message: "NIK must be at least 11 characters." }).optional(),
      assessee_name: z.string().trim().min(1, { message: "Assessee name is required." }),
      assessee_email: z.string().trim().email({ message: "Invalid assessee email format." }),
    })
  );

  static readonly ID: ZodType = z.string().uuid({ message: "Invalid ID. Please provide a valid UUID." });

  static readonly ASSESSEE: ZodType = z.array(
    z.object({
      id: z.string().uuid({ message: "Invalid ID." }),
      batch_id: z.string().uuid({ message: "Invalid batch ID." }),
      assessee_nik: z.string().trim().length(11, { message: "NIK must be exactly 11 characters." }),
      assessee_name: z.string().trim().min(1, { message: "Assessee name is required." }),
      assessee_email: z.string().trim().email({ message: "Invalid email format." }),
    })
  );

  static readonly CREATE_TRANSLATION: ZodType = z.object({
    batch_id: z.string().uuid({ message: "Invalid batch ID. Please provide a valid UUID." }),
    language_id: z.string().min(1, { message: "Language ID is required." }),
    description: z.string().trim().min(1, { message: "Description is required for translation." }),
  });

  static readonly UPDATE_TRANSLATION: ZodType = z.object({
    description: z.string().trim().min(1, { message: "Description is required for translation." }),
  });

  static readonly TRANSLATION_PARAMS: ZodType = z.object({
    batchId: z.string().uuid({ message: "Invalid batch ID. Please provide a valid UUID." }),
    languageId: z.string().min(1, { message: "Language ID is required." }),
  });
}
