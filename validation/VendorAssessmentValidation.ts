import { z, ZodType } from "zod";

export class VendorAssessmentValidation {
  static readonly CREATE: ZodType = z.object({
    participant_name: z.string().trim().min(1, "Participant name is required"),
    participant_email: z.string().trim().email("Invalid email address"),
    participant_nik: z.string().trim().optional().nullable(),
    vendor_name: z.string().trim().min(1, "Vendor name is required"),
    assessment_date: z.string().min(1, "Assessment date is required"),
    has_critical_thinking: z.boolean().default(false),
    critical_thinking_score: z.string().optional().nullable(),
    critical_thinking_category: z.string().optional().nullable(),
    has_work_endurance: z.boolean().default(false),
    work_endurance_score: z.string().optional().nullable(),
    work_endurance_category: z.string().optional().nullable(),
    has_growth_mindset: z.boolean().default(false),
    growth_mindset_score: z.string().optional().nullable(),
    growth_mindset_category: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  });

  static readonly ID: ZodType = z.string().uuid("Invalid ID format. Must be a valid UUID.");
}
