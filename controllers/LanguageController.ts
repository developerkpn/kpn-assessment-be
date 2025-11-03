import {
  getElementsTranslation,
  getElementTranslationMaster,
  getLanguages,
  getLanguagesClient,
  getLanguagesMaster,
  updateLanguageMaster,
} from "@/models/TranslationModel.js";
import { NextFunction, Request, Response } from "express";

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

export const handleGetMasterLanguages = async (req: Request, res: Response) => {
  try {
    const result = await getLanguagesMaster();
    res.status(200).send({
      data: result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleGetLanguageClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getLanguagesClient();
    res.status(200).send({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const handleUpdateLanguage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { payload, id } = req.body;
    const session = req.userDecode;
    const result = await updateLanguageMaster(payload, id as string, session);
    res.status(200).send({
      message: `Success update ${result.language_name}(${result.language_name_native})`,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetElementsTranslation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lng } = req.query;
    const data = await getElementsTranslation(lng as string);
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(data);
  } catch (error) {
    next(error);
  }
};

export const handleGetElementsTranslationMaster = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getElementTranslationMaster();
    res.status(200).send({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
