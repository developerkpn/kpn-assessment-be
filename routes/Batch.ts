import { Router } from "express";
import { checkPermission } from "#dep/middleware/auth";
import {
  getInternalAssesseeData,
  handleAddAssesseeManually,
  handleAddCCEmail,
  handleCreateBatch,
  handleDeleteBatch,
  handleDeleteBatchAssessee,
  handleDeleteCCEmail,
  handleGetBatch,
  handleGetBatchAssessees,
  handleGetBatchCode,
  handleGetBatchDetail,
  handlePreviewBatchTemplateEmail,
  handlePublishBatch,
  handleReadAssesseeFile,
  handleUpdateBatch,
} from "#dep/controllers/BatchController";
import { handleGetTest } from "#dep/controllers/TestController";
import { uploadSingleFile } from "#dep/middleware/fileMiddleware";

export const Batch = Router();

Batch.get("/darwin-assessee", checkPermission("fread", 15), uploadSingleFile, getInternalAssesseeData);
Batch.get("/external-assessee", checkPermission("fread", 15), uploadSingleFile, handleReadAssesseeFile);
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
Batch.post("/:id/published", checkPermission("fupdate", 15), handlePublishBatch);
