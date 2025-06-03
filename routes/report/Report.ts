import { Router } from "express";
import {
  handleCreateReportForBatch,
  handleDownloadBatchReport,
  handleGetAssesseeListForReport,
  handleGetBatchInformationForReport,
  handleGetReportDesignDetail,
  handleGetReportGuide,
  handleReportPersonal,
  handleReportPreview,
  handleStoreReportGuide,
  handleUpdateReportDesign,
  handleUpdateReportGuide,
  handleUploadReportPDF,
} from "@/controllers/report/ReportController.js";
import { PDFController } from "@/controllers/report/PDFController.js";
import { uploadSingleFile } from "@/middleware/fileMiddleware.js";

const Report = Router();

Report.get("/preview", handleReportPreview);
Report.post("/guide", handleStoreReportGuide);
Report.get("/guide", handleGetReportGuide);
Report.post("/pdf", uploadSingleFile, handleUploadReportPDF);
Report.post("/result", handleReportPersonal);
Report.post("/design", handleCreateReportForBatch);
Report.get("/personal/:id", handleGetAssesseeListForReport);
Report.put("/guide/:id", handleUpdateReportGuide);
Report.get("/design/:batchId", handleGetReportDesignDetail);
Report.patch("/design/:batchId", handleUpdateReportDesign);
Report.get("/template/:batchId", handleGetBatchInformationForReport);
Report.get("/pdfgen", PDFController.RenderPDF);
Report.get("/:batchId", handleDownloadBatchReport);
export default Report;
