import { Router } from "express";
import {
  handleCreateReportForBatch,
  handleDownloadBatchReport,
  handleGetBatchInformationForReport,
  handleGetReportDesignDetail,
  handleGetReportGuide,
  handleReportPersonal,
  handleReportPreview,
  handleStoreReportGuide,
  handleUpdateReportDesign,
  handleUpdateReportGuide,
  handleUploadReportPDF,
} from "#dep/controllers/report/ReportController";

const Report = Router();

Report.get("/preview", handleReportPreview);
Report.post("/guide", handleStoreReportGuide);
Report.get("/guide", handleGetReportGuide);
Report.post("/pdf", handleUploadReportPDF);
Report.post("/result", handleReportPersonal);
Report.post("/design", handleCreateReportForBatch);
Report.put("/guide/:id", handleUpdateReportGuide);
Report.get("/design/:batchId", handleGetReportDesignDetail);
Report.patch("/design/:batchId", handleUpdateReportDesign);
Report.get("/template/:batchId", handleGetBatchInformationForReport);
Report.get("/:batchId", handleDownloadBatchReport);
export default Report;
