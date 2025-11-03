import {
  handleGetElementsTranslation,
  handleGetElementsTranslationMaster,
  handleGetLanguageClient,
  handleGetLanguages,
  handleGetMasterLanguages,
  handleUpdateLanguage,
} from "@/controllers/LanguageController.js";
import { Router } from "express";
import { errorMiddleware } from "@/middleware/errorMiddleware.js";
import { isAuth } from "@/middleware/auth.js";

const Language = Router();

// Get all active languages (public endpoint)
Language.get("/", handleGetLanguages);
Language.get("/master", handleGetMasterLanguages);
Language.get("/client", handleGetLanguageClient, errorMiddleware);
Language.get("/elements", handleGetElementsTranslation, errorMiddleware);
Language.get("/elements/master", handleGetElementsTranslationMaster, errorMiddleware);

//update language
Language.post("/", isAuth, handleUpdateLanguage, errorMiddleware);

export default Language;
