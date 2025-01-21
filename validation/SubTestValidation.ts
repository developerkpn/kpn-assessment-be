import {z, ZodType} from "zod";

export class SubTestValidation {
    static readonly CREATE: ZodType = z.object({
        subtest_name: z.string().min(1).max(128).trim(),
        subtest_code: z.string().min(1).max(16).trim().toUpperCase(),
        subtest_duration: z.string().regex(
            /^(?:[0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
            "Invalid time format. Must be hh:mm:ss"
        ),
        is_active: z.boolean(),
        category_id: z.number().positive(),
        criteria_id: z.string().uuid(),
        series: z.array(z.object({
            series_id: z.string().uuid(),
        })),
    });

    static readonly ID: ZodType = z.string().uuid();

    static readonly UPDATE: ZodType = z.object({
       subtest_name: z.string().min(1).max(128).optional(),
        subtest_duration: z.string().regex(
            /^(?:[0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
            "Invalid time format. Must be hh:mm:ss"
        ).optional(),
        is_active: z.boolean().optional(),
        category_id: z.number().positive().optional(),
        criteria_id: z.string().uuid().optional(),
    });

    static readonly ADDSERIES: ZodType = z.object({
        series: z.array((z.object({
            series_id: z.string().uuid(),
        })))
    });
}