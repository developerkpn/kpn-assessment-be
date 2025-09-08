import { NextFunction, Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { SubTestDetailRequest, SubTestHeaderRequest, SubTestRequest } from "@/types/MasterDataTypes.js";
import { Validation } from "@/validation/Validation.js";
import { SeriesValidation } from "@/validation/SeriesValidation.js";
import { SubTestValidation } from "@/validation/SubTestValidation.js";
import {
  createSubTest,
  deleteSeriesFromSubTest,
  deleteSubTest,
  getAvailableSeriesForSubTest,
  getSubTest,
  getSubTestDetail,
  updateSubTest,
  createSubTestTranslation,
  updateSubTestTranslation,
  getSubTestTranslation,
  getLanguagesWithSubTestTranslationStatus,
} from "@/models/SubTestModel.js";
import {
  translateFieldsBatch,
  getLanguageByCode,
  getLanguages,
} from "@/models/TranslationModel.js";
import { SeriesDetailRequest } from "@/types/SeriesTypes.js";

export const handleCreateSubTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedRequest = Validation.validate(SubTestValidation.CREATE, req.body);

    const date = new Date();
    const subtestId = uuid();
    const creator = req.userDecode!.user_id;

    const subtestHeaderRequest: any = {
      id: subtestId,
      subtest_name: validatedRequest.subtest_name,
      subtest_code: validatedRequest.subtest_code,
      is_duration: validatedRequest.is_duration,
      subtest_duration: validatedRequest.subtest_duration,
      intro_desc: validatedRequest.intro_desc,
      subtest_desc: validatedRequest.subtest_desc,
      series_example_id: validatedRequest.series_example_id,
      is_example_answer_shown: validatedRequest.is_example_answer_shown,
      criteria_id: validatedRequest.criteria_id,
      is_criteria: validatedRequest.is_criteria,
      is_mandatory: validatedRequest.is_mandatory,
      language_id: validatedRequest.language_id,
      created_by: creator,
      created_at: date,
    };

    console.log(subtestHeaderRequest);

    const subtestDetailRequest = validatedRequest.series.map((prev: any) => ({
      ...prev,
      id: uuid(),
      subtest_id: subtestId,
      added_by: creator,
      added_at: date,
    }));

    const result = await createSubTest(subtestHeaderRequest, subtestDetailRequest);

    res.status(201).send({
      message: `Sub Test with code ${result} is created successfully!`,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetSubTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getSubTest();
    res.status(200).send({
      message: `Success!`,
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleUpdateSubTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedBy = req.userDecode!.user_id;
    const updatedAt = new Date();

    const subtestId = Validation.validate(SubTestValidation.ID, req.params.id);
    const validatedRequest = Validation.validate(SubTestValidation.UPDATE, req.body);
    console.log(validatedRequest);

    const languageType = validatedRequest.language_type;
    const languageId = validatedRequest.language_id;

    let result;
    let message;

    if (languageType === "sub") {
      // Handle sub language - save to translation table
      const translationPayload = {
        subtest_id: subtestId,
        language_id: languageId,
        intro_desc: validatedRequest.intro_desc,
        subtest_desc: validatedRequest.subtest_desc,
        updated_by: updatedBy,
        updated_date: updatedAt,
        created_by: updatedBy,
        created_date: updatedAt,
      };

      // Check if translation already exists
      const existingTranslation = await getSubTestTranslation(subtestId, languageId);
      if (existingTranslation) {
        // Update existing translation
        result = await updateSubTestTranslation(translationPayload, existingTranslation.id);
        message = "SubTest translation successfully updated";
      } else {
        // Create new translation
        translationPayload.created_by = updatedBy;
        translationPayload.created_date = updatedAt;
        result = await createSubTestTranslation(translationPayload);
        message = "SubTest translation successfully created";
      }
    } else if (languageType === "main") {
      // Handle main language - save to main table
      const updateHead: any = {
        subtest_name: validatedRequest.subtest_name,
        subtest_code: validatedRequest.subtest_code,
        is_duration: validatedRequest.is_duration,
        subtest_duration: validatedRequest.subtest_duration,
        is_active: validatedRequest.is_active,
        updated_by: updatedBy,
        updated_at: updatedAt,
        intro_desc: validatedRequest.intro_desc,
        subtest_desc: validatedRequest.subtest_desc,
        series_example_id: validatedRequest.series_example_id,
        is_example_answer_shown: validatedRequest.is_example_answer_shown,
        criteria_id: validatedRequest.criteria_id,
        is_criteria: validatedRequest.is_criteria,
        is_mandatory: validatedRequest.is_mandatory,
        language_id: languageId,
      };

      const selectedSeries =
        validatedRequest.series && validatedRequest.series.length > 0
          ? validatedRequest.series.map((prev: any) => ({
              ...prev,
              id: uuid(),
              subtest_id: subtestId,
              added_by: updatedBy,
              added_at: updatedAt,
            }))
          : [];

      result = await updateSubTest(subtestId, updateHead, selectedSeries);
      message = "Sub Test successfully updated";
    } else {
      // For compatibility with old requests without language_type
      const updateHead: any = {
        subtest_name: validatedRequest.subtest_name,
        subtest_code: validatedRequest.subtest_code,
        is_duration: validatedRequest.is_duration,
        subtest_duration: validatedRequest.subtest_duration,
        is_active: validatedRequest.is_active,
        updated_by: updatedBy,
        updated_at: updatedAt,
        intro_desc: validatedRequest.intro_desc,
        subtest_desc: validatedRequest.subtest_desc,
        series_example_id: validatedRequest.series_example_id,
        is_example_answer_shown: validatedRequest.is_example_answer_shown,
        criteria_id: validatedRequest.criteria_id,
        is_criteria: validatedRequest.is_criteria,
        is_mandatory: validatedRequest.is_mandatory,
      };

      const selectedSeries =
        validatedRequest.series && validatedRequest.series.length > 0
          ? validatedRequest.series.map((prev: any) => ({
              ...prev,
              id: uuid(),
              subtest_id: subtestId,
              added_by: updatedBy,
              added_at: updatedAt,
            }))
          : [];

      result = await updateSubTest(subtestId, updateHead, selectedSeries);
      message = "Sub Test successfully updated";
    }

    res.status(200).send({
      message: message,
    });
  } catch (e) {
    next(e);
  }
};

export const handleDeleteSubTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(SubTestValidation.ID, req.params.id);

    const result = await deleteSubTest(validatedId);

    res.status(200).send({
      message: `Sub Test with code ${result} is deleted successfully!`,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetSubTestDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(SubTestValidation.ID, req.params.id);
    const result = await getSubTestDetail(validatedId);
    res.status(200).send({
      message: "Success!",
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetAvailableSeriesForSubTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(SubTestValidation.ID, req.params.id);
    const result = await getAvailableSeriesForSubTest(validatedId);

    res.status(200).send({
      message: "Success!",
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleDeleteSeriesFromSubTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedSubtestId = Validation.validate(SubTestValidation.ID, req.params.id);
    const validatedDetailId = Validation.validate(SubTestValidation.ID, req.params.detailId);
    const updatedBy = req.userDecode!.user_id;
    const updatedAt = new Date();

    const updatePayload = {
      updated_by: updatedBy,
      updated_at: updatedAt,
    };

    await deleteSeriesFromSubTest(validatedSubtestId, validatedDetailId, updatePayload);

    res.status(200).send({
      message: "Success delete Series from Sub Test!",
    });
  } catch (e) {
    next(e);
  }
};

export const handleGenerateSubTestTranslation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: subtestId, languageId } = req.params;
    const { fields } = req.body; // Array of field names to translate
    
    // Get the main subtest data for auto-translation
    const mainSubTest = await getSubTestDetail(subtestId);
    if (!mainSubTest) {
      res.status(404).send({
        message: "SubTest not found",
      });
      return;
    }

    // Prepare fields for batch translation using generic service
    const sourceLanguageCode = mainSubTest.language_id || 'en'; // fallback to English if not set
    
    // Build fieldsToTranslate based on requested fields, or all fields if none specified
    const requestedFields = fields && fields.length > 0 ? fields : ['intro_desc', 'subtest_desc'];
    const fieldsToTranslate: Record<string, string> = {};
    
    requestedFields.forEach((field: string) => {
      if (field === 'intro_desc') {
        fieldsToTranslate.intro_desc = mainSubTest.intro_desc || "";
      } else if (field === 'subtest_desc') {
        fieldsToTranslate.subtest_desc = mainSubTest.subtest_desc || "";
      }
    });

    // Use generic batch translation service
    const translatedFields = await translateFieldsBatch(
      fieldsToTranslate,
      sourceLanguageCode,
      languageId
    );

    // Create a preview translation object with auto-translated content (only requested fields)
    const translation: any = {
      id: null, // No ID since it's not saved yet
      subtest_id: subtestId,
      language_id: languageId,
      created_by: null,
      created_date: null,
      updated_by: null,
      updated_date: null,
      auto_translated: true,
      translation_source: "google_translate",
      is_preview: true,
    };

    // Only include the fields that were requested and translated
    requestedFields.forEach((field: string) => {
      if (translatedFields[field] !== undefined) {
        translation[field] = translatedFields[field];
      }
    });

    res.status(200).send({
      message: `SubTest translation generated successfully for: ${requestedFields.join(', ')}`,
      data: translation,
    });
  } catch (error: any) {
    console.error("SubTest translation generation failed:", error);
    res.status(500).send({
      message: "Failed to auto-translate subtest",
      error: error.message,
    });
  }
};

export const handleSubTestLanguageTypeSwitch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subtestId } = req.params;
    const { languageType } = req.query;

    if (!languageType || (languageType !== 'main' && languageType !== 'sub')) {
      res.status(400).send({
        message: "Invalid languageType. Must be 'main' or 'sub'",
      });
      return;
    }

    // Get all languages with translation status for this subtest
    const languages = await getLanguagesWithSubTestTranslationStatus(subtestId);
    if (!languages || languages.length === 0) {
      res.status(404).send({
        message: "No languages found",
      });
      return;
    }

    let recommendedLanguage;
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

    // For sub-language mode, also fetch translation data if it exists
    let translationData = null;
    let hasTranslation = false;
    if (languageType === 'sub') {
      try {
        const translation = await getSubTestTranslation(subtestId, recommendedLanguage.language_code);
        if (translation) {
          hasTranslation = true;
          translationData = {
            id: translation.id,
            subtest_id: translation.subtest_id,
            language_id: translation.language_id,
            intro_desc: translation.intro_desc,
            subtest_desc: translation.subtest_desc,
            created_by: translation.created_by,
            created_date: translation.created_date,
            updated_by: translation.updated_by,
            updated_date: translation.updated_date,
          };
        }
      } catch (error) {
        console.error("Error fetching translation:", error);
        // Translation doesn't exist, hasTranslation remains false
      }
    }

    res.status(200).send({
      message: "Success get language selection for subtest",
      data: {
        language_code: recommendedLanguage.language_code,
        language_name: recommendedLanguage.language_name,
        translation_status: recommendedLanguage.translation_status,
        has_translation: hasTranslation,
        translation_data: translationData,
      },
    });
  } catch (error: any) {
    console.error("Language type switch error:", error);
    res.status(500).send({
      message: "Failed to switch language type",
      error: error.message,
    });
  }
};

export const handleGetSubTestTranslationForLanguage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: subtestId, languageId } = req.params;
    
    // Get existing translation only
    const translation = await getSubTestTranslation(subtestId, languageId);
    if (!translation) {
      res.status(404).send({
        message: "Translation not found for this language",
      });
      return;
    }

    // Format the translation data
    const formattedResult = {
      id: translation.id,
      subtest_id: translation.subtest_id,
      language_id: translation.language_id,
      intro_desc: translation.intro_desc,
      subtest_desc: translation.subtest_desc,
      created_by: translation.created_by,
      created_date: translation.created_date,
      updated_by: translation.updated_by,
      updated_date: translation.updated_date,
    };

    res.status(200).send({
      message: "Success get subtest translation",
      data: formattedResult,
    });
  } catch (error: any) {
    console.error("Get subtest translation error:", error);
    res.status(500).send({
      message: "Failed to get subtest translation",
      error: error.message,
    });
  }
};

export const handleGetLanguagesWithSubTestTranslationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: subtestId } = req.params;
    const languages = await getLanguagesWithSubTestTranslationStatus(subtestId);
    
    res.status(200).send({
      message: "Success get languages with subtest translation status",
      data: languages,
    });
  } catch (error: any) {
    console.error("Get languages with translation status error:", error);
    res.status(500).send({
      message: "Failed to get languages with translation status",
      error: error.message,
    });
  }
};
