import { Router } from "express";
import { checkPermission } from "@/middleware/auth.js";
import {
  handleCreateTest,
  handleDeleteSubTestFromTest,
  handleDeleteTest,
  handleGetAvailableSubTestForTest,
  handleGetTest,
  handleGetTestDetail,
  handleUpdateTest,
  handleGenerateTestTranslation,
  handleTestLanguageTypeSwitch,
  handleGetTestTranslationForLanguage,
  handleGetLanguagesWithTestTranslationStatus,
} from "@/controllers/TestController.js";
const Test = Router();

Test.post("/", checkPermission("fcreate", 14), handleCreateTest);
Test.get("/", checkPermission("fread", [14]), handleGetTest);
Test.delete("/:id", checkPermission("fdelete", 14), handleDeleteTest);
Test.patch("/:id", checkPermission("fupdate", 14), handleUpdateTest);
Test.get("/:id", checkPermission("fupdate", [14, 15]), handleGetTestDetail);
Test.get("/:id/subtest-available", checkPermission("fupdate", 14), handleGetAvailableSubTestForTest);
Test.delete("/:id/subtest/:detailId", checkPermission("fdelete", 14), handleDeleteSubTestFromTest);

// Test translation endpoints
Test.get("/:id/language/:languageId?", checkPermission("fread", 14), handleGetTestTranslationForLanguage);
Test.post("/:id/language/:languageId/generate", checkPermission("fread", 14), handleGenerateTestTranslation);
Test.get("/:testId/language-selection", checkPermission("fread", 14), handleTestLanguageTypeSwitch);
Test.get("/:id/languages", checkPermission("fread", 14), handleGetLanguagesWithTestTranslationStatus);

export default Test;
