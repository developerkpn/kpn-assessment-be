import { getQuestionById, getQuestionTranslation } from "@/models/QuestionModel.js";
import {
  autoTranslateQuestion,
  getLanguageByCode,
  getLanguages,
  getLanguagesWithTranslationStatus,
} from "@/models/TranslationModel.js";
import { Request, Response } from "express";

export const handleGetTranslationForLanguage = async (req: Request, res: Response): Promise<any> => {
  const { id: questionId, languageId } = req.params;

  try {
    // Get existing translation only
    const translation = await getQuestionTranslation(questionId, languageId);

    if (!translation) {
      res.status(404).send({
        message: "Translation not found for this language",
      });
      return;
    }

    // Format the translation data similar to main question format
    const answers: any[] = [];
    ["a", "b", "c", "d", "e", "f", "g"].forEach((choice) => {
      const textKey = `answer_choice_${choice}_text`;
      if (translation[textKey]) {
        answers.push({
          text: translation[textKey],
        });
      }
    });

    const formattedResult = {
      id: translation.id,
      question_answer_id: translation.question_answer_id,
      language_id: translation.language_id,
      q_input_text: translation.q_input_text,
      answers: answers,
      created_by: translation.created_by,
      created_date: translation.created_date,
      updated_by: translation.updated_by,
      updated_date: translation.updated_date,
    };

    res.status(200).send({
      message: "Success get question translation",
      data: formattedResult,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleGenerateQuestionTranslation = async (req: Request, res: Response): Promise<any> => {
  const { id: questionId, languageId } = req.params;

  try {
    // Check if translation already exists
    const existingTranslation = await getQuestionTranslation(questionId, languageId);
    if (existingTranslation) {
      res.status(409).send({
        message: "Translation already exists for this language",
      });
      return;
    }

    // Get the main question data for auto-translation
    const mainQuestion = await getQuestionById(questionId);
    if (!mainQuestion) {
      res.status(404).send({
        message: `Question not found with ID: ${questionId}`,
      });
      return;
    }

    // Get the target language info to validate it exists
    const targetLanguage = await getLanguageByCode(languageId);
    if (!targetLanguage) {
      res.status(400).send({
        message: "Invalid target language",
      });
      return;
    }

    // Auto-translate the question using the service
    try {
      const autoTranslatedData = await autoTranslateQuestion(mainQuestion, languageId);

      // Create a preview translation object with auto-translated content
      const translation = {
        id: null, // No ID since it's not saved yet
        question_answer_id: questionId,
        language_id: languageId,
        ...autoTranslatedData,
        created_by: null,
        created_date: null,
        updated_by: null,
        updated_date: null,
      };

      // Format the translation data similar to main question format
      const answers: any[] = [];
      ["a", "b", "c", "d", "e", "f", "g"].forEach((choice) => {
        const textKey = `answer_choice_${choice}_text`;
        if (translation[textKey]) {
          answers.push({
            text: translation[textKey],
          });
        }
      });

      const formattedResult = {
        id: translation.id,
        question_answer_id: translation.question_answer_id,
        language_id: translation.language_id,
        q_input_text: translation.q_input_text,
        answers: answers,
        created_by: translation.created_by,
        created_date: translation.created_date,
        updated_by: translation.updated_by,
        updated_date: translation.updated_date,
        auto_translated: translation.auto_translated || false,
        translation_source: translation.translation_source || null,
        is_preview: translation.is_preview || false,
      };

      res.status(200).send({
        message: "Translation generated successfully (preview only)",
        data: formattedResult,
      });
    } catch (translationError: any) {
      console.error("Auto-translation failed:", translationError);
      res.status(500).send({
        message: "Failed to auto-translate question",
        error: translationError.message,
      });
    }
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleGetLanguages = async (req: Request, res: Response): Promise<any> => {
  try {
    const languages = await getLanguages();

    res.status(200).send({
      message: "Languages retrieved successfully",
      data: languages,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleGetLanguagesWithTranslationStatus = async (
  req: Request<{ questionId: string }>,
  res: Response
): Promise<any> => {
  try {
    const { questionId } = req.params;

    if (!questionId) {
      res.status(400).send({
        message: "Question ID is required",
      });
      return;
    }

    const languages = await getLanguagesWithTranslationStatus(questionId);

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

export const handleLanguageTypeSwitch = async (
  req: Request<{ questionId: string }>,
  res: Response
): Promise<any> => {
  try {
    const { questionId } = req.params;
    const { languageType } = req.query;

    if (!questionId) {
      res.status(400).send({
        message: "Question ID is required",
      });
      return;
    }

    if (!languageType || !["main", "sub"].includes(languageType as string)) {
      res.status(400).send({
        message: "Language type is required and must be 'main' or 'sub'",
      });
      return;
    }

    const languages = await getLanguagesWithTranslationStatus(questionId);

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
        message: `No suitable language found for ${languageType} mode`,
      });
      return;
    }

    // For sub-language mode, also fetch translation data if it exists
    let translationData = null;
    let hasTranslation = false;

    if (languageType === 'sub') {
      try {
        const translation = await getQuestionTranslation(questionId, recommendedLanguage.language_code);
        if (translation) {
          hasTranslation = true;
          // Format the translation data
          const answers: any[] = [];
          ["a", "b", "c", "d", "e", "f", "g"].forEach((choice) => {
            const textKey = `answer_choice_${choice}_text`;
            if (translation[textKey]) {
              answers.push({
                text: translation[textKey],
              });
            }
          });

          translationData = {
            id: translation.id,
            question_answer_id: translation.question_answer_id,
            language_id: translation.language_id,
            q_input_text: translation.q_input_text,
            answers: answers,
            created_by: translation.created_by,
            created_date: translation.created_date,
            updated_by: translation.updated_by,
            updated_date: translation.updated_date,
          };
        }
      } catch (error) {
        // Translation doesn't exist, that's fine
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
