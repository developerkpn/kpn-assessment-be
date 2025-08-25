import {
  handleCreateQuestion,
  handleDeleteQuestion,
  handleGetQuestion,
  handleGetQuestionById,
  handleGetQuestionTranslation,
  handleUpdateQuestion,
} from "@/controllers/QuestionController.js";
import { checkPermission } from "@/middleware/auth.js";
import { Router } from "express";
const Question = Router();

Question.post("/", checkPermission("fcreate", 7), handleCreateQuestion);
Question.get("/", checkPermission("fread", 7), handleGetQuestion);
Question.get("/:id", checkPermission("fread", 7), handleGetQuestionById);
Question.get("/:questionId/translation/:languageId", checkPermission("fread", 7), handleGetQuestionTranslation);
Question.patch("/:id", checkPermission("fupdate", 7), handleUpdateQuestion);
Question.delete("/:id", checkPermission("fdelete", 7), handleDeleteQuestion);

export default Question;
