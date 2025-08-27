import { getQuestionById, getQuestionTranslation } from "@/models/QuestionModel.js";
import {
  autoTranslateQuestion,
  getLanguageByCode,
  getLanguages,
  getLanguagesWithTranslationStatus,
} from "@/models/TranslationModel.js";
import { Request, Response } from "express";

export const handleGetQuestionTranslation = async (req: Request, res: Response): Promise<any> => {
  const { id: questionId, languageId } = req.params;

  try {
    // First, try to get existing translation
    let translation = await getQuestionTranslation(questionId, languageId);

    if (!translation) {
      // If no translation exists, get the main question data and auto-translate
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

        // Create a temporary translation object with auto-translated content
        // This will be sent to frontend but not saved to database
        translation = {
          id: null, // No ID since it's not saved yet
          question_answer_id: questionId,
          language_id: languageId,
          ...autoTranslatedData,
          created_by: null,
          created_date: null,
          updated_by: null,
          updated_date: null,
        };
      } catch (translationError: any) {
        console.error("Auto-translation failed:", translationError);
        res.status(500).send({
          message: "Failed to auto-translate question",
          error: translationError.message,
        });
        return;
      }
    } else {
      // If translation exists, add flags to indicate it's from database
      translation.auto_translated = false;
      translation.translation_source = "database";
      translation.is_preview = false;
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
      auto_translated: translation.auto_translated || false,
      translation_source: translation.translation_source || null,
      is_preview: translation.is_preview || false,
    };

    res.status(200).send({
      message: `Success get question translation${translation.auto_translated ? " (auto-translated preview)" : ""}`,
      data: formattedResult,
    });
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
