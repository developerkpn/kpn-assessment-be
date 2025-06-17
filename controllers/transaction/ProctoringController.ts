import ProctoringModel from "@/models/transactions/ProctoringModel.js";
import { Request, Response, NextFunction } from "express";
import { IncomingForm } from "formidable";
import fs from "fs";

const ProctoringController = {
  CheckS3Storage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ProctoringModel.checkS3Storage();
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  },
  GetFile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filepath = req.query.path;
      const stream = await ProctoringModel.GetFile(filepath as string);

      // Set headers untuk image
      res.setHeader("Content-Disposition", `inline; filename="${stream.filename}"`);
      res.setHeader("Content-Type", "image/png"); // atau sesuai dengan format image Anda

      // Pipe stream ke response
      stream.stream.pipe(res);
    } catch (error) {
      console.error(error);
      res.status(500).send({
        message: (error as Error).message,
      });
    }
  },
  UploadFileProctoring: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const formdata = new IncomingForm();
      const [fields, files] = await formdata.parse(req);
      const batch_id = fields?.batch_id as [string];
      const subtest_id = fields?.subtest_id as [string];
      const user_id = fields?.user_id as [string];
      console.log("user_id proc", user_id);
      const screen = fs.readFileSync(files?.screen?.[0].filepath as string);
      const webcam = fs.readFileSync(files?.webcam?.[0].filepath as string);
      if (!(batch_id[0] && subtest_id[0] && user_id[0])) {
        throw new Error("Outbound Request");
      }
      if (!(screen && webcam)) {
        throw new Error("File is not provided");
      }

      let result_screen;
      let result_webcam;

      result_screen = await ProctoringModel.UploadFile(batch_id[0], user_id[0], subtest_id[0], screen, "screen");
      result_webcam = await ProctoringModel.UploadFile(batch_id[0], user_id[0], subtest_id[0], webcam, "webcam");
      res.status(200).send({ result_screen, result_webcam });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        message: (error as Error).message,
      });
    }
  },
};

export default ProctoringController;
