import { Router } from "express";
import {
  handleCreateReportForBatch,
  handleDownloadBatchReport,
  handleGetBatchInformationForReport,
  handleGetReportDesignDetail,
  handleGetReportGuide,
  handleUpdateReportDesign,
  handleUpdateReportGuide,
} from "#dep/controllers/report/ReportController";

const Report = Router();

Report.put("/guide", handleUpdateReportGuide);
Report.get("/guide", handleGetReportGuide);
Report.post("/design", handleCreateReportForBatch);
Report.get("/design/:batchId", handleGetReportDesignDetail);
Report.patch("/design/:batchId", handleUpdateReportDesign);
Report.get("/template/:batchId", handleGetBatchInformationForReport);
Report.get("/:batchId", handleDownloadBatchReport);
Report.get("/result/:assesseeId");
export default Report;
