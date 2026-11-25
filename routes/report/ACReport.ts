import { NextFunction, Request, Response, Router } from "express";
import { db } from "@/config/connection.js";
import { checkPermission, isAuth } from "@/middleware/auth.js";
import { errorMiddleware } from "@/middleware/errorMiddleware.js";
import {
  handleCreateACReport,
  handleDeleteACReport,
  handleDownloadACReportPDF,
  handleGetACMaster,
  handleGetACReportDetail,
  handleListACReports,
  handleLookupACAssesseeDarwin,
  handleRetrySyncTMP,
  handleUpdateACReport,
} from "@/controllers/report/ACReportController.js";
import {
  verifyACPdfAccessToken,
  verifyTMPServiceApiKey,
} from "@/services/tmp/TMPIntegrationService.js";

const ACReport = Router();

let cachedACMenuId: number | null = null;

const getACMenuIds = async (): Promise<number[]> => {
  if (cachedACMenuId !== null) {
    return [cachedACMenuId, 17];
  }
  const client = await db.connect();
  try {
    const res = await client.query(
      `SELECT id FROM public.mst_menu WHERE path = '/admin/report-ac' LIMIT 1`
    );
    if (res.rows[0]?.id) {
      cachedACMenuId = Number(res.rows[0].id);
      return [cachedACMenuId, 17];
    }
  } catch (err) {
    console.error("getACMenuIds lookup warning:", err);
  } finally {
    client.release();
  }
  return [17];
};

const checkACPerm =
  (action: "fcreate" | "fread" | "fupdate" | "fdelete") =>
  async (req: Request, res: Response, next: NextFunction) => {
    const menuIds = await getACMenuIds();
    return checkPermission(action, menuIds)(req, res, next);
  };

/**
 * Mengizinkan unduhan PDF bagi:
 * 1) Sistem/user TMP yang membawa signed token HMAC valid (?access_token=...) khusus report :id, ATAU
 * 2) Server TMP yang membawa header x-api-key valid sesuai TMP_API_KEY, ATAU
 * 3) Admin KOAP yang sedang login (isAuth + checkPermission fread).
 */
const verifyACPdfAccess = async (req: Request, res: Response, next: NextFunction) => {
  const reportId = String(req.params.id || "").trim();
  const queryToken =
    typeof req.query.access_token === "string" ? req.query.access_token : "";
  const apiKeyHeader =
    typeof req.headers["x-api-key"] === "string" ? req.headers["x-api-key"] : "";

  if (reportId && queryToken && verifyACPdfAccessToken(reportId, queryToken)) {
    return next();
  }

  if (apiKeyHeader && verifyTMPServiceApiKey(apiKeyHeader)) {
    return next();
  }

  return isAuth(req, res, (authErr?: any) => {
    if (authErr) return next(authErr);
    return checkACPerm("fread")(req, res, next);
  });
};

ACReport.get("/master", isAuth, checkACPerm("fread"), handleGetACMaster, errorMiddleware);
ACReport.get(
  "/darwin/:nik",
  isAuth,
  checkACPerm("fread"),
  handleLookupACAssesseeDarwin,
  errorMiddleware
);
ACReport.get("/", isAuth, checkACPerm("fread"), handleListACReports, errorMiddleware);
ACReport.get("/:id/pdf", verifyACPdfAccess, handleDownloadACReportPDF, errorMiddleware);
ACReport.get("/:id", isAuth, checkACPerm("fread"), handleGetACReportDetail, errorMiddleware);
ACReport.post("/", isAuth, checkACPerm("fcreate"), handleCreateACReport, errorMiddleware);
ACReport.put("/:id", isAuth, checkACPerm("fupdate"), handleUpdateACReport, errorMiddleware);
ACReport.patch("/:id", isAuth, checkACPerm("fupdate"), handleUpdateACReport, errorMiddleware);
ACReport.delete("/:id", isAuth, checkACPerm("fdelete"), handleDeleteACReport, errorMiddleware);
ACReport.post(
  "/:id/sync-tmp",
  isAuth,
  checkACPerm("fupdate"),
  handleRetrySyncTMP,
  errorMiddleware
);

export default ACReport;
