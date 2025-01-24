import {z, ZodType} from "zod";

export class BusinessUnitValidation {
    static readonly CREATE: ZodType = z.object({
        id: z.string().uuid(),
        bu_code: z.string().trim().min(1),
        bu_name: z.string().trim().min(1),
        is_active: z.boolean(),
        created_by: z.string().min(1),
        created_date: z.date()
    });

    static readonly UPDATE: ZodType = z.object({
        bu_code: z.string().trim().min(1).optional(),
        bu_name: z.string().trim().min(1).optional(),
        is_active: z.boolean().optional()
    });

    static readonly ID: ZodType = z.string().uuid();
}