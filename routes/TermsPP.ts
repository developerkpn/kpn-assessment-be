import {
  handleGetBrief,
  handleGetTermsPP,
  handleUpdateBrief,
  handleUpdatePP,
  handleUpdateTerms,
  handleGetLanguagesWithTermsPPTranslationStatus,
  handleGetTermsPPTranslationForLanguage,
  handleGenerateTermsPPTranslation,
  handleTermsPPLanguageTypeSwitch,
} from "@/controllers/TermsPPController.js";
import { checkPermission } from "@/middleware/auth.js";
import { Router } from "express";
const TermsPP = Router();
export const ShortBrief = Router();

TermsPP.get("/", checkPermission("fread", 2), handleGetTermsPP);
TermsPP.patch("/terms", checkPermission("fupdate", 2), handleUpdateTerms);
TermsPP.patch("/pp", checkPermission("fupdate", 2), handleUpdatePP);

// TermsPP translation endpoints
TermsPP.get("/:type/language/:languageId", checkPermission("fread", 2), handleGetTermsPPTranslationForLanguage);
TermsPP.post("/:type/language/:languageId/generate", checkPermission("fread", 2), handleGenerateTermsPPTranslation);
TermsPP.get("/:type/language-selection", checkPermission("fread", 2), handleTermsPPLanguageTypeSwitch);
TermsPP.get("/:type/languages", checkPermission("fread", 2), handleGetLanguagesWithTermsPPTranslationStatus);

ShortBrief.get("/", checkPermission("fread", 3), handleGetBrief);
ShortBrief.patch("/", checkPermission("fupdate", 3), handleUpdateBrief);

export default TermsPP;
