import { z, ZodType } from "zod";

export class MenuValidation {
  static readonly ID: ZodType = z.string().uuid();
}
