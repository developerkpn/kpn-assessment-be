import ProctoringController from "@/controllers/transaction/ProctoringController.js";
import { isAuth } from "@/middleware/auth.js";
import { Router } from "express";

const Proctoring = Router();

Proctoring.get("/", ProctoringController.CheckS3Storage);
Proctoring.post("/upload", ProctoringController.UploadFileProctoring);
Proctoring.get("/file", ProctoringController.GetFile);

export default Proctoring;
