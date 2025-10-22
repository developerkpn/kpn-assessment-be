// get all data and by id assessee extern
// update detail assessee (just nik)
// send email user to reset password assessee extern
// validate token for password reset
// reset password

import { Router } from "express";
import AssesseeExtController from "@/controllers/AssesseeExtController.js";
import { errorMiddleware } from "@/middleware/errorMiddleware.js";
import { isAuth, verifyTokenResetPass } from "@/middleware/auth.js";
const router = Router();

router.get("/", AssesseeExtController.getAllDataAssessee, errorMiddleware);
router.get("/byid/:id", AssesseeExtController.getUserById, errorMiddleware);
router.post("/", AssesseeExtController.updateNIKAssessee, errorMiddleware);
router.post("/reqreset", isAuth, AssesseeExtController.sendEmailResetPassword, errorMiddleware);
router.get("/veriftokenres", verifyTokenResetPass, AssesseeExtController.verifyTokenReset, errorMiddleware);
router.post("/resettoken", verifyTokenResetPass, AssesseeExtController.resetPassword, errorMiddleware);

export default router;
