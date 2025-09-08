import { handleTranslateFields } from "@/controllers/TranslationController.js";
import { checkPermission } from "@/middleware/auth.js";
import { Router } from "express";

const Translation = Router();

// Generic translation endpoint for batch field translation
Translation.post("/translate", checkPermission("fread", 7), handleTranslateFields);

export default Translation;
