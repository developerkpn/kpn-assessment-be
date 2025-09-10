import { db } from "@/config/connection.js";
import { translate } from "google-translate-api-x";

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
