import {z, ZodType} from "zod";

export class GroupTestValidation {
    static readonly CREATE: ZodType = z.object({
        grouptest_name: z.string().min(1).max(128).trim(),
        grouptest_code: z.string().min(1).max(16).trim().toUpperCase(),
        is_active: z.boolean(),
        subtests: z.array(z.object({
            subtest_id: z.string().uuid(),
        })),
    });

    static readonly ID: ZodType = z.string().uuid();

    static readonly UPDATE: ZodType = z.object({
        grouptest_name: z.string().min(1).max(128).optional(),
        is_active: z.boolean().optional(),
    });

    static readonly ADDSUBTEST: ZodType = z.object({
        subtests: z.array((z.object({
            subtest_id: z.string().uuid(),
        })))
    });
}