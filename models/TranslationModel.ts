import { db } from "@/config/connection.js";
import { TRANSACTION } from "@/config/transaction.js";
import { ClientAction, deleteQuery, insertQuery, updateQuery } from "@/helper/queryBuilder.js";
import { ElementTranslation } from "@/types/MasterDataTypes.js";
import { Request } from "express";
import { translate } from "google-translate-api-x";
import moment from "moment";
import { QueryResult } from "pg";

export const getLanguagesMaster = async () => {
  return await ClientAction(async (client) => {
    try {
      const { rows } = await client.query(`
        select id,
        language_code,
        language_name,
        language_name_native,
        is_active,
        is_display_client
        from mst_language
        `);

      return rows;
    } catch (error) {
      throw error;
    }
  });
};

export const updateLanguageMaster = async (
  value: any,
  id: string,
  session: Request["userDecode"]
): Promise<{ language_name: string; language_name_native: string }> => {
  return await ClientAction(async (client) => {
    try {
      await client.query(TRANSACTION.BEGIN);
      const payload = {
        ...value,
        update_at: moment().toISOString(),
        update_by: session?.user_id,
      };
      const [q, v] = updateQuery("mst_language", payload, { id: id }, "language_name, language_name_native");
      const { rows } = await client.query(q, v);
      await client.query(TRANSACTION.COMMIT);
      return {
        language_name: rows[0]?.language_name,
        language_name_native: rows[0]?.language_name_native,
      };
    } catch (error) {
      await client.query(TRANSACTION.ROLLBACK);
      throw error;
    }
  });
};

export const getLanguagesClient = async () => {
  return await ClientAction(async (client) => {
    try {
      const { rows } = await client.query(`
        SELECT
        id,
        language_code,
        language_name,
        language_name_native,
        is_active,
        "order"
      FROM mst_language
      WHERE is_display_client = true
      ORDER BY "order" ASC
        `);
      return rows;
    } catch (error) {
      throw error;
    }
  });
};

export const getLanguages = async () => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `SELECT
        id,
        language_code,
        language_name,
        language_name_native,
        is_active,
        "order"
      FROM mst_language
      WHERE is_active = true
      ORDER BY "order" ASC`
    );
    return result.rows;
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

export const translateFieldsBatch = async (
  fieldsToTranslate: Record<string, string>,
  sourceLanguageCode: string,
  targetLanguageCode: string
): Promise<Record<string, string>> => {
  try {
    const translatedFields: Record<string, string> = {};

    const translationPromises = Object.entries(fieldsToTranslate).map(async ([fieldName, fieldValue]) => {
      if (fieldValue && fieldValue.trim() !== "") {
        const translatedText = await translate(fieldValue, {
          from: sourceLanguageCode,
          to: targetLanguageCode,
          forceTo: true,
        });
        return { fieldName, translatedValue: (translatedText as any).text };
      } else {
        return { fieldName, translatedValue: fieldValue };
      }
    });

    const translationResults = await Promise.all(translationPromises);

    translationResults.forEach(({ fieldName, translatedValue }) => {
      translatedFields[fieldName] = translatedValue;
    });

    return translatedFields;
  } catch (error: any) {
    console.error("Batch translation failed:", error);
    throw new Error(`Translation failed: ${error.message}`);
  }
};

export const handleSimpleTranslation = async (from: string, to: string, from_value: string) => {
  try {
    const translated_text = await translate(from_value, { from, to, forceTo: true });
    return translated_text;
  } catch (error) {
    throw error;
  }
};

export const getElementsTranslation = async (lang: string) => {
  return await ClientAction(async (client) => {
    try {
      const { rows }: QueryResult<ElementTranslation> = await client.query(
        `
        select
          language_id,
          element_id,
          description
        from
          mst_element_translations met
        inner join mst_language ml on
          met.language_id = ml.language_code
        where
          ml.is_display_client = true and met.language_id = $1    
        `,
        [lang]
      );
      const map_translation = new Map();
      rows.forEach((value) => {
        map_translation.set(value.element_id, value.description);
      });
      const translation_elements = Object.fromEntries(map_translation);
      return translation_elements;
    } catch (error) {
      throw error;
    }
  });
};

export const getElementTranslationMaster = async () => {
  return await ClientAction(async (client) => {
    try {
      const { rows }: QueryResult<ElementTranslation> = await client.query(
        `
        select
        met.id,
          language_id,
          element_id,
          description,
          ml.language_name, 
          ml.language_name_native
        from
          mst_element_translations met
        inner join mst_language ml on
          met.language_id = ml.language_code
        where
          ml.is_active = true
        `
      );
      let idx = 0;
      const map_subtable = new Map();
      const kept_value = new Array<ElementTranslation>();
      while (kept_value.length > 0 || idx < rows.length) {
        if (kept_value.length > 0) {
          const data_kept = kept_value[0];
          if (map_subtable.get(data_kept.element_id)) {
            map_subtable.get(data_kept.element_id).subtable.push(data_kept);
            kept_value.shift();
          }
        }
        if (!map_subtable.get(rows[idx].element_id)) {
          if (rows[idx].language_id != "en") {
            kept_value.push(rows[idx]);
          } else {
            map_subtable.set(rows[idx].element_id, {
              ...rows[idx],
              subtable: [rows[idx]],
            });
          }
        } else {
          map_subtable.get(rows[idx].element_id).subtable.push(rows[idx]);
        }
        idx++;
      }
      let result = new Array();
      map_subtable.forEach((value) => {
        result.push(value);
      });
      return result;
    } catch (error) {
      throw error;
    }
  });
};

export const createElementTranslation = async (
  element_id: string,
  language_id: string,
  description: string,
  session: Request["userDecode"]
) => {
  return await ClientAction(async (client) => {
    try {
      await client.query(TRANSACTION.BEGIN);
      const payload = {
        element_id,
        language_id,
        description,
        create_by: session?.user_id,
      };
      const [q, v] = insertQuery("mst_element_translations", payload, "id, element_id, language_id, description");
      const { rows } = await client.query(q, v);
      await client.query(TRANSACTION.COMMIT);
      return rows[0];
    } catch (error) {
      await client.query(TRANSACTION.ROLLBACK);
      throw error;
    }
  });
};

export const updateElementTranslation = async (
  id: string,
  description: string,
  session: Request["userDecode"]
) => {
  return await ClientAction(async (client) => {
    try {
      await client.query(TRANSACTION.BEGIN);
      const payload = {
        description,
        update_at: moment().toISOString(),
        update_by: session?.user_id,
      };
      const [q, v] = updateQuery("mst_element_translations", payload, { id }, "id, element_id, language_id, description");
      const { rows } = await client.query(q, v);
      await client.query(TRANSACTION.COMMIT);
      return rows[0];
    } catch (error) {
      await client.query(TRANSACTION.ROLLBACK);
      throw error;
    }
  });
};

export const deleteElementTranslation = async (id: string) => {
  return await ClientAction(async (client) => {
    try {
      await client.query(TRANSACTION.BEGIN);
      const [q, v] = deleteQuery("mst_element_translations", { id });
      const result = await client.query(q, v);
      if (result.rowCount === 0) throw new Error(`ID ${id} not exist`);
      await client.query(TRANSACTION.COMMIT);
      return { id };
    } catch (error) {
      await client.query(TRANSACTION.ROLLBACK);
      throw error;
    }
  });
};

export const getElementTranslationById = async (id: string) => {
  return await ClientAction(async (client) => {
    try {
      const { rows } = await client.query(
        `
        SELECT id, element_id, language_id, description
        FROM mst_element_translations
        WHERE id = $1
        `,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  });
};
