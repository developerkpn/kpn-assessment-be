import {z, ZodType} from "zod";

export class AdminWebValidation {
    static readonly LOGIN: ZodType = z.object({
        emailOrUname: z.string().trim().min(1),
        password: z.string().trim().min(6)
    });

    static readonly CREATEADMIN: ZodType = z.object({
        id: z.string().uuid(),
        fullname: z.string().trim().min(1),
        username: z.string().trim().min(6),
        email: z.string().email(),
        password: z
            .string()
            .min(6)
            .regex(
                /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d).+$/,
                "Password must contain at least one uppercase letter, one symbol, and one number."
            ),
        role_id: z.string().uuid(),
    });

    static readonly ID: ZodType = z.string().uuid();

    static readonly EMAIL: ZodType = z.string().trim().email();

    static readonly CREATEROLE: ZodType = z.object({
        role_name: z.string().trim().min(1),
        is_active: z.boolean(),
        permission: z.array(z.object({
            menu_id: z.number().positive(),
            fcreate: z.boolean(),
            fread: z.boolean(),
            fupdate: z.boolean(),
            fdelete: z.boolean()
        }))
    });

    static readonly UPDATEROLE: ZodType = z.object({
        role_name: z.string().trim().min(1).optional(),
        is_active: z.boolean().optional(),
        permission: z.array(z.object({
            menu_id: z.string().trim().min(1),
            fcreate: z.boolean(),
            fread: z.boolean(),
            fupdate: z.boolean(),
            fdelete: z.boolean()
        }).optional())
    });
}