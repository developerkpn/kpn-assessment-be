import { Router } from "express";
import { handleGetBatchTranslationForLanguage } from "@/controllers/BatchController.js";
import { handleGetSubTestTranslationForLanguage } from "@/controllers/SubTestController.js";
import { handleGetQuestionTranslationForLanguage } from "@/controllers/QuestionController.js";
import { handleGetTermsPPTranslationForLanguage } from "@/controllers/TermsPPController.js";
import { handleGetTestTranslationForLanguage } from "@/controllers/TestController.js";

const Public = Router();

// Public batch translation endpoints (for client pages - no auth required)
Public.get("/batch/:id/language/:languageId?", handleGetBatchTranslationForLanguage);

// Public test translation endpoints (for client pages - no auth required)
Public.get("/test/:id/language/:languageId?", handleGetTestTranslationForLanguage);

// Public subtest translation endpoints (for client pages - no auth required)
Public.get("/subtest/:id/language/:languageId?", handleGetSubTestTranslationForLanguage);

// Public question translation endpoints (for client pages - no auth required)
Public.get("/question/:id/language/:languageId?", handleGetQuestionTranslationForLanguage);

// Public terms/pp translation endpoints (for client pages - no auth required)
Public.get("/termspp/:type/language/:languageId?", handleGetTermsPPTranslationForLanguage);

export default Public;
