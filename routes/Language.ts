import { handleGetLanguages } from "@/controllers/LanguageController.js";
import { Router } from "express";

const Language = Router();

// Get all active languages (public endpoint)
Language.get("/", handleGetLanguages);

export default Language;
