import {
  handleGetElementsTranslation,
  handleGetElementsTranslationMaster,
  handleGetLanguageClient,
  handleGetLanguages,
  handleGetMasterLanguages,
  handleUpdateLanguage,
  handleCreateElementTranslation,
  handleUpdateElementTranslation,
  handleDeleteElementTranslation,
} from "@/controllers/LanguageController.js";
import { Router } from "express";
import { errorMiddleware } from "@/middleware/errorMiddleware.js";
import { isAuth } from "@/middleware/auth.js";

const Language = Router();

// Get all active languages (public endpoint)
Language.get("/", handleGetLanguages);
Language.get("/master", handleGetMasterLanguages);
Language.get("/client", handleGetLanguageClient);
Language.get("/elements", handleGetElementsTranslation);
Language.get("/elements/master", handleGetElementsTranslationMaster);

//update language
Language.post("/", isAuth, handleUpdateLanguage);

// Element translations CRUD
Language.post("/elements", isAuth, handleCreateElementTranslation);
Language.put("/elements/:id", isAuth, handleUpdateElementTranslation);
Language.delete("/elements/:id", isAuth, handleDeleteElementTranslation);

export default Language;
