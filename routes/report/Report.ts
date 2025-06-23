import { Router } from "express";
import {
  handleCreateReportForBatch,
  handleDownloadBatchReport,
  handleGetAllCover,
  handleGetAssesseeListForReport,
  handleGetBatchForReport,
  handleGetBatchInformationForReport,
  handleGetCover,
  // handleGetImageProctoring,
  // handleGetReportDesignDetail,
  handleGetReportGuide,
  handleReportPersonal,
  handleStoreReportGuide,
  handleUpdateReportDesign,
  handleUpdateReportGuide,
  handleUploadCover,
  handleUploadReportPDF,
} from "@/controllers/report/ReportController.js";
import { PDFController } from "@/controllers/report/PDFController.js";
import ProctoringController from "@/controllers/transaction/ProctoringController.js";
import { uploadSingleFile } from "@/middleware/fileMiddleware.js";
import { errorMiddleware } from "@/middleware/errorMiddleware.js";

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
Report.post("/uploadcover", handleUploadCover, errorMiddleware);
Report.get("/cover/:id", handleGetCover, errorMiddleware);
Report.get("/allcover", handleGetAllCover, errorMiddleware);
Report.get("/pdfgen", PDFController.RenderReport);
Report.get("/download/:batchId", handleDownloadBatchReport);
export default Report;
