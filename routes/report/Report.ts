import { Router } from "express";
import {
  handleCreateReportForBatch,
  handleDownloadBatchReport,
  handleGetAssesseeListForReport,
  handleGetBatchForReport,
  handleGetBatchInformationForReport,
  // handleGetImageProctoring,
  handleGetReportDesignDetail,
  handleGetReportGuide,
  handleReportPersonal,
  handleReportPreview,
  handleStoreReportGuide,
  handleUpdateReportDesign,
  handleUpdateReportGuide,
  handleUploadReportPDF,
} from "#dep/controllers/report/ReportController";
import { uploadSingleFile } from "#dep/middleware/fileMiddleware";
import ProctoringController from "#dep/controllers/transaction/ProctoringController";

const Report = Router();

Report.get("/preview", handleReportPreview);
Report.post("/guide", handleStoreReportGuide);
Report.get("/guide", handleGetReportGuide);
Report.post("/pdf", uploadSingleFile, handleUploadReportPDF);
Report.post("/result", handleReportPersonal);
Report.post("/design", handleCreateReportForBatch);
Report.get("/proctoring", ProctoringController.GetFile);
Report.get("/", handleGetBatchForReport);
Report.get("/personal/:id", handleGetAssesseeListForReport);
Report.put("/guide/:id", handleUpdateReportGuide);
Report.get("/design/:batchId", handleGetReportDesignDetail);
Report.patch("/design/:reportId", handleUpdateReportDesign);
Report.get("/template/:batchId", handleGetBatchInformationForReport);
Report.get("/:batchId", handleDownloadBatchReport);
export default Report;
