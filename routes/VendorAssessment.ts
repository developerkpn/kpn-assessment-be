import { Router } from "express";
import { VendorAssessmentController } from "@/controllers/VendorAssessmentController.js";
import { errorMiddleware } from "@/middleware/errorMiddleware.js";

const router = Router();

router.get("/", VendorAssessmentController.handleGetAll, errorMiddleware);
router.get("/:id", VendorAssessmentController.handleGetById, errorMiddleware);
router.post("/", VendorAssessmentController.handleUpload, errorMiddleware);
router.get("/:id/file", VendorAssessmentController.handleGetFile, errorMiddleware);
router.get("/:id/download", VendorAssessmentController.handleDownloadFile, errorMiddleware);
router.delete("/:id", VendorAssessmentController.handleDelete, errorMiddleware);

export default router;
