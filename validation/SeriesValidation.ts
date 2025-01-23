import {z, ZodType} from "zod";

export class SeriesValidation {
    static readonly CREATE: ZodType = z.object({
        series_name: z.string().min(1).max(128).trim(),
        series_code: z.string().min(1).max(16).trim().toUpperCase(),
        is_active: z.boolean(),
        category_id: z.number().positive(),
        // detail: z.array(z.object({
        //     question_id: z.string().uuid(),
        // })),
    });

    static readonly UPDATE: ZodType = z.object({
        series_name: z.string().min(1).optional(),
        is_active: z.boolean().optional(),
        updated_date: z.date()
    });

    static readonly ID: ZodType = z.string().uuid();

    static readonly ADDQUESTION: ZodType = z.object({
        detail: z.array(z.object({
            question_id: z.string().uuid(),
        }))
    });

    static readonly QUERY: ZodType = z.object({
        search: z.string().min(0).optional().default(""),
        active: z.enum(["true", "false"]).optional(),
        page: z.number().positive().optional().default(1),
        date: z.enum(['DESC', 'ASC']).optional().default('DESC')
    });
}