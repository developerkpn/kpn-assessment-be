import {
  handleAddQuestionToSeries,
  handleCreateSeries, handleDeleteQuestionFromSeries,
  handleDeleteSeries, handleGetDetailSeries, handleGetQuestionsList,
  handleGetSeries, handleSeriesListQuestion,
  handleUpdateSeries,
} from "#dep/controllers/SeriesController";
import { checkPermission } from "#dep/middleware/auth";
import { Router } from "express";
const Series = Router();

Series.post("/", checkPermission("fcreate", 4), handleCreateSeries);
Series.get("/", checkPermission("fread", 4), handleGetSeries);
Series.get("/questions", checkPermission("fread", 4), handleGetQuestionsList);
Series.delete("/:id", checkPermission("fdelete", 4), handleDeleteSeries);
Series.patch("/:id", checkPermission("fupdate", 4), handleUpdateSeries);
Series.get("/:id", checkPermission("fread", 4), handleGetDetailSeries);
Series.post("/:id/questions", checkPermission("fcreate", 4), handleAddQuestionToSeries);
Series.get("/:id/questions", checkPermission("fread", 4), handleSeriesListQuestion);
Series.delete("/:id/questions/:questionId", checkPermission("fdelete", 4), handleDeleteQuestionFromSeries);



export default Series;
