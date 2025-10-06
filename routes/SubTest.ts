import { Router } from "express";
import { checkPermission } from "@/middleware/auth.js";
import {
  handleCreateSubTest,
  handleDeleteSeriesFromSubTest,
  handleDeleteSubTest,
  handleGetAvailableSeriesForSubTest,
  handleGetSubTest,
  handleGetSubTestDetail,
  handleUpdateSubTest,
  handleGenerateSubTestTranslation,
  handleSubTestLanguageTypeSwitch,
  handleGetSubTestTranslationForLanguage,
  handleGetLanguagesWithSubTestTranslationStatus,
} from "@/controllers/SubTestController.js";
const SubTest = Router();

SubTest.post("/", checkPermission("fcreate", 12), handleCreateSubTest);
SubTest.get("/", checkPermission("fread", [12, 15]), handleGetSubTest);
SubTest.delete("/:id", checkPermission("fdelete", 12), handleDeleteSubTest);
SubTest.patch("/:id", checkPermission("fupdate", 12), handleUpdateSubTest);
SubTest.get("/:id", checkPermission("fupdate", [12, 15]), handleGetSubTestDetail);
SubTest.get("/:id/series-available", checkPermission("fread", 12), handleGetAvailableSeriesForSubTest);
SubTest.delete("/:id/series/:detailId", checkPermission("fdelete", 12), handleDeleteSeriesFromSubTest);

// SubTest translation endpoints
SubTest.get("/:id/language/:languageId?", checkPermission("fread", 12), handleGetSubTestTranslationForLanguage);
SubTest.post("/:id/language/:languageId/generate", checkPermission("fread", 12), handleGenerateSubTestTranslation);
SubTest.get("/:subtestId/language-selection", checkPermission("fread", 12), handleSubTestLanguageTypeSwitch);
SubTest.get("/:id/languages", checkPermission("fread", 12), handleGetLanguagesWithSubTestTranslationStatus);

export default SubTest;
