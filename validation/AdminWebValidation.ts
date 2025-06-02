import { z, ZodType } from "zod";

export class AdminWebValidation {
  static readonly LOGIN: ZodType = z.object({
    username: z.string().trim().min(1, { message: "Username is required. Please enter your username." }),
    password: z.string().trim().min(6, { message: "Password must be at least 6 characters long." }),
  });

  static readonly CREATEADMIN: ZodType = z.object({
    id: z.string().uuid({ message: "Invalid ID format. Please provide a valid UUID." }),
    fullname: z.string().trim().min(1, { message: "Full name is required. Please enter the full name." }),
    username: z.string().trim().min(6, { message: "Username must be at least 6 characters long." }),
    email: z.string().trim().email({ message: "Invalid email format. Please enter a valid email address." }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long." })
      .regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d).+$/, {
        message: "Password must contain at least one uppercase letter, one special character, and one number.",
      }),
    role_id: z.string().uuid({ message: "Invalid role ID. Please provide a valid UUID." }),
  });

  static readonly ID: ZodType = z.string().uuid({
    message: "Invalid ID format. Please provide a valid UUID.",
  });

  static readonly EMAIL: ZodType = z.string().trim().email({
    message: "Invalid email format. Please enter a valid email address.",
  });

  static readonly CREATEROLE: ZodType = z.object({
    role_name: z.string().trim().min(1, { message: "Role name is required. Please provide a valid name." }),
    is_active: z.boolean({
      required_error: "Status (is_active) must be provided as true or false.",
    }),
    permission: z.array(
      z.object({
        menu_id: z.number().positive({ message: "Menu ID must be a positive number." }),
        fcreate: z.boolean({
          required_error: "Create permission (fcreate) must be provided.",
        }),
        fread: z.boolean({
          required_error: "Read permission (fread) must be provided.",
        }),
        fupdate: z.boolean({
          required_error: "Update permission (fupdate) must be provided.",
        }),
        fdelete: z.boolean({
          required_error: "Delete permission (fdelete) must be provided.",
        }),
      })
    ),
  });

  static readonly UPDATEROLE: ZodType = z.object({
    role_name: z.string().trim().min(1, { message: "Role name must not be empty." }).optional(),
    is_active: z.boolean().optional(),
    permission: z
      .array(
        z.object({
          menu_id: z.string().trim().min(1, { message: "Menu ID is required and cannot be empty." }),
          fcreate: z.boolean({
            required_error: "Create permission (fcreate) must be provided.",
          }),
          fread: z.boolean({
            required_error: "Read permission (fread) must be provided.",
          }),
          fupdate: z.boolean({
            required_error: "Update permission (fupdate) must be provided.",
          }),
          fdelete: z.boolean({
            required_error: "Delete permission (fdelete) must be provided.",
          }),
        })
      )
      .optional(),
  });
}
