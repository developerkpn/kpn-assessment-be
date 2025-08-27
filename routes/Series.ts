import {
  // handleAddQuestionToSeries,
  handleCreateSeries,
  handleDeleteQuestionFromSeries,
  // handleDeleteQuestionFromSeries,
  handleDeleteSeries,
  handleGetAvailableQuestionForSeries,
  // handleGetAvailableQuestionForSeries,
  handleGetDetailSeries,
  // handleGetListSeriesByCategory,
  // handleGetQuestionsList,
  handleGetSeries,
  handleGetSeriesByID,
  handleUpdateSeries,
} from "@/controllers/SeriesController.js";
import { checkPermission } from "@/middleware/auth.js";
import { Router } from "express";
import { handleGetCategory } from "@/controllers/CategoryController.js";
const Series = Router();

Series.post("/", checkPermission("fcreate", 4), handleCreateSeries);
Series.get("/", checkPermission("fread", 4), handleGetSeries);
Series.delete("/:id", checkPermission("fdelete", 4), handleDeleteSeries);
Series.patch("/:id", checkPermission("fupdate", 4), handleUpdateSeries);

Series.get("/:id", checkPermission("fread", [4, 15]), handleGetDetailSeries);
Series.get("/create/:id", checkPermission("fread", [4]), handleGetSeriesByID);
Series.get("/:id/questions-available", checkPermission("fread", 4), handleGetAvailableQuestionForSeries);
Series.delete("/:id/questions/:questionId", checkPermission("fdelete", 4), handleDeleteQuestionFromSeries);

export default Series;
