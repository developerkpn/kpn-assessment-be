import { handleGetLanguages } from "@/controllers/LanguageController.js";
import { checkPermission } from "@/middleware/auth.js";
import { Router } from "express";

const Language = Router();

// Get all active languages
Language.get("/", checkPermission("fread", 7), handleGetLanguages);

export default Language;
