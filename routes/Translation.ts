import { handleGetQuestionTranslation } from "@/controllers/TranslationController.js";
import { checkPermission } from "@/middleware/auth.js";
import { Router } from "express";

const Translation = Router();

// Get question translation (with auto-translation if needed)
Translation.get("/question/:id/translation/:languageId", checkPermission("fread", 7), handleGetQuestionTranslation);

export default Translation;
