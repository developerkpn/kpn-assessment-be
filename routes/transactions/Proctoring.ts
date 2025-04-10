import ProctoringController from "#dep/controllers/transaction/ProctoringController";
import { isAuth } from "#dep/middleware/auth";
import { Router } from "express";

const Proctoring = Router();

Proctoring.get("/", ProctoringController.CheckS3Storage);
Proctoring.post("/upload", ProctoringController.UploadFileProctoring);
Proctoring.get("/file", ProctoringController.GetFile);

export default Proctoring;
