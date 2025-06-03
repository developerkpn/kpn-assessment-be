import { generateBusinessReport } from "./DocumentBuilder.js";
import { TryRenderPDF } from "@/models/report/ReactPDFTemplate.js";

const PDFModel = {
  renderPdf: async () => {
    return TryRenderPDF();
  },
};

export default PDFModel;
