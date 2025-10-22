import GuidelineMasterController from "@/controllers/GuidelineMasterController.js";
import { isAuth } from "@/middleware/auth.js";
import { Router } from "express";
import { errorMiddleware } from "@/middleware/errorMiddleware.js";
const router = Router();

router.get("/", GuidelineMasterController.HandleGetGuideline, errorMiddleware);
router.get("/getfile", GuidelineMasterController.HandleGetDefaultGuideline, errorMiddleware);
router.get("/getfile/:file_id", GuidelineMasterController.HandleGetFileGuideline, errorMiddleware);
router.post("/", isAuth, GuidelineMasterController.HandleUploadGuideline, errorMiddleware);
router.post("/select", isAuth, GuidelineMasterController.HandleSelectGuideline, errorMiddleware);
router.delete("/", isAuth, GuidelineMasterController.HandleDeleteGuideline, errorMiddleware);

export default router;
