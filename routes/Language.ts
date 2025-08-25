import {
  handleGetLanguages,
  handleGetLanguagesWithTranslationStatus,
  handleTranslateKeyValue,
} from "@/controllers/TranslationController.js";
import { checkPermission } from "@/middleware/auth.js";
import { Router } from "express";

const Language = Router();

// Get all active languages
Language.get("/", checkPermission("fread", 7), handleGetLanguages);

// Get languages with translation status for a specific question
Language.get("/question/:questionId", checkPermission("fread", 7), handleGetLanguagesWithTranslationStatus);

// Generic translation endpoint for key-value pairs
Language.post("/translate", checkPermission("fcreate", 7), handleTranslateKeyValue);

export default Language;