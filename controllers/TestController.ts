import { NextFunction, Request, Response } from "express";
import { Validation } from "@/validation/Validation.js";
import { TestValidation } from "@/validation/TestValidation.js";
import { v4 as uuid } from "uuid";
import { TestDetailRequest, TestHeaderRequest } from "@/types/MasterDataTypes.js";
import {
  createTest,
  deleteSubTestFromTest,
  deleteTest,
  getAvailableSubTestForTest,
  getTest,
  getTestDetail,
  updateTest,
  createTestTranslation,
  updateTestTranslation,
  getTestTranslation,
  getLanguagesWithTestTranslationStatus,
} from "@/models/TestModel.js";
import {
  translateFieldsBatch,
  getLanguageByCode,
  getLanguages,
} from "@/models/TranslationModel.js";

export const handleCreateTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedRequest = Validation.validate(TestValidation.CREATE, req.body);

    const date = new Date();
    const testId = uuid();
    const creator = req.userDecode!.user_id;

    const testHeaderRequest: any = {
      id: testId,
      test_name: validatedRequest.test_name,
      test_code: validatedRequest.test_code,
      category_id: validatedRequest.category_id,
      description: validatedRequest.description,
      intro_desc: validatedRequest.intro_desc,
      language_id: validatedRequest.language_id,
      created_by: creator,
      created_at: date,
    };

    const testDetailRequest = validatedRequest.subtests.map((prev: TestDetailRequest) => ({
      ...prev,
      id: uuid(),
      test_id: testId,
      added_by: creator,
      added_at: date,
    }));

    console.log(testHeaderRequest);

    console.log(testDetailRequest);

    const result = await createTest(testHeaderRequest, testDetailRequest);

    res.status(201).send({
      message: `Test with code ${result} is created successfully!`,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getTest();
    res.status(200).send({
      message: `Success!`,
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleUpdateTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedBy = req.userDecode!.user_id;
    const updatedAt = new Date();

    const validatedId = Validation.validate(TestValidation.ID, req.params.id);
    const validatedRequest = Validation.validate(TestValidation.UPDATE, req.body);

    const languageType = validatedRequest.language_type;
    const languageId = validatedRequest.language_id;

    let result;
    let message;

    if (languageType === "sub") {
      // Handle sub language - save to translation table
      const translationPayload = {
        test_id: validatedId,
        language_id: languageId,
        intro_desc: validatedRequest.intro_desc,
        updated_by: updatedBy,
        updated_date: updatedAt,
        created_by: updatedBy,
        created_date: updatedAt,
      };

      // Check if translation already exists
      const existingTranslation = await getTestTranslation(validatedId, languageId);
      if (existingTranslation) {
        // Update existing translation
        result = await updateTestTranslation(translationPayload, existingTranslation.id);
        message = "Test translation successfully updated";
      } else {
        // Create new translation
        translationPayload.created_by = updatedBy;
        translationPayload.created_date = updatedAt;
        result = await createTestTranslation(translationPayload);
        message = "Test translation successfully created";
      }
    } else if (languageType === "main") {
      // Handle main language - save to main table
      const testHeaderUpdateRequest: any = {
        test_name: validatedRequest.test_name,
        test_code: validatedRequest.test_code,
        category_id: validatedRequest.category_id,
        description: validatedRequest.description,
        intro_desc: validatedRequest.intro_desc,
        is_active: validatedRequest.is_active,
        language_id: languageId,
        updated_by: updatedBy,
        updated_at: updatedAt,
      };

      const testDetailRequest =
        validatedRequest.subtests && validatedRequest.subtests.length > 0
          ? validatedRequest.subtests.map((prev: TestDetailRequest) => ({
              ...prev,
              id: uuid(),
              test_id: validatedId,
              added_by: updatedBy,
              added_at: updatedAt,
            }))
          : [];

      result = await updateTest(validatedId, testHeaderUpdateRequest, testDetailRequest);
      message = "Test successfully updated";
    } else {
      // For compatibility with old requests without language_type
      const testHeaderUpdateRequest: any = {
        ...validatedRequest,
        updated_by: updatedBy,
        updated_at: updatedAt,
      };

      delete testHeaderUpdateRequest.subtests;

      const testDetailRequest =
        validatedRequest.subtests && validatedRequest.subtests.length > 0
          ? validatedRequest.subtests.map((prev: TestDetailRequest) => ({
              ...prev,
              id: uuid(),
              test_id: validatedId,
              added_by: updatedBy,
              added_at: updatedAt,
            }))
          : [];

      result = await updateTest(validatedId, testHeaderUpdateRequest, testDetailRequest);
      message = "Test successfully updated";
    }

    res.status(200).send({
      message: message,
    });
  } catch (e) {
    next(e);
  }
};

export const handleDeleteTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(TestValidation.ID, req.params.id);

    const result = await deleteTest(validatedId);
    console.log(result);
    res.status(200).send({
      message: `Test with code ${result} is deleted successfully!`,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetTestDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(TestValidation.ID, req.params.id);
    const result = await getTestDetail(validatedId);
    res.status(200).send({
      message: "Success!",
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetAvailableSubTestForTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(TestValidation.ID, req.params.id);
    const result = await getAvailableSubTestForTest(validatedId);

    res.status(200).send({
      message: "Success!",
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleDeleteSubTestFromTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedTestId = Validation.validate(TestValidation.ID, req.params.id);
    const validatedDetailId = Validation.validate(TestValidation.ID, req.params.detailId);

    const updatePayload = {
      updated_by: req.userDecode!.user_id,
      updated_at: new Date(),
    };

    await deleteSubTestFromTest(validatedTestId, validatedDetailId, updatePayload);

    res.status(200).send({
      message: "Success delete Sub Test from Test!",
    });
  } catch (e) {
    next(e);
  }
};

export const handleGenerateTestTranslation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: testId, languageId } = req.params;
    const { fields } = req.body; // Array of field names to translate

    // Get the main test data for auto-translation
    const mainTest = await getTestDetail(testId);
    if (!mainTest) {
      res.status(404).send({
        message: "Test not found",
      });
      return;
    }

    // Prepare fields for batch translation using generic service
    const sourceLanguageCode = mainTest.language_id || 'en'; // fallback to English if not set

    // Build fieldsToTranslate based on requested fields, or all fields if none specified
    const requestedFields = fields && fields.length > 0 ? fields : ['intro_desc'];
    const fieldsToTranslate: Record<string, string> = {};

    requestedFields.forEach((field: string) => {
      if (field === 'intro_desc') {
        fieldsToTranslate.intro_desc = mainTest.intro_desc || "";
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
      test_id: testId,
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
      message: `Test translation generated successfully for: ${requestedFields.join(', ')}`,
      data: translation,
    });
  } catch (error: any) {
    console.error("Test translation generation failed:", error);
    res.status(500).send({
      message: "Failed to auto-translate test",
      error: error.message,
    });
  }
};

export const handleTestLanguageTypeSwitch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { testId } = req.params;
    const { languageType } = req.query;

    if (!languageType || (languageType !== 'main' && languageType !== 'sub')) {
      res.status(400).send({
        message: "Invalid languageType. Must be 'main' or 'sub'",
      });
      return;
    }

    // Get all languages with translation status for this test
    const languages = await getLanguagesWithTestTranslationStatus(testId);
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
        const translation = await getTestTranslation(testId, recommendedLanguage.language_code);
        if (translation) {
          hasTranslation = true;
          translationData = {
            id: translation.id,
            test_id: translation.test_id,
            language_id: translation.language_id,
            intro_desc: translation.intro_desc,
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
      message: "Success get language selection for test",
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

export const handleGetTestTranslationForLanguage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: testId, languageId } = req.params;

    // Get existing translation(s)
    const translations = await getTestTranslation(testId, languageId);

    if (!translations || (Array.isArray(translations) && translations.length === 0)) {
      res.status(404).send({
        message: languageId
          ? "Translation not found for this language"
          : "No translations found for this test",
      });
      return;
    }

    // Format the translation data
    let formattedResult: any;

    if (languageId) {
      // Single translation - return as object
      formattedResult = {
        id: translations.id,
        test_id: translations.test_id,
        language_id: translations.language_id,
        intro_desc: translations.intro_desc,
        created_by: translations.created_by,
        created_date: translations.created_date,
        updated_by: translations.updated_by,
        updated_date: translations.updated_date,
      };
    } else {
      // Multiple translations - return as key-value pair object where key is language_id
      formattedResult = {};
      translations.forEach((translation: any) => {
        formattedResult[translation.language_id] = {
          id: translation.id,
          test_id: translation.test_id,
          language_id: translation.language_id,
          intro_desc: translation.intro_desc,
          created_by: translation.created_by,
          created_date: translation.created_date,
          updated_by: translation.updated_by,
          updated_date: translation.updated_date,
        };
      });
    }

    res.status(200).send({
      message: languageId
        ? "Success get test translation"
        : "Success get all test translations",
      data: formattedResult,
    });
  } catch (error: any) {
    console.error("Get test translation error:", error);
    res.status(500).send({
      message: "Failed to get test translation",
      error: error.message,
    });
  }
};

export const handleGetLanguagesWithTestTranslationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: testId } = req.params;
    const languages = await getLanguagesWithTestTranslationStatus(testId);

    res.status(200).send({
      message: "Success get languages with test translation status",
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
