import {
  handleCreateQuestion,
  handleDeleteQuestion,
  handleGetQuestion,
  handleGetQuestionById,
  handleUpdateQuestion,
  handleGenerateQuestionTranslation,
  handleQuestionLanguageTypeSwitch,
  handleGetQuestionTranslationForLanguage,
  handleGetLanguagesWithQuestionTranslationStatus,
} from "@/controllers/QuestionController.js";
import { checkPermission } from "@/middleware/auth.js";
import { Router } from "express";
const Question = Router();

Question.post("/", checkPermission("fcreate", 7), handleCreateQuestion);
Question.get("/", checkPermission("fread", 7), handleGetQuestion);
Question.get("/:id", checkPermission("fread", 7), handleGetQuestionById);
Question.patch("/:id", checkPermission("fupdate", 7), handleUpdateQuestion);
Question.delete("/:id", checkPermission("fdelete", 7), handleDeleteQuestion);

// Question translation endpoints
Question.get("/:id/language/:languageId", checkPermission("fread", 7), handleGetQuestionTranslationForLanguage);
Question.post("/:id/language/:languageId/generate", checkPermission("fread", 7), handleGenerateQuestionTranslation);
Question.get("/:questionId/language-selection", checkPermission("fread", 7), handleQuestionLanguageTypeSwitch);
Question.get("/:id/languages", checkPermission("fread", 7), handleGetLanguagesWithQuestionTranslationStatus);

export default Question;
