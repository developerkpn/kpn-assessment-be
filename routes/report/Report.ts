import { Router } from "express";
import {
  handleCreateReportForBatch,
  handleDownloadBatchReport,
  handleGetBatchInformationForReport,
  handleGetReportDesignDetail,
  handleGetReportGuide,
  handleReportPersonal,
  handleReportPreview,
  handleUpdateReportDesign,
  handleUpdateReportGuide,
} from "#dep/controllers/report/ReportController";

const Report = Router();

Report.get("/preview", handleReportPreview);
Report.put("/guide", handleUpdateReportGuide);
Report.get("/guide", handleGetReportGuide);
Report.post("/result", handleReportPersonal);
Report.post("/design", handleCreateReportForBatch);
Report.get("/design/:batchId", handleGetReportDesignDetail);
Report.patch("/design/:batchId", handleUpdateReportDesign);
Report.get("/template/:batchId", handleGetBatchInformationForReport);
Report.get("/:batchId", handleDownloadBatchReport);
export default Report;
