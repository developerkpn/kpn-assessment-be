import fs from "fs";
import { pipeline } from "stream/promises";
import { NextFunction, Request, Response } from "express";
import { ResponseError } from "@/error/response-error.js";
import { Validation } from "@/validation/Validation.js";
import { ACReportValidation } from "@/validation/ACReportValidation.js";
import {
  createACReport,
  deleteACReport,
  getACMasterMetadata,
  getACReportById,
  listACReports,
  updateACReport,
} from "@/models/report/ACReportModel.js";
import {
  ensureACReportPDFFile,
  syncACReportToTMP,
  TMPSyncResult,
} from "@/services/tmp/TMPIntegrationService.js";
import { getDarwinUser } from "@/models/BatchModel.js";

const getRequestOrigin = (req: Request): string => {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto =
    typeof forwardedProto === "string" && forwardedProto.trim()
      ? forwardedProto.split(",")[0].trim()
      : req.protocol || "http";

  const forwardedHost = req.headers["x-forwarded-host"];
  const host =
    typeof forwardedHost === "string" && forwardedHost.trim()
      ? forwardedHost.split(",")[0].trim()
      : req.get("host") || "";

  return host ? `${proto}://${host}` : "";
};

const formatSaveMessage = (
  actionWord: "disimpan" | "diperbarui",
  status: string,
  tmpResult: TMPSyncResult | null
): string => {
  if (status !== "Completed") {
    return `Draft Report AC berhasil ${actionWord}`;
  }
  if (tmpResult?.sync_status === "Synced") {
    return `Report AC berhasil ${actionWord} & otomatis terkirim ke sistem TMP`;
  }
  if (tmpResult?.sync_status === "Pending") {
    return `Report AC berhasil ${actionWord} (status TMP Pending: menunggu konfigurasi TMP_API_URL pada server)`;
  }
  return `Report AC berhasil ${actionWord} (sinkronisasi TMP gagal, silakan klik Retry)`;
};

export const handleGetACMaster = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = getACMasterMetadata();
    res.status(200).send({
      message: "Success get Assessment Center master data",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const handleLookupACAssesseeDarwin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nik = String(req.params.nik || "").trim();
    if (!nik) {
      throw new ResponseError(400, "NIK wajib diisi");
    }
    const result = await getDarwinUser(nik);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const handleListACReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await listACReports({
      role_name: req.userDecode?.role_name,
      user_id: req.userDecode?.user_id,
    });
    res.status(200).send({
      message: "Success get Assessment Center reports",
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetACReportDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await getACReportById(req.params.id);
    if (!report) {
      throw new ResponseError(404, "Report Assessment Center tidak ditemukan");
    }
    res.status(200).send({
      message: "Success get Assessment Center report detail",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const handleCreateACReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = Validation.validate(ACReportValidation.UPSERT, req.body);
    let report = await createACReport(validated, req.userDecode?.user_id ?? null);

    let tmpResult: TMPSyncResult | null = null;
    if (report.status === "Completed") {
      tmpResult = await syncACReportToTMP(report, {
        requestBaseUrl: getRequestOrigin(req),
      });
      report = (await getACReportById(report.id)) ?? report;
    }

    res.status(201).send({
      message: formatSaveMessage("disimpan", report.status, tmpResult),
      data: report,
      tmp_sync: tmpResult,
    });
  } catch (error) {
    next(error);
  }
};

export const handleUpdateACReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = Validation.validate(ACReportValidation.UPSERT, req.body);
    let report = await updateACReport(req.params.id, validated, req.userDecode?.user_id ?? null);
    if (!report) {
      throw new ResponseError(404, "Report Assessment Center tidak ditemukan");
    }

    const skipTmpSync =
      req.query.skip_tmp_sync === "1" || req.query.skip_tmp_sync === "true";

    let tmpResult: TMPSyncResult | null = null;
    if (report.status === "Completed" && !skipTmpSync) {
      tmpResult = await syncACReportToTMP(report, {
        requestBaseUrl: getRequestOrigin(req),
      });
      report = (await getACReportById(report.id)) ?? report;
    }

    res.status(200).send({
      message: skipTmpSync
        ? "Perubahan Report AC berhasil diperbarui"
        : formatSaveMessage("diperbarui", report.status, tmpResult),
      data: report,
      tmp_sync: tmpResult,
    });
  } catch (error) {
    next(error);
  }
};

export const handleDeleteACReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await deleteACReport(req.params.id);
    if (!deleted) {
      throw new ResponseError(404, "Report Assessment Center tidak ditemukan");
    }
    res.status(200).send({
      message: "Report Assessment Center berhasil dihapus",
    });
  } catch (error) {
    next(error);
  }
};

export const handleRetrySyncTMP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await getACReportById(req.params.id);
    if (!report) {
      throw new ResponseError(404, "Report Assessment Center tidak ditemukan");
    }
    if (report.status !== "Completed") {
      throw new ResponseError(
        400,
        "Hanya Report AC berstatus Completed yang dapat dikirim ke sistem TMP"
      );
    }

    const tmpResult = await syncACReportToTMP(report, {
      requestBaseUrl: getRequestOrigin(req),
    });
    const updated = await getACReportById(report.id);

    if (tmpResult.sync_status === "Pending") {
      throw new ResponseError(
        400,
        tmpResult.error_message ||
          "Endpoint TMP (TMP_API_URL) belum dikonfigurasi pada server"
      );
    }

    if (tmpResult.sync_status === "Failed") {
      throw new ResponseError(502, tmpResult.error_message || "Gagal mengirim ke sistem TMP");
    }

    res.status(200).send({
      message: `Report ${report.assessee_name} berhasil terkirim ke sistem TMP`,
      data: updated,
      tmp_sync: tmpResult,
    });
  } catch (error) {
    next(error);
  }
};

export const handleDownloadACReportPDF = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const report = await getACReportById(req.params.id);
    if (!report) {
      throw new ResponseError(404, "Report Assessment Center tidak ditemukan");
    }

    const { filePath, filename } = await ensureACReportPDFFile(report);

    const disposition = req.query.inline === "1" ? "inline" : "attachment";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `${disposition}; filename="${filename}"`);

    await pipeline(fs.createReadStream(filePath), res);
  } catch (error) {
    next(error);
  }
};
