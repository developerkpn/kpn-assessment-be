import PDFModel from "@/models/report/PDFModel.js";
import { generateBulkReportIndividual, getBatchReportData } from "@/models/report/ReportModel.js";
import { NextFunction, Request, Response } from "express";
import { checkGenerate, storeReportPDF } from "@/models/report/ReportModel.js";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { getBatchAssesses } from "@/models/BatchModel.js";
import { getAssesseeExternalProfile } from "@/models/transactions/AssesseeModel.js";
import { findProfilePhotoMtime } from "@/helper/profilePhoto.js";

// Cari mtime terbaru foto profil assessee. assessee_nik batch eksternal bukan id
// mst_user_extern, jadi id hasil lookup by email ikut dicek. Null jika tidak ada foto.
const getLatestProfilePhotoMtime = async (assesseeId: string, assesseeEmail?: string): Promise<Date | null> => {
  const photoIds = [assesseeId];
  if (assesseeEmail) {
    try {
      const extern = await getAssesseeExternalProfile(assesseeEmail);
      if (extern?.id && !photoIds.includes(extern.id)) photoIds.push(extern.id);
    } catch (e) {
      console.error("extern lookup for photo mtime failed:", e);
    }
  }
  let latest: Date | null = null;
  for (const id of photoIds) {
    const mtime = findProfilePhotoMtime(id);
    if (mtime && (!latest || mtime > latest)) latest = mtime;
  }
  return latest;
};

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
      const { batch_id, assessee_id } = req.query;

      if (!batch_id || !assessee_id) {
        res.status(400).json({
          message: "Missing 'batch_id', 'assessee_id' query",
        });
      }

      //get assessee name
      const assessee_data = await getBatchAssesses(batch_id as string, assessee_id as string);
      const filename = `${assessee_data[0].assessee_name}_${assessee_id}_PotentialAssessment.pdf`;
      const filePath = path.join(process.cwd(), "uploads", "report", batch_id as string, filename);
      const uploadDir = path.join(process.cwd(), "uploads", "report", batch_id as string);

      const status = await checkGenerate(batch_id as string, assessee_id as string);
      const isGenerated = status?.is_generate;

      // 🔁 Jika sudah tersedia dan tidak ingin generate ulang.
      // Cache dilewati jika foto profil lebih baru dari PDF tersimpan
      // (kasus: report sempat digenerate sebelum kandidat upload/ganti foto)
      if (isGenerated && fs.existsSync(filePath)) {
        const pdfMtime = fs.statSync(filePath).mtime;
        const photoMtime = await getLatestProfilePhotoMtime(
          assessee_id as string,
          req.query.assessee_email as string | undefined
        );
        const cacheStale = photoMtime !== null && photoMtime > pdfMtime;

        if (!cacheStale) {
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

          await pipeline(fs.createReadStream(filePath), res);

          return;
        }
        console.log(`Cached PDF stale (photo newer), regenerating: ${filename}`);
      }

      // 🔄 Render ulang PDF
      const streampdf = await PDFModel.renderReport(batch_id as string, assessee_id as string);

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Jika sudah ada file lama, hapus
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      const writeStream = fs.createWriteStream(filePath);

      // 📦 Pipe PDF hasil render ke file dan juga ke response
      await pipeline(streampdf, writeStream);

      // Simpan metadata ke DB
      await storeReportPDF(
        {
          is_generate: true,
          report_path: `${batch_id}/${filename}`,
        },
        batch_id as string,
        assessee_id as string
      );

      // 📤 Setelah disimpan, kirim sebagai response
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

      await pipeline(fs.createReadStream(filePath), res);
    } catch (error) {
      console.log("error", error);
      const { batch_id, assessee_id } = req.query;
      const message = (error as Error).message;

      // Simpan error generate
      await storeReportPDF(
        {
          is_generate: false,
          error_generate: message,
        },
        batch_id as string,
        assessee_id as string
      );

      res.status(500).json({ message });
    }
  },

  GetDataReportBulk: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { batch_id, assessee_id } = req.body;
      const { streamdata, folder_path, zip_name } = await generateBulkReportIndividual(batch_id, assessee_id);
      // const result = await generateBulkReportIndividual(batch_id, assessee_id);
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-disposition", `attachment; filename=${zip_name}`);
      // res.status(200).send({
      //   data: folder_path,
      // });

      streamdata.on("close", () => {
        console.log("Stream end");
        fs.unlinkSync(folder_path);
        return;
      });

      streamdata.on("error", (error) => {
        fs.unlinkSync(folder_path);
        throw error;
      });

      streamdata.pipe(res);
    } catch (error) {
      next(error);
    }
  },

  // RenderReport: async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const { batch_id, assessee_id, assessee_email } = req.query;
  //     const streampdf = await PDFModel.renderReport(
  //       batch_id as string,
  //       assessee_id as string,
  //       assessee_email as string
  //     );
  //
  //     const filePath = path.join(process.cwd(), "uploads", "report", batch_id as string, `${assessee_id}.pdf`);
  //     const uploadDir = path.join(process.cwd(), "uploads", "report", batch_id as string);
  //
  //     if (!fs.existsSync(uploadDir)) {
  //       fs.mkdirSync(uploadDir, { recursive: true });
  //     }
  //
  //     if (fs.existsSync(filePath)) {
  //       fs.unlinkSync(filePath);
  //     }
  //
  //     const writeStream = fs.createWriteStream(filePath);
  //     streampdf.pipe(writeStream);
  //
  //     writeStream.on("finish", async () => {
  //       const report = {
  //         is_generate: true,
  //         report_path: `${batch_id}/${assessee_id}.pdf`,
  //       };
  //       await storeReportPDF(report, batch_id as string, assessee_id as string);
  //     });
  //
  //     res.setHeader("Content-Type", "application/pdf");
  //     res.setHeader("Content-Disposition", `attachment; filename="${assessee_id}.pdf"`);
  //     const fileStream = fs.createReadStream(filePath);
  //     fileStream.pipe(res);
  //   } catch (error) {
  //     // const errorReport = {
  //     //   is_generate: false,
  //     //   error_message: (error as Error).message,
  //     // };
  //     // // await storeReportPDF(errorReport, batch_id as string, assessee_id as string);
  //     res.status(500).send({
  //       message: (error as Error).message,
  //     });
  //   }
  // },

  // RenderReport: async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const { batch_id, assessee_id, assessee_email } = req.query;
  //
  //     const status: any = await checkGenerate(batch_id as string, assessee_id as string);
  //     const filePath = path.join(process.cwd(), "uploads", "report", batch_id as string, `${assessee_id}.pdf`);
  //     const uploadDir = path.join(process.cwd(), "uploads", "report", batch_id as string);
  //
  //     if (status.is_generate && fs.existsSync(filePath)) {
  //       res.setHeader("Content-Type", "application/pdf");
  //       res.setHeader("Content-Disposition", `attachment; filename="${assessee_id}.pdf"`);
  //       const fileStream = fs.createReadStream(filePath);
  //       fileStream.pipe(res);
  //     }
  //
  //     console.log("error coy", status.error_message);
  //
  //     if (status.error_message) {
  //       res.status(400).send({
  //         message: status.error_message,
  //       });
  //     }
  //
  //     if (status.is_generate === false && !status.error_message) {
  //       res.status(200).send({
  //         message: "Report is being generated, please try again in a few moments.",
  //       });
  //
  //       setImmediate(async () => {
  //         try {
  //           const streampdf = await PDFModel.renderReport(
  //             batch_id as string,
  //             assessee_id as string,
  //             assessee_email as string
  //           );
  //
  //           if (!fs.existsSync(uploadDir)) {
  //             fs.mkdirSync(uploadDir, { recursive: true });
  //           }
  //
  //           if (fs.existsSync(filePath)) {
  //             fs.unlinkSync(filePath);
  //           }
  //
  //           const writeStream = fs.createWriteStream(filePath);
  //           streampdf.pipe(writeStream);
  //
  //           writeStream.on("finish", async () => {
  //             const report = {
  //               is_generate: true,
  //               report_path: `${batch_id}/${assessee_id}.pdf`,
  //             };
  //             await storeReportPDF(report, batch_id as string, assessee_id as string);
  //           });
  //         } catch (error: any) {
  //           console.log("ada error", error);
  //           const errorReport = {
  //             is_generate: false,
  //             error_message: (error as Error).message,
  //           };
  //           await storeReportPDF(errorReport, batch_id as string, assessee_id as string);
  //         }
  //       });
  //     }
  //   } catch (error) {
  //     res.status(500).send({
  //       message: (error as Error).message,
  //     });
  //   }
  // },
};
