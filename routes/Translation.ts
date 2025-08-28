import { handleGetTranslationForLanguage, handleGenerateQuestionTranslation, handleLanguageTypeSwitch } from "@/controllers/TranslationController.js";
import { checkPermission } from "@/middleware/auth.js";
import { Router } from "express";

const Translation = Router();

// Get question translation (existing only)
Translation.get("/question/:id/language/:languageId", checkPermission("fread", 7), handleGetTranslationForLanguage);

// Generate question translation for a language
Translation.post("/question/:id/language/:languageId/generate", checkPermission("fread", 7), handleGenerateQuestionTranslation);

// Get language selection with translation data for editing mode
Translation.get("/question/:questionId/language-selection", checkPermission("fread", 7), handleLanguageTypeSwitch);

export default Translation;
