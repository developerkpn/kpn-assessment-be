import { NextFunction, Request, Response } from "express";
import { IncomingForm } from "formidable";
import fspromise from "fs/promises";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { VendorAssessmentModel } from "@/models/VendorAssessmentModel.js";
import { ResponseError } from "@/error/response-error.js";

const uploadDirectory = path.join(process.cwd(), "uploads/vendor-assessments");

// Ensure upload directory exists
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const getField = (field: any): string | undefined => {
  if (Array.isArray(field)) return field[0];
  return field;
};

const toBool = (val: any): boolean => {
  return val === true || val === "true" || val === 1 || val === "1";
};

export const VendorAssessmentController = {
  handleGetAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const search = req.query.search as string | undefined;
      const data = await VendorAssessmentModel.getAll(search);
      res.status(200).json({
        status: "success",
        message: "Vendor assessments fetched successfully",
        data,
      });
    } catch (error) {
      console.error("Error fetching vendor assessments:", error);
      next(error);
    }
  },

  handleGetById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = await VendorAssessmentModel.getById(id);
      if (!data) {
        throw new ResponseError(404, "Vendor assessment not found");
      }
      res.status(200).json({
        status: "success",
        data,
      });
    } catch (error) {
      console.error("Error fetching vendor assessment by ID:", error);
      next(error);
    }
  },

  handleUpload: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const form = new IncomingForm({
        uploadDir: uploadDirectory,
        keepExtensions: true,
        maxFileSize: 50 * 1024 * 1024, // 50MB
      });

      const [fields, files] = await form.parse(req);
      const uploadedFile = files?.file ? (Array.isArray(files.file) ? files.file[0] : files.file) : null;

      if (!uploadedFile) {
        throw new ResponseError(400, "Report file is required (PDF/document)");
      }

      const originalFilename = uploadedFile.originalFilename || "vendor_report.pdf";
      const ext = path.extname(originalFilename).toLowerCase();
      if (ext !== ".pdf") {
        // Clean up temp file
        if (fs.existsSync(uploadedFile.filepath)) {
          fs.unlinkSync(uploadedFile.filepath);
        }
        throw new ResponseError(400, "Only PDF files are permitted for vendor report upload");
      }

      // Generate a clean target filename
      const safeFilename = `${Date.now()}_${uuidv4().substring(0, 8)}_${originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const targetFilePath = path.join(uploadDirectory, safeFilename);

      // Rename from temp formidable path to target path
      await fspromise.rename(uploadedFile.filepath, targetFilePath);

      // Support either JSON string in fields.data or individual form fields
      let parsedData: any = {};
      if (fields?.data) {
        try {
          parsedData = JSON.parse(getField(fields.data) || "{}");
        } catch {
          parsedData = {};
        }
      }

      const participant_name = parsedData.participant_name || getField(fields?.participant_name);
      const participant_email = parsedData.participant_email || getField(fields?.participant_email);
      const participant_nik = parsedData.participant_nik || getField(fields?.participant_nik);
      const vendor_name = parsedData.vendor_name || getField(fields?.vendor_name);
      const assessment_date = parsedData.assessment_date || getField(fields?.assessment_date) || new Date().toISOString().split("T")[0];

      if (!participant_name || !participant_email || !vendor_name) {
        throw new ResponseError(400, "participant_name, participant_email, and vendor_name are required");
      }

      const has_critical_thinking = toBool(parsedData.has_critical_thinking ?? getField(fields?.has_critical_thinking));
      const critical_thinking_score = parsedData.critical_thinking_score ?? getField(fields?.critical_thinking_score);
      const critical_thinking_category = parsedData.critical_thinking_category ?? getField(fields?.critical_thinking_category);

      const has_work_endurance = toBool(parsedData.has_work_endurance ?? getField(fields?.has_work_endurance));
      const work_endurance_score = parsedData.work_endurance_score ?? getField(fields?.work_endurance_score);
      const work_endurance_category = parsedData.work_endurance_category ?? getField(fields?.work_endurance_category);

      const has_growth_mindset = toBool(parsedData.has_growth_mindset ?? getField(fields?.has_growth_mindset));
      const growth_mindset_score = parsedData.growth_mindset_score ?? getField(fields?.growth_mindset_score);
      const growth_mindset_category = parsedData.growth_mindset_category ?? getField(fields?.growth_mindset_category);

      const notes = parsedData.notes ?? getField(fields?.notes);
      const user = req.userDecode;

      const record = await VendorAssessmentModel.create({
        participant_name,
        participant_email,
        participant_nik: participant_nik || null,
        vendor_name,
        assessment_date,
        has_critical_thinking,
        critical_thinking_score: critical_thinking_score || null,
        critical_thinking_category: critical_thinking_category || null,
        has_work_endurance,
        work_endurance_score: work_endurance_score || null,
        work_endurance_category: work_endurance_category || null,
        has_growth_mindset,
        growth_mindset_score: growth_mindset_score || null,
        growth_mindset_category: growth_mindset_category || null,
        file_name: safeFilename,
        file_original_name: originalFilename,
        file_path: targetFilePath,
        file_size: uploadedFile.size,
        mime_type: uploadedFile.mimetype || "application/pdf",
        notes: notes || null,
        created_by: user?.user_id || "admin",
      });

      res.status(201).json({
        status: "success",
        message: "Vendor assessment report uploaded and saved successfully",
        data: record,
      });
    } catch (error) {
      console.error("Error uploading vendor assessment:", error);
      next(error);
    }
  },

  handleGetFile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const record = await VendorAssessmentModel.getById(id);
      if (!record) {
        throw new ResponseError(404, "Vendor assessment not found");
      }

      if (!fs.existsSync(record.file_path)) {
        throw new ResponseError(404, "Report file not found on server storage");
      }

      res.setHeader("Content-Type", record.mime_type || "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${record.file_original_name}"`);
      res.status(200).sendFile(record.file_path);
    } catch (error) {
      console.error("Error viewing vendor report file:", error);
      next(error);
    }
  },

  handleDownloadFile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const record = await VendorAssessmentModel.getById(id);
      if (!record) {
        throw new ResponseError(404, "Vendor assessment not found");
      }

      if (!fs.existsSync(record.file_path)) {
        throw new ResponseError(404, "Report file not found on server storage");
      }

      res.download(record.file_path, record.file_original_name);
    } catch (error) {
      console.error("Error downloading vendor report file:", error);
      next(error);
    }
  },

  handleDelete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const deleted = await VendorAssessmentModel.delete(id);
      if (!deleted) {
        throw new ResponseError(404, "Vendor assessment not found");
      }

      if (deleted.file_path && fs.existsSync(deleted.file_path)) {
        try {
          fs.unlinkSync(deleted.file_path);
        } catch (e) {
          console.warn("Failed to delete physical file:", e);
        }
      }

      res.status(200).json({
        status: "success",
        message: "Vendor assessment deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting vendor assessment:", error);
      next(error);
    }
  },
};
