import {
  getLanguages,
  getLanguagesWithTranslationStatus,
} from "@/models/TranslationModel.js";
import { Request, Response } from "express";

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