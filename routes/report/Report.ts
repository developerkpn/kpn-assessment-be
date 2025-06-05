import { Router } from "express";
import {
  handleCreateReportForBatch,
  handleDownloadBatchReport,
  handleGetAssesseeListForReport,
  handleGetBatchForReport,
  handleGetBatchInformationForReport,
  // handleGetImageProctoring,
  // handleGetReportDesignDetail,
  handleGetReportGuide,
  handleReportPersonal,
  handleStoreReportGuide,
  handleUpdateReportDesign,
  handleUpdateReportGuide,
  handleUploadReportPDF,
} from "@/controllers/report/ReportController.js";
import { uploadSingleFile } from "@/middleware/fileMiddleware.js";
import ProctoringController from "@/controllers/transaction/ProctoringController.js";
import { PDFController } from "@/controllers/report/PDFController.js";

const Report = Router();

Report.post("/guide", handleStoreReportGuide);
Report.get("/guide", handleGetReportGuide);
Report.post("/pdf", uploadSingleFile, handleUploadReportPDF);
Report.post("/result", handleReportPersonal);
Report.post("/design", handleCreateReportForBatch);
Report.get("/proctoring", ProctoringController.GetFile);
Report.get("/", handleGetBatchForReport);
Report.get("/personal/:id", handleGetAssesseeListForReport);
Report.put("/guide/:id", handleUpdateReportGuide);
// Report.get("/design/:batchId", handleGetReportDesignDetail);
Report.patch("/design/:reportId", handleUpdateReportDesign);
Report.get("/template/:batchId", handleGetBatchInformationForReport);
Report.get("/pdfgen", PDFController.RenderPDF);
Report.get("/:batchId", handleDownloadBatchReport);
export default Report;
