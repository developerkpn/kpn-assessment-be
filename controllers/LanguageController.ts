import {
  getElementsTranslation,
  getElementTranslationMaster,
  getLanguages,
  getLanguagesClient,
  getLanguagesMaster,
  updateLanguageMaster,
  createElementTranslation,
  updateElementTranslation,
  deleteElementTranslation,
  getElementTranslationById,
} from "@/models/TranslationModel.js";
import { NextFunction, Request, Response } from "express";
import { ResponseError } from "@/error/response-error.js";

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

export const handleCreateElementTranslation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { element_id, language_id, description } = req.body;
    const session = req.userDecode;

    if (!element_id || !language_id || !description) {
      throw new ResponseError(400, "Missing required fields: element_id, language_id, and description are required");
    }

    const result = await createElementTranslation(element_id, language_id, description, session);
    res.status(201).send({
      message: "Element translation created successfully",
      data: result,
    });
  } catch (error: any) {
    if (error.code === "23505") {
      next(new ResponseError(409, "Translation for this element and language already exists"));
    } else {
      next(error);
    }
  }
};

export const handleUpdateElementTranslation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    const session = req.userDecode;

    if (!description) {
      throw new ResponseError(400, "Description is required");
    }

    const result = await updateElementTranslation(id, description, session);
    
    if (!result) {
      throw new ResponseError(404, "Translation not found");
    }

    res.status(200).send({
      message: "Element translation updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const handleDeleteElementTranslation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const translation = await getElementTranslationById(id);
    
    if (!translation) {
      throw new ResponseError(404, "Translation not found");
    }

    if (translation.language_id === "en") {
      throw new ResponseError(403, "Cannot delete main language (English) translation");
    }

    const result = await deleteElementTranslation(id);
    res.status(200).send({
      message: "Element translation deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
