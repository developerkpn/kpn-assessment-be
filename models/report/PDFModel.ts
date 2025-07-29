import react from "react";
import { generateBusinessReport } from "./DocumentBuilder.js";
import { TryRenderPDF } from "@/models/report/ReactPDFTemplate.js";
import { StreamReportPDF } from "@/models/report/ReportPDFTemplate.js";

const PDFModel = {
  renderPdf: async () => {
    return TryRenderPDF();
  },
  renderReport: async (batchId: string, assesseeId: string) => {
    return await StreamReportPDF(batchId, assesseeId);
  },
};

export default PDFModel;
