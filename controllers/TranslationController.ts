import { translateFieldsBatch, getLanguageByCode, handleSimpleTranslation } from "@/models/TranslationModel.js";
import { NextFunction, Request, Response } from "express";

export const handleTranslateFields = async (req: Request, res: Response): Promise<any> => {
  try {
    const { fieldsToTranslate, sourceLanguage, targetLanguage } = req.body;

    // Validate required fields
    if (!fieldsToTranslate || !sourceLanguage || !targetLanguage) {
      res.status(400).send({
        message: "fieldsToTranslate, sourceLanguage, and targetLanguage are required",
      });
      return;
    }

    // Validate that fieldsToTranslate is an object
    if (typeof fieldsToTranslate !== "object" || Array.isArray(fieldsToTranslate)) {
      res.status(400).send({
        message: "fieldsToTranslate must be an object with key-value pairs",
      });
      return;
    }

    // Validate source and target languages exist
    const sourceLanguageData = await getLanguageByCode(sourceLanguage);
    if (!sourceLanguageData) {
      res.status(400).send({
        message: `Invalid source language: ${sourceLanguage}`,
      });
      return;
    }

    const targetLanguageData = await getLanguageByCode(targetLanguage);
    if (!targetLanguageData) {
      res.status(400).send({
        message: `Invalid target language: ${targetLanguage}`,
      });
      return;
    }

    // Perform batch translation
    const translatedFields = await translateFieldsBatch(fieldsToTranslate, sourceLanguage, targetLanguage);

    res.status(200).send({
      message: "Translation completed successfully",
      data: translatedFields,
    });
  } catch (error: any) {
    console.error("Translation endpoint error:", error);
    res.status(500).send({
      message: "Translation failed",
      error: error.message,
    });
  }
};

export const handleGenerateSimpleTranslation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to, value } = req.body;
    const result = await handleSimpleTranslation(from, to, value);
    res.status(200).send({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
