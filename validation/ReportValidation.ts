import { z, ZodType } from "zod";

export class ReportValidation {
  static readonly CREATE: ZodType = z.object({
    batch_id: z.string().uuid(),
    intro: z.array(
      z.object({
        category_id: z.string().uuid(),
        summary_view: z.enum(["BAR", "BELL"], {
          errorMap: () => ({
            message: "Summary View must value either 'BAR' OR 'BELL'",
          }),
        }),
        summary_type: z.enum(["SUMMARY", "DETAIL"], {
          errorMap: () => ({
            message: "Summary Type must value either 'SUMMARY' OR 'DETAIL'",
          }),
        }),
        summary_formula: z.enum(["SUM", "AVG"], {
          errorMap: () => ({
            message: "Summary Formula must value either 'SUM' OR 'AVG'",
          }),
        }),
      })
    ),
    detail: z.array(
      z.object({
        test_id: z.string().uuid(),
        summary_view: z.enum(["BAR", "BELL"], {
          errorMap: () => ({
            message: "Summary View must value either 'BAR' OR 'BELL'",
          }),
        }),
      })
    ),
  });
}
