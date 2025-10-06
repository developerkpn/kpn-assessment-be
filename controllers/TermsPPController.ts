import { BRIEF_ID, PP_ID, TERMS_ID } from "@/constant.js";
import {
  createTermsPPTranslation,
  getLanguagesWithTermsPPTranslationStatus,
  getShortBrief,
  getTermsPP,
  getTermsPPTranslation,
  updateShortBrief,
  updateTermsPP,
  updateTermsPPTranslation,
} from "@/models/TermsPPModel.js";
import { getLanguageByCode, translateFieldsBatch } from "@/models/TranslationModel.js";
import { BriefRequest, TermsType } from "@/types/MasterDataTypes.js";
import { TermsPPValidation, TermsTypeEnum } from "@/validation/TermsPPValidation.js";
import { Validation } from "@/validation/Validation.js";
import { NextFunction, Request, Response } from "express";
import { v4 as uuid } from "uuid";

export const handleGetTermsPP = async (_req: Request, res: Response, next: NextFunction) => {
  let data = { terms: "", pp: "" };

  try {
    let result = await getTermsPP();
    result.forEach((row: any) => {
      if (row.id === TERMS_ID) {
        data.terms = row;
      }
      if (row.id === PP_ID) {
        data.pp = row;
      }
    });
    res.status(200).send({
      message: `Success get terms & PP`,
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

export const handleUpdateTerms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    const payload = { ...req.body, updated_date: today };

    // Validate the request using schema
    const validatedRequest = Validation.validate(TermsPPValidation.UPDATETERMS_WITH_TRANSLATION, payload);

    // Check if this is a translation update
    if (validatedRequest.language_id && validatedRequest.language_type === "sub") {
      // Check if translation exists
      const existingTranslation = await getTermsPPTranslation("terms", validatedRequest.language_id);

      let result;
      if (existingTranslation) {
        // Update existing translation
        result = await updateTermsPPTranslation(
          {
            name: validatedRequest.name,
            updated_by: validatedRequest.updated_by,
            updated_date: validatedRequest.updated_date,
          },
          "terms",
          validatedRequest.language_id
        );
      } else {
        // Create new translation
        result = await createTermsPPTranslation({
          id: uuid(),
          name: validatedRequest.name,
          type_dt: "terms",
          language_type: "sub",
          language_id: validatedRequest.language_id,
          created_by: validatedRequest.updated_by,
          created_date: validatedRequest.updated_date,
        });
      }

      res.status(200).send({
        message: `Success ${existingTranslation ? "update" : "create"} terms translation`,
        id: result,
      });
      return;
    }

    // Handle main language update (existing logic) - use base validation for main updates
    const mainPayload = Validation.validate(TermsPPValidation.UPDATETERMS, {
      name: validatedRequest.name,
      updated_by: validatedRequest.updated_by,
      updated_date: validatedRequest.updated_date,
    });

    let result = await updateTermsPP(mainPayload, TERMS_ID);
    res.status(200).send({
      message: `Success update terms`,
      id: result,
    });
  } catch (error) {
    next(error);
  }
};

export const handleUpdatePP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    const payload = { ...req.body, updated_date: today };

    // Validate the request using schema
    const validatedRequest = Validation.validate(TermsPPValidation.UPDATEPP_WITH_TRANSLATION, payload);

    // Check if this is a translation update
    if (validatedRequest.language_id && validatedRequest.language_type === "sub") {
      // Check if translation exists
      const existingTranslation = await getTermsPPTranslation("pp", validatedRequest.language_id);

      let result;
      if (existingTranslation) {
        // Update existing translation
        result = await updateTermsPPTranslation(
          {
            name: validatedRequest.name,
            updated_by: validatedRequest.updated_by,
            updated_date: validatedRequest.updated_date,
          },
          "pp",
          validatedRequest.language_id
        );
      } else {
        // Create new translation
        result = await createTermsPPTranslation({
          id: uuid(),
          name: validatedRequest.name,
          type_dt: "pp",
          language_type: "sub",
          language_id: validatedRequest.language_id,
          created_by: validatedRequest.updated_by,
          created_date: validatedRequest.updated_date,
        });
      }

      res.status(200).send({
        message: `Success ${existingTranslation ? "update" : "create"} privacy policy translation`,
        id: result,
      });
      return;
    }

    // Handle main language update (existing logic) - use base validation for main updates
    const mainPayload = Validation.validate(TermsPPValidation.UPDATEPP, {
      name: validatedRequest.name,
      updated_by: validatedRequest.updated_by,
      updated_date: validatedRequest.updated_date,
    });

    let result = await updateTermsPP(mainPayload, PP_ID);
    res.status(200).send({
      message: `Success update privacy policy`,
      id: result,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetBrief = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let result = await getShortBrief();
    res.status(200).send({
      message: `Success get short brief`,
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const handleUpdateBrief = async (req: Request, res: Response, next: NextFunction) => {
  const today = new Date();
  const payload: BriefRequest = {
    short_brief_name: req.body.short_brief_name,
    updated_by: req.body.updated_by,
    updated_date: today,
  };
  try {
    const validatedRequest = Validation.validate(TermsPPValidation.UPDATESB, payload);
    let result = await updateShortBrief(validatedRequest, BRIEF_ID);
    res.status(200).send({
      message: `Brief updated succesfully`,
      id: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const handleGetLanguagesWithTermsPPTranslationStatus = async (
  req: Request<{ type: string }>,
  res: Response
): Promise<any> => {
  try {
    // Validate type parameter using schema
    const validatedType = TermsTypeEnum.parse(req.params.type);

    const languages = await getLanguagesWithTermsPPTranslationStatus(validatedType);

    res.status(200).send({
      message: "Languages with translation status retrieved successfully",
      data: languages,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleGetTermsPPTranslationForLanguage = async (
  req: Request<{ type: string; languageId?: string }>,
  res: Response
): Promise<any> => {
  try {
    const { type } = req.params;
    const { languageId } = req.params;

    // Validate type
    const validatedType = TermsTypeEnum.parse(type);

    // Get existing translation(s)
    const translations = await getTermsPPTranslation(validatedType, languageId);

    if (!translations || (Array.isArray(translations) && translations.length === 0)) {
      res.status(404).send({
        message: languageId
          ? "Translation not found for this language"
          : "No translations found for this type",
      });
      return;
    }

    // Format the translation data
    let formattedResult: any;

    if (languageId) {
      // Single translation - return as object
      formattedResult = translations;
    } else {
      // Multiple translations - return as key-value pair object where key is language_id
      formattedResult = {};
      translations.forEach((translation: any) => {
        formattedResult[translation.language_id] = {
          ...translation,
          is_fallback: translation.is_fallback || false,
          fallback_source: translation.fallback_source || null,
        };
      });
    }

    res.status(200).send({
      message: languageId
        ? "Success get termsPP translation"
        : "Success get all termsPP translations",
      data: formattedResult,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleGenerateTermsPPTranslation = async (
  req: Request<{ type: "main" | "sub"; languageId: string }>,
  res: Response
): Promise<any> => {
  try {
    // Validate parameters using schema
    const { type, languageId } = Validation.validate(TermsPPValidation.TRANSLATION_PARAMS, req.params);

    const targetLanguageData = await getLanguageByCode(languageId);
    if (!targetLanguageData) {
      res.status(400).send({
        message: `Invalid target language: ${languageId}`,
      });
      return;
    }

    const mainData = await getTermsPPTranslation(type as "terms" | "pp");
    if (!mainData) {
      res.status(404).send({
        message: `Main ${type} not found`,
      });
      return;
    }

    let existingTranslation = null;

    existingTranslation = await getTermsPPTranslation(type as "terms" | "pp", languageId);

    const fieldsToTranslate = {
      name: mainData.name,
    };

    const translatedFields = await translateFieldsBatch(fieldsToTranslate, mainData.language_id, languageId);

    const date = new Date();
    const creator = req.userDecode!.user_id;

    let result;
    if (existingTranslation) {
      result = await updateTermsPPTranslation(
        {
          name: translatedFields.name,
          updated_by: creator,
          updated_date: date,
        },
        type,
        languageId
      );
    } else {
      result = await createTermsPPTranslation({
        id: uuid(),
        name: translatedFields.name,
        type_dt: type,
        language_type: "sub",
        language_id: languageId,
        created_by: creator,
        created_date: date,
      });
    }

    res.status(200).send({
      message: `Translation generated successfully for ${type}`,
      data: {
        id: result,
        translated_fields: translatedFields,
      },
    });
  } catch (error: any) {
    console.error("Translation generation error:", error);
    res.status(500).send({
      message: "Translation generation failed",
      error: error.message,
    });
  }
};

export const handleTermsPPLanguageTypeSwitch = async (
  req: Request<{ type: string }, unknown, unknown, { languageType: string }>,
  res: Response
): Promise<any> => {
  try {
    // Validate parameters using schema
    const { type, languageType } = Validation.validate(TermsPPValidation.LANGUAGE_SELECTION_PARAMS, {
      type: req.params.type,
      languageType: req.query.languageType,
    });

    const languages = await getLanguagesWithTermsPPTranslationStatus(type as "terms" | "pp");
    if (!languages.length) {
      res.status(404).send({
        message: "No languages found",
      });
      return;
    }

    let recommendedLanguage = null;
    if (languageType === "main") {
      // For main language, return the main language
      recommendedLanguage = languages.find((lang: any) => lang.translation_status === "main");
    } else {
      // For sub language, just get the first available language (excluding main)
      recommendedLanguage = languages.find((lang: any) => lang.translation_status !== "main");
    }

    if (!recommendedLanguage) {
      res.status(404).send({
        message: `No ${languageType} language found`,
      });
      return;
    }

    // Check if translation exists for this language
    let hasTranslation = false;
    let translationData = null;

    if (
      recommendedLanguage.translation_status === "translation_exists" ||
      recommendedLanguage.translation_status === "main"
    ) {
      try {
        const translation = await getTermsPPTranslation(type as "terms" | "pp", recommendedLanguage.language_code);
        if (translation) {
          hasTranslation = true;
          translationData = translation;
        }
      } catch (error) {
        hasTranslation = false;
      }
    }

    res.status(200).send({
      message: `Recommended language for ${languageType} mode retrieved successfully`,
      data: {
        language_code: recommendedLanguage.language_code,
        language_name: recommendedLanguage.language_name,
        translation_status: recommendedLanguage.translation_status,
        has_translation: hasTranslation,
        translation_data: translationData,
      },
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};
