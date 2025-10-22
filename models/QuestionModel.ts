import { db } from "@/config/connection.js";
import { TRANSACTION as TRANS } from "@/config/transaction.js";
import { deleteQuery, insertQuery, updateQuery } from "@/helper/queryBuilder.js";
import { BURequest, QuestionRequest } from "@/types/MasterDataTypes.js";

export const createQuestion = async (payload: QuestionRequest) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [q, v] = insertQuery("mst_question_answer", payload, "id");
    const result = await client.query(q, v);
    await client.query(TRANS.COMMIT);
    return result.rows[0].id;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const updateQuestion = async (payload: QuestionRequest, id: string) => {
  const client = await db.connect();
  try {
    console.log("cek model payload", payload);
    await client.query(TRANS.BEGIN);
    const [q, v] = updateQuery("mst_question_answer", payload, { id: id }, "id");
    const result = await client.query(q, v);
    await client.query(TRANS.COMMIT);
    console.log("berhenti");
    return result.rows[0].id;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const getQuestion = async (categoryId?: number) => {
  const client = await db.connect();
  try {
    console.log("say hello 1");
    let query = `
      SELECT
        q.*, a.fullname AS created_by, c.category_name
      FROM mst_question_answer q
      LEFT JOIN mst_admin_web a ON q.created_by = a.id
      LEFT JOIN mst_category c ON q.category_id = c.id
    `;
    console.log("say hello 2");
    const values: any[] = [];

    // Jika categoryId ada, tambahkan kondisi WHERE
    if (categoryId) {
      query += ` WHERE q.category_id = $1`;
      values.push(categoryId);
    }

    query += ` ORDER BY q.created_date DESC`;

    const result = await client.query(query, values);

    return result.rows;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const getQuestionById = async (id: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
      SELECT
        q.*, a.fullname AS created_by, c.id, c.category_name, c.category_code
      FROM mst_question_answer q
      JOIN mst_admin_web a ON q.created_by = a.id
      LEFT JOIN mst_category c ON q.category_id = c.id
      WHERE q.id = $1
    `,
      [id]
    );

    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const createQuestionTranslation = async (payload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [q, v] = insertQuery("mst_question_answer_translations", payload, "id");
    const result = await client.query(q, v);
    await client.query(TRANS.COMMIT);
    return result.rows[0].id;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const updateQuestionTranslation = async (payload: any, translationId: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [q, v] = updateQuery("mst_question_answer_translations", payload, { id: translationId }, "id");
    const result = await client.query(q, v);
    await client.query(TRANS.COMMIT);
    return result.rows[0].id;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const getQuestionTranslation = async (questionId: string, languageId?: string) => {
  const client = await db.connect();
  try {
    let result;
    if (languageId) {
      // Get specific translation for a language
      result = await client.query(
        `SELECT * FROM mst_question_answer_translations
         WHERE question_answer_id = $1 AND language_id = $2`,
        [questionId, languageId]
      );
      return result.rows[0];
    } else {
      // Get all translations for the question
      result = await client.query(
        `SELECT * FROM mst_question_answer_translations
         WHERE question_answer_id = $1`,
        [questionId]
      );

      // Get all active languages
      const allLanguagesResult = await client.query(`SELECT language_code FROM mst_language WHERE is_active = true`);

      // Get question main data for fallback
      const questionMainData = await client.query(
        `SELECT language_id, q_input_text, answer_choice_a_text, answer_choice_b_text,
                answer_choice_c_text, answer_choice_d_text, answer_choice_e_text,
                answer_choice_f_text, answer_choice_g_text
         FROM mst_question_answer WHERE id = $1`,
        [questionId]
      );

      // Get English fallback if exists
      const enFallback = await client.query(
        `SELECT * FROM mst_question_answer_translations
         WHERE question_answer_id = $1 AND language_id = 'en'`,
        [questionId]
      );

      // Create a map of existing translations
      const translationMap = new Map();
      result.rows.forEach((translation: any) => {
        translationMap.set(translation.language_id, translation);
      });

      // Fill in missing languages with fallback data
      const allLanguages = allLanguagesResult.rows;
      allLanguages.forEach((lang: any) => {
        const languageCode = lang.language_code;

        if (!translationMap.has(languageCode)) {
          // Try English fallback first
          if (enFallback.rows.length > 0) {
            translationMap.set(languageCode, {
              ...enFallback.rows[0],
              language_id: languageCode,
              id: null, // Mark as fallback
              is_fallback: true,
              fallback_source: "en",
            });
          } else {
            translationMap.set(languageCode, {
              question_answer_id: questionId,
              language_id: languageCode,
              q_input_text: questionMainData.rows[0].q_input_text,
              answer_choice_a_text: questionMainData.rows[0].answer_choice_a_text,
              answer_choice_b_text: questionMainData.rows[0].answer_choice_b_text,
              answer_choice_c_text: questionMainData.rows[0].answer_choice_c_text,
              answer_choice_d_text: questionMainData.rows[0].answer_choice_d_text,
              answer_choice_e_text: questionMainData.rows[0].answer_choice_e_text,
              answer_choice_f_text: questionMainData.rows[0].answer_choice_f_text,
              answer_choice_g_text: questionMainData.rows[0].answer_choice_g_text,
              id: null,
              created_by: null,
              created_date: null,
              updated_by: null,
              updated_date: null,
              is_fallback: true,
              fallback_source: questionMainData.rows[0].language_id || "main",
            });
          }
        }
      });

      return Array.from(translationMap.values());
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const deleteQuestion = async (id: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [q, v] = deleteQuery("mst_question_answer", { id });
    const result = await client.query(q, v);
    if (result.rowCount === 0) throw new Error(`ID ${id} not exist`);
    await client.query(TRANS.COMMIT);
    console.log(result);
    return id;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const getLanguagesWithQuestionTranslationStatus = async (questionId: string) => {
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
