import { handleGenerateSimpleTranslation, handleTranslateFields } from "@/controllers/TranslationController.js";
import { checkPermission } from "@/middleware/auth.js";
import { Router } from "express";

const Translation = Router();

// Generic translation endpoint for batch field translation
Translation.post("/translate", checkPermission("fread", 7), handleTranslateFields);
Translation.post("/simple", checkPermission("fread", 7), handleGenerateSimpleTranslation);

export default Translation;
