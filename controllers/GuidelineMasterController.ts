import GuidelineMasterModel from "@/models/GuidelineMasterModel.js";
import { NextFunction, Request, Response } from "express";
import { IncomingForm } from "formidable";
import fspromise from "fs/promises";

const GuidelineMasterController = {
  HandleGetGuideline: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { is_all } = req.query;
      const result = await GuidelineMasterModel.GetGuideline({ is_all: (is_all ?? true) as boolean });
      res.status(200).send({
        data: result,
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
  HandleGetDefaultGuideline: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file_path = await GuidelineMasterModel.GetDefaultFileGuideline();
      res.setHeader("content-type", "application/pdf");
      res.status(200).sendFile(file_path);
      return;
    } catch (error) {
      next(error);
    }
  },
  HandleGetFileGuideline: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { file_id } = req.params;
      const file_path = await GuidelineMasterModel.GetFileGuideline(file_id);
      res.setHeader("content-type", "application/pdf");
      res.status(200).sendFile(file_path);
      return;
    } catch (error) {
      next(error);
    }
  },
  HandleUploadGuideline: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userdata = req.userDecode;
      if (!userdata?.user_id) {
        throw new Error("Unauthorized");
      }
      const formdata = new IncomingForm();
      const [fields, files] = await formdata.parse(req);
      console.log(files);
      if (!files?.guideline) {
        throw new Error("No file uploaded");
      }
      const filename = files?.guideline?.[0].originalFilename as string;

      if (!filename.match(/\.(pdf)$/i)) {
        throw new Error("Permitted file type (pdf only)");
      }
      const file = await fspromise.readFile(files?.guideline?.[0].filepath as string);
      const result = await GuidelineMasterModel.UploadGuideline({ file, filename, user_id: userdata?.user_id || "" });
      res.status(200).send({
        message: "Guideline successfully uploaded",
        data: result,
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
  HandleSelectGuideline: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id_file } = req.body;
      const result = await GuidelineMasterModel.SelectGuideline({ id_file });
      res.status(200).send({
        message: "Successfully select guideline",
        data: result,
      });
      return;
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
  HandleDeleteGuideline: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id_file } = req.body;
      const result = await GuidelineMasterModel.DeleteGuideline({ id_file });
      res.status(200).send({
        message: "Successfully delete guideline",
        data: result,
      });
      return;
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
};

export default GuidelineMasterController;
