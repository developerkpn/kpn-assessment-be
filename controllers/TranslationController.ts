import { getLanguages, getLanguagesWithTranslationStatus } from "@/models/TranslationModel.js";
import { Request, Response } from "express";

export const handleTranslateKeyValue = async (req: Request, res: Response): Promise<any> => {
  try {
    const { translations } = req.body;

    if (!translations || !Array.isArray(translations)) {
      res.status(400).send({
        message: "Invalid request. Expected 'translations' array in request body.",
      });
      return;
    }

    // Process key-value pairs for translation
    // Each item should have: key (field name), value (text to translate), target_language
    const translatedData = translations.map((item: any) => {
      const { key, value, target_language } = item;

      if (!key || !value || !target_language) {
        return {
          key,
          success: false,
          message: "Missing required fields: key, value, or target_language",
        };
      }

      // For now, just return the structure
      // In the future, this could integrate with translation services
      return {
        key,
        original_value: value,
        target_language,
        translated_value: value, // Placeholder - would be actual translation
        success: true,
        translated_at: new Date().toISOString(),
      };
    });

    res.status(200).send({
      message: "Translation processed successfully",
      data: translatedData,
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
