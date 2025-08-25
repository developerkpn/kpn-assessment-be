import { db } from "@/config/connection.js";

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