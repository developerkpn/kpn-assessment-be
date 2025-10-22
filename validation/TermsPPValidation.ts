import { z, ZodType } from "zod";

// Enums for validation
export const TermsTypeEnum = z.enum(["terms", "pp"], {
  errorMap: () => ({ message: "Type must be 'terms' or 'pp'" }),
});

export const LanguageTypeEnum = z.enum(["main", "sub"], {
  errorMap: () => ({ message: "Language type must be 'main' or 'sub'" }),
});

export const LanguageIdSchema = z.string().min(1, "Language ID is required").max(2, "Language ID format is wrong");

export class TermsPPValidation {
  static readonly UPDATE_BASE = z
    .object({
      name: z.string().trim().min(1, "Name is required"),
      updated_by: z.string().trim().min(1, "Updated by is required"),
      updated_date: z.date(),
    })
    .strict();

  static readonly UPDATE_WITH_TRANSLATION = z
    .object({
      name: z.string().trim().min(1, "Name is required"),
      updated_by: z.string().trim().min(1, "Updated by is required"),
      updated_date: z.date(),
      language_id: LanguageIdSchema,
      language_type: LanguageTypeEnum,
    })
    .strict();

  static readonly UPDATETERMS = TermsPPValidation.UPDATE_BASE;
  static readonly UPDATEPP = TermsPPValidation.UPDATE_BASE;

  static readonly UPDATETERMS_WITH_TRANSLATION = TermsPPValidation.UPDATE_WITH_TRANSLATION;
  static readonly UPDATEPP_WITH_TRANSLATION = TermsPPValidation.UPDATE_WITH_TRANSLATION;

  static readonly TRANSLATION_PARAMS = z
    .object({
      type: TermsTypeEnum,
      languageId: LanguageIdSchema,
    })
    .strict();

  static readonly LANGUAGE_SELECTION_PARAMS = z
    .object({
      type: TermsTypeEnum,
      languageType: LanguageTypeEnum,
    })
    .strict();

  static readonly UPDATESB: ZodType = z
    .object({
      short_brief_name: z.string().trim().min(1, "Short brief name is required"),
      updated_by: z.string().trim().min(1, "Updated by is required"),
      updated_date: z.date(),
    })
    .strict();
}
