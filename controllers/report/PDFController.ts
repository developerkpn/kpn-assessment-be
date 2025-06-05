import PDFModel from "@/models/report/PDFModel.js";
import { NextFunction, Request, Response } from "express";

export const PDFController = {
  RenderPDF: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const streampdf = await PDFModel.renderPdf();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="document.pdf"');
      streampdf.pipe(res);
    } catch (error) {
      console.error(error);
      res.status(500).send({
        message: (error as Error).message,
      });
    }
  },
};
