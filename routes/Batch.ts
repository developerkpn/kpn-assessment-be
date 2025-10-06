import { Router } from "express";
import { checkPermission } from "@/middleware/auth.js";
import {
  getInternalAssesseeData,
  handleAddAssesseeManually,
  handleAddCCEmail,
  handleCreateBatch,
  handleDeleteBatch,
  handleDeleteBatchAssessee,
  handleDeleteCCEmail,
  handleGetAssesseebyDarwin,
  handleGetBatch,
  handleGetBatchAssessees,
  handleGetBatchCode,
  handleGetBatchDetail,
  handleGetLanguagesWithBatchTranslationStatus,
  handlePreviewBatchTemplateEmail,
  handlePublishBatch,
  handleReadAssesseeFile,
  handleUpdateBatch,
  handleGenerateBatchTranslation,
  handleBatchLanguageTypeSwitch,
  handleGetBatchTranslationForLanguage,
} from "@/controllers/BatchController.js";
import { handleGetTest } from "@/controllers/TestController.js";
import { uploadSingleFile } from "@/middleware/fileMiddleware.js";

export const Batch = Router();

Batch.post("/darwin-assessee", checkPermission("fread", 15), uploadSingleFile, getInternalAssesseeData);
Batch.post("/external-assessee", checkPermission("fread", 15), uploadSingleFile, handleReadAssesseeFile);
Batch.get("/code", checkPermission("fread", 15), handleGetBatchCode);
Batch.post("/", checkPermission("fcreate", 15), handleCreateBatch);
Batch.get("/", checkPermission("fread", 15), handleGetBatch);
Batch.get("/preview", checkPermission("fread", 15), handlePreviewBatchTemplateEmail);
Batch.patch("/:id", checkPermission("fupdate", 15), handleUpdateBatch);
Batch.delete("/:id", checkPermission("fdelete", 15), handleDeleteBatch);
Batch.get("/:id", checkPermission("fread", 15), handleGetBatchDetail);
Batch.post("/:id/cc-email", checkPermission("fcreate", 15), handleAddCCEmail);
Batch.delete("/:batchId/cc-email/:id", checkPermission("fdelete", 15), handleDeleteCCEmail);
Batch.post("/:id/assessee", checkPermission("fcreate", 15), handleAddAssesseeManually);
Batch.get("/:id/assessee", checkPermission("fread", 15), handleGetBatchAssessees);
Batch.delete("/:id/assessee/:assesseeId", checkPermission("fdelete", 15), handleDeleteBatchAssessee);
Batch.get("/assessee/:nik", checkPermission("fread", 15), handleGetAssesseebyDarwin);
Batch.post("/:id/published", checkPermission("fupdate", 15), handlePublishBatch);

// Batch translation endpoints
Batch.get("/:batchId/translation-status", checkPermission("fread", 15), handleGetLanguagesWithBatchTranslationStatus);
Batch.get("/:id/language/:languageId?", checkPermission("fread", 15), handleGetBatchTranslationForLanguage);
Batch.post("/:id/language/:languageId/generate", checkPermission("fread", 15), handleGenerateBatchTranslation);
Batch.get("/:batchId/language-selection", checkPermission("fread", 15), handleBatchLanguageTypeSwitch);
