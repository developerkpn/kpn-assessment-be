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
  RenderReport: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { batch_id, assessee_id, assessee_email } = req.query;
      const streampdf = await PDFModel.renderReport(
        batch_id as string,
        assessee_id as string,
        assessee_email as string
      );
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
