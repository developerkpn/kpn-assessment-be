import { handleGetAdminMenu, handleGetAllMenu } from "@/controllers/MenuController.js";
import { Router } from "express";
const Question = Router();

Question.get("/", handleGetAllMenu);
Question.get("/admin", handleGetAdminMenu);

export default Question;
