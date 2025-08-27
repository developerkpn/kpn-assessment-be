import { db } from "@/config/connection.js";
import translate from "google-translate-api-x";

export const getLanguages = async () => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `SELECT
        id,
        language_code,
        language_name,
        language_name_native,
        is_active
      FROM mst_language
      WHERE is_active = true
      ORDER BY language_name`
    );
    return result.rows;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const getLanguagesWithTranslationStatus = async (questionId: string) => {
  const client = await db.connect();
  try {
    // Get all active languages and check which ones have translations for this question
    const result = await client.query(
      `SELECT
        ml.id,
        ml.language_code,
        ml.language_name,
        ml.language_name_native,
        ml.is_active,
        qa.language_id as main_language_code,
        CASE
          WHEN qa.language_id = ml.language_code THEN 'main'
          WHEN qat.language_id IS NOT NULL THEN 'translation_exists'
          ELSE 'translation_available'
        END as translation_status
      FROM mst_language ml
      LEFT JOIN mst_question_answer qa ON qa.id = $1
      LEFT JOIN mst_question_answer_translations qat ON qat.question_answer_id = $1
        AND qat.language_id = ml.language_code
      WHERE ml.is_active = true
      ORDER BY ml.language_name`,
      [questionId]
    );
    return result.rows;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const getLanguageById = async (languageId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `SELECT
        id,
        language_code,
        language_name,
        language_name_native,
        is_active
      FROM mst_language
      WHERE id = $1 AND is_active = true`,
      [languageId]
    );
    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const getLanguageByCode = async (languageCode: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `SELECT
        id,
        language_code,
        language_name,
        language_name_native,
        is_active
      FROM mst_language
      WHERE language_code = $1 AND is_active = true`,
      [languageCode]
    );
    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const autoTranslateQuestion = async (mainQuestion: any, targetLanguageCode: string) => {
  try {
    const sourceLanguageCode = mainQuestion.language_id;

    // Auto-translate the question text
    const translatedQuestionText = await translate(mainQuestion.q_input_text || "", {
      from: sourceLanguageCode,
      to: targetLanguageCode,
    });

    // Translate answer texts
    const translatedAnswers: any = {};
    const answerLetters = ["a", "b", "c", "d", "e", "f", "g"];

    for (const letter of answerLetters) {
      const answerTextKey = `answer_choice_${letter}_text`;
      const answerText = mainQuestion[answerTextKey];

      if (answerText) {
        const translatedAnswer = await translate(answerText, {
          from: sourceLanguageCode,
          to: targetLanguageCode,
        });
        translatedAnswers[answerTextKey] = (translatedAnswer as any).text;
      } else {
        translatedAnswers[answerTextKey] = null;
      }
    }

    return {
      q_input_text: (translatedQuestionText as any).text,
      ...translatedAnswers,
      auto_translated: true,
      translation_source: "google_translate",
      is_preview: true,
    };
  } catch (error: any) {
    console.error("Auto-translation failed:", error);
    throw new Error(`Translation failed: ${error.message}`);
  }
};
