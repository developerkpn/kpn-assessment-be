import { db } from "@/config/connection.js";
import { TRANSACTION as TRANS } from "@/config/transaction.js";
import { updateQuery } from "@/helper/queryBuilder.js";
import { BriefRequest, TermsPPRequest } from "@/types/MasterDataTypes.js";

export const getTermsPP = async () => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
    SELECT * FROM mst_term_pp
    `
    );
    return result.rows;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const updateTermsPP = async (payload: TermsPPRequest, id: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [q, v] = updateQuery("mst_term_pp", payload, { id }, "id");
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
export const getShortBrief = async () => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
    SELECT * FROM mst_short_brief
    `
    );
    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const updateShortBrief = async (payload: BriefRequest, id: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [q, v] = updateQuery("mst_short_brief", payload, { id }, "id");
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

export const getLanguagesWithTermsPPTranslationStatus = async (typeDoc: "terms" | "pp") => {
  const client = await db.connect();
  try {
    // Get all active languages and check which ones have translations for this type
    const result = await client.query(
      `SELECT
        ml.id,
        ml.language_code,
        ml.language_name,
        ml.language_name_native,
        ml.is_active,
        main_term.language_id as main_language_code,
        CASE
          WHEN main_term.language_id = ml.language_code THEN 'main'
          WHEN sub_term.language_id IS NOT NULL THEN 'translation_exists'
          ELSE 'translation_available'
        END as translation_status
      FROM mst_language ml
      LEFT JOIN mst_term_pp main_term ON main_term.type_dt = $1
        AND main_term.language_type = 'main'
      LEFT JOIN mst_term_pp sub_term ON sub_term.type_dt = $1
        AND sub_term.language_type = 'sub'
        AND sub_term.language_id = ml.language_code
      WHERE ml.is_active = true
      ORDER BY ml.language_name`,
      [typeDoc]
    );
    return result.rows;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const getTermsPPTranslation = async (typeDoc: "terms" | "pp", languageId?: string) => {
  const client = await db.connect();
  try {
    let result;
    if (languageId) {
      // Get specific translation for a language
      result = await client.query(
        `SELECT * FROM mst_term_pp
         WHERE type_dt = $1 AND language_id = $2`,
        [typeDoc, languageId]
      );
      return result.rows[0];
    } else {
      // Get all translations for the type (only sub language translations)
      result = await client.query(
        `SELECT * FROM mst_term_pp
         WHERE type_dt = $1 AND language_type = 'sub'`,
        [typeDoc]
      );

      // Get all active languages
      const allLanguagesResult = await client.query(
        `SELECT language_code FROM mst_language WHERE is_active = true`
      );

      // Get main data for fallback
      const mainData = await client.query(
        `SELECT language_id, name FROM mst_term_pp
         WHERE type_dt = $1 AND language_type = 'main'`,
        [typeDoc]
      );

      // Get English fallback if exists
      const enFallback = await client.query(
        `SELECT * FROM mst_term_pp
         WHERE type_dt = $1 AND language_type = 'sub' AND language_id = 'en'`,
        [typeDoc]
      );

      // Get Indonesian fallback if exists
      const idFallback = await client.query(
        `SELECT * FROM mst_term_pp
         WHERE type_dt = $1 AND language_type = 'sub' AND language_id = 'id'`,
        [typeDoc]
      );

      // Create a map of existing translations
      const translationMap = new Map();
      result.rows.forEach((translation: any) => {
        translationMap.set(translation.language_id, translation);
      });

      // Fill in missing languages with fallback data
      const allLanguages = allLanguagesResult.rows;
      const mainLanguageId = mainData.rows[0]?.language_id;

      allLanguages.forEach((lang: any) => {
        const languageCode = lang.language_code;

        // If this language is the main language, add the main data
        if (languageCode === mainLanguageId && mainData.rows.length > 0) {
          if (!translationMap.has(languageCode)) {
            translationMap.set(languageCode, {
              type_dt: typeDoc,
              language_type: 'main',
              language_id: languageCode,
              name: mainData.rows[0].name,
              id: null,
              created_by: null,
              created_date: null,
              updated_by: null,
              updated_date: null,
            });
          }
        } else if (!translationMap.has(languageCode)) {
          // Try English fallback first
          if (enFallback.rows.length > 0) {
            translationMap.set(languageCode, {
              ...enFallback.rows[0],
              language_id: languageCode,
              id: null, // Mark as fallback
              is_fallback: true,
              fallback_source: 'en'
            });
          }
          // If no English, try Indonesian fallback
          else if (idFallback.rows.length > 0) {
            translationMap.set(languageCode, {
              ...idFallback.rows[0],
              language_id: languageCode,
              id: null, // Mark as fallback
              is_fallback: true,
              fallback_source: 'id'
            });
          }
          // If no translations exist at all, use main data
          else if (mainData.rows.length > 0) {
            translationMap.set(languageCode, {
              type_dt: typeDoc,
              language_type: 'sub',
              language_id: languageCode,
              name: mainData.rows[0].name,
              id: null,
              created_by: null,
              created_date: null,
              updated_by: null,
              updated_date: null,
              is_fallback: true,
              fallback_source: mainData.rows[0].language_id || 'main'
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

export const createTermsPPTranslation = async (payload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const result = await client.query(
      `INSERT INTO mst_term_pp (id, name, type_dt, language_type, language_id, created_by, created_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        payload.id,
        payload.name,
        payload.type_dt,
        payload.language_type,
        payload.language_id,
        payload.created_by,
        payload.created_date,
      ]
    );
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

export const updateTermsPPTranslation = async (payload: any, typeDoc: string, languageId: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const result = await client.query(
      `UPDATE mst_term_pp
       SET name = $1, updated_by = $2, updated_date = $3
       WHERE type_dt = $4 AND language_id = $5 AND language_type = 'sub'
       RETURNING id`,
      [payload.name, payload.updated_by, payload.updated_date, typeDoc, languageId]
    );
    
    if (result.rows.length === 0) {
      await client.query(TRANS.ROLLBACK);
      throw new Error(`Translation not found for ${typeDoc} with language ${languageId}`);
    }
    
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
