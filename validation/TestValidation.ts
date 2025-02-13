import {z, ZodType} from "zod";

export class TestValidation {
    static readonly CREATE: ZodType = z.object({
        test_name: z.string().min(1).max(128).trim(),
        test_code: z.string().min(1).max(16).trim().toUpperCase(),
        subtests: z.array(z.object({
            subtest_id: z.string().uuid(),
        })),
    });

    static readonly ID: ZodType = z.string().uuid();

    static readonly UPDATE: ZodType = z.object({
        test_name: z.string().min(1).max(128).optional(),
        test_code: z.string().min(1).max(16).trim().toUpperCase().optional(),
        is_active: z.boolean().optional(),
        subtests: z.array((z.object({
            subtest_id: z.string().uuid(),
        })).optional())
    });
}