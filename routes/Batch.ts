import { Router } from "express";
import {checkPermission} from "#dep/middleware/auth";
import {
    handleAddAssesseeByFile,
    handleAddAssesseeManually,
    handleCreateBatch,
    handleDeleteBatch,
    handleDeleteBatchAssessee,
    handleGetBatch,
    handleGetBatchAssessees,
    handleGetBatchDetail, handlePreviewBatchTemplateEmail,
    handlePublishBatch,
    handleUpdateBatch
} from "#dep/controllers/BatchController";
import {handleGetTest} from "#dep/controllers/TestController";
import {uploadSingleFile} from "#dep/middleware/fileMiddleware";

export const Batch = Router();

Batch.post("/", checkPermission("fcreate", 15), handleCreateBatch);
Batch.get("/", checkPermission("fread", 15), handleGetBatch);
Batch.patch("/:id", checkPermission("fupdate", 15), handleUpdateBatch);
Batch.delete("/:id", checkPermission("fdelete", 15), handleDeleteBatch);
Batch.get("/:id", checkPermission("fread", 15), handleGetBatchDetail);

Batch.post("/:id", checkPermission("fcreate", 15), uploadSingleFile, handleAddAssesseeByFile);
Batch.post("/:id/assessee", checkPermission("fcreate", 15), handleAddAssesseeManually);
Batch.get("/:id/assessee", checkPermission("fread", 15), handleGetBatchAssessees);
Batch.delete("/:id/assessee/:assesseeId", checkPermission("fdelete", 15), handleDeleteBatchAssessee);

Batch.post("/:id/published", checkPermission("fupdate", 15), handlePublishBatch);

Batch.get("/preview", checkPermission("fread", 15), handlePreviewBatchTemplateEmail);