import {z, ZodType} from "zod";

export class BatchValidation {
    static readonly CREATE: ZodType = z.object({
        batch_name: z.string().trim().min(1),
        batch_code: z.string().trim().min(1).max(16).toUpperCase(),
        group_id: z.string().uuid(),
        bu_id: z.string().uuid(),
        function_id: z.string().uuid(),
        start_period: z.string().min(1),
        end_period: z.string().min(1),
        randomized_question: z.boolean(),
        randomized_test_series: z.boolean(),
        mic: z.boolean(),
        screenshot: z.boolean(),
        note: z.string().trim().min(1),
        template_email_id: z.string().uuid()
    });

    static readonly UPDATE: ZodType = z.object({
        batch_name: z.string().trim().min(1).optional(),
        batch_code: z.string().trim().min(1).max(16).toUpperCase().optional(),
        group_id: z.string().uuid().optional(),
        bu_id: z.string().uuid().optional(),
        function_id: z.string().uuid().optional(),
        start_period: z.string().min(1).optional(),
        end_period: z.string().min(1).optional(),
        randomized_question: z.boolean().optional(),
        randomized_test_series: z.boolean().optional(),
        mic: z.boolean().optional(),
        screenshot: z.boolean().optional(),
        note: z.string().trim().min(1).optional(),
        template_email_id: z.string().uuid().optional()
    })

    static readonly ID: ZodType = z.string().uuid();
}