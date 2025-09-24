import { Router } from "express";
import ScopeController from "@/controllers/ScopeController.js";
import { errorMiddleware } from "@/middleware/errorMiddleware.js";
const router = Router();

router.get(`/`, ScopeController.GetDataScope, errorMiddleware);
router.get("/user", ScopeController.GetScopebyUserId, errorMiddleware);

export default router;
