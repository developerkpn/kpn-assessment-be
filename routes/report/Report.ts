import { Router } from "express";
import {
  handleDownloadBatchReport,
  handleGetBatchInformationForReport,
} from "#dep/controllers/report/ReportController";

const Report = Router();
Report.get("/:batchId", handleDownloadBatchReport);
export default Report;
