import { Router } from "express";
import { checkPermission } from "@/middleware/auth.js";
import {
  checkIsCoverUserbyOther,
  handleCreateReportForBatch,
  handleDeleteCover,
  handleDownloadBatchReport,
  handleGetAllCover,
  handleGetAssesseeListForReport,
  handleGetAssessmentResult,
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

Report.post("/guide", checkPermission("fcreate", 17), handleStoreReportGuide);
Report.get("/guide", checkPermission("fread", 17), handleGetReportGuide);
Report.post("/pdf", checkPermission("fcreate", 17), uploadSingleFile, handleUploadReportPDF);
Report.post("/result", checkPermission("fread", 17), handleReportPersonal);
Report.get("/peruser", checkPermission("fread", 17), handleGetAssessmentResult);
Report.post("/design", checkPermission("fcreate", 17), handleCreateReportForBatch);
Report.get("/proctoring", ProctoringController.GetFile);
Report.get("/", checkPermission("fread", 17), handleGetBatchForReport);
Report.get("/personal/:id", checkPermission("fread", 17), handleGetAssesseeListForReport);
Report.put("/guide/:id", checkPermission("fupdate", 17), handleUpdateReportGuide);
// Report.get("/design/:batchId", handleGetReportDesignDetail);
Report.patch("/design/:reportId", checkPermission("fupdate", 17), handleUpdateReportDesign);
Report.get("/template/:batchId", checkPermission("fread", 17), handleGetBatchInformationForReport);
Report.post("/uploadcover", checkPermission("fcreate", 17), handleUploadCover, errorMiddleware);
Report.get("/cover/isexist", checkPermission("fread", 17), checkIsCoverUserbyOther, errorMiddleware);
Report.get("/cover/:id", checkPermission("fread", 17), handleGetCover, errorMiddleware);
Report.delete("/cover/:id", checkPermission("fdelete", 17), handleDeleteCover, errorMiddleware);
Report.get("/allcover", checkPermission("fread", 17), handleGetAllCover, errorMiddleware);
Report.get("/pdfgen", checkPermission("fread", 17), PDFController.RenderReport);
Report.post("/bulkpdfgen", checkPermission("fread", 17), PDFController.GetDataReportBulk, errorMiddleware);
Report.get("/download/:batchId", checkPermission("fread", 17), handleDownloadBatchReport, errorMiddleware);
export default Report;
