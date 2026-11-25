import crypto from "crypto";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/config/connection.js";
import { streamACReportPDF } from "@/models/report/ACReportPDFTemplate.js";
import { updateACReportPdfPath } from "@/models/report/ACReportModel.js";
import { ACReportDetail, ACTmpSyncStatus } from "@/types/ACReportTypes.js";

export interface TMPSyncResult {
  sync_status: ACTmpSyncStatus;
  external_id: string | null;
  error_message: string | null;
  synced_at: Date | null;
}

export interface TMPSyncOptions {
  requestBaseUrl?: string;
}

const getPdfSigningSecret = (): string => {
  return (
    process.env.TMP_PDF_SIGNING_SECRET ||
    process.env.TMP_API_KEY ||
    process.env.SECRETJWT ||
    ""
  ).trim();
};

export const safeTimingEqual = (a: string, b: string): boolean => {
  if (!a || !b) return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

export const createACPdfAccessToken = (reportId: string): string => {
  const secret = getPdfSigningSecret();
  if (!secret || !reportId) return "";
  return crypto
    .createHmac("sha256", secret)
    .update(`ac-report-pdf:${reportId}`)
    .digest("hex");
};

export const verifyACPdfAccessToken = (reportId: string, token: string): boolean => {
  if (!reportId || !token) return false;
  const expected = createACPdfAccessToken(reportId);
  if (!expected) return false;
  return safeTimingEqual(token.trim(), expected);
};

export const verifyTMPServiceApiKey = (providedKey?: string): boolean => {
  const configuredKey = (process.env.TMP_API_KEY || "").trim().replace(/^Bearer\s+/i, "");
  if (!configuredKey || !providedKey) return false;
  const cleanProvided = providedKey.trim().replace(/^Bearer\s+/i, "");
  return safeTimingEqual(cleanProvided, configuredKey);
};

export const resolveKoapApiBaseUrl = (requestBaseUrl?: string): string => {
  const rawBase = (
    process.env.TMP_KOAP_API_BASE_URL ||
    process.env.API_URL ||
    requestBaseUrl ||
    process.env.APP_URL ||
    ""
  )
    .trim()
    .replace(/\/+$/, "");

  if (!rawBase) return "/api";
  return rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;
};

export const buildACReportPdfDownloadUrl = (
  reportId: string,
  requestBaseUrl?: string
): string => {
  const apiBase = resolveKoapApiBaseUrl(requestBaseUrl);
  const accessToken = createACPdfAccessToken(reportId);
  const basePath = `${apiBase}/report-ac/${encodeURIComponent(reportId)}/pdf`;
  return accessToken ? `${basePath}?access_token=${accessToken}` : basePath;
};

export const ensureACReportPDFFile = async (
  report: ACReportDetail
): Promise<{ filePath: string; filename: string; relativePath: string }> => {
  const safeName = report.assessee_name.replace(/[^a-zA-Z0-9_-]/g, "_");
  const safeNik = report.assessee_nik.replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `Report_Assessment_Center_${safeName}_${safeNik}.pdf`;
  const relativePath = `report-ac/${report.id}/${filename}`;
  const uploadDir = path.join(process.cwd(), "uploads", "report-ac", report.id);
  const filePath = path.join(uploadDir, filename);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const pdfStream = await streamACReportPDF(report);
  const writeStream = fs.createWriteStream(filePath);
  await pipeline(pdfStream, writeStream);

  await updateACReportPdfPath(report.id, relativePath);

  return { filePath, filename, relativePath };
};

export const buildTMPPayload = (
  report: ACReportDetail,
  options?: {
    requestBaseUrl?: string;
    pdfFilename?: string;
    pdfBase64?: string;
  }
) => {
  const gapItems = report.competencies.filter((c) => !c.is_pass);
  const pdfDownloadUrl = buildACReportPdfDownloadUrl(report.id, options?.requestBaseUrl);

  return {
    source_system: "KOAP",
    report_type: "ASSESSMENT_CENTER",
    koap_report_id: report.id,
    assessee: {
      nik: report.assessee_nik,
      name: report.assessee_name,
      gender: report.gender || null,
      age: report.age || null,
      business_unit: report.business_unit || null,
      department: report.department || null,
      work_location: report.work_location || null,
      join_date: report.join_date || null,
      current_position_grade: report.current_position_grade || null,
    },
    assessment: {
      review_date: report.review_date || null,
      assessor_name: report.assessor_name || null,
      proposed_position: report.proposed_position || null,
      target_grade: report.target_grade,
      pass_count: report.pass_count,
      total_competencies: report.competencies.length,
      recommendation_type: report.recommendation_type,
      development_duration:
        report.recommendation_type === "Need Development"
          ? report.development_duration || null
          : null,
      evaluation_grade:
        report.recommendation_type === "Need Development"
          ? report.evaluation_grade || report.target_grade
          : report.target_grade,
      strength: report.strength || "",
      area_of_development: report.area_of_development || "",
      pdf_download_url: pdfDownloadUrl,
      ...(options?.pdfFilename ? { pdf_filename: options.pdfFilename } : {}),
      ...(options?.pdfBase64 ? { pdf_base64: options.pdfBase64 } : {}),
    },
    competency_profiles: report.competencies.map((c) => ({
      no: c.no,
      code: c.competency_code,
      name: c.competency_name,
      cluster: c.cluster,
      required_level: c.required_level,
      actual_level: c.actual_level,
      gap: c.gap,
      status: c.is_pass ? "PASS" : "GAP",
      uraian_kompetensi: c.uraian_kompetensi,
      uraian_gap: c.uraian_gap,
    })),
    development_plan_70_20_10: {
      training_10: gapItems.map((c) => ({
        competency_code: c.competency_code,
        competency_name: c.competency_name,
        gap: c.gap,
        program: c.training_recommendation,
      })),
      coaching_20: gapItems.map((c) => ({
        competency_code: c.competency_code,
        competency_name: c.competency_name,
        gap: c.gap,
        activity: c.coaching_plan,
      })),
      ojt_70: gapItems.map((c) => ({
        competency_code: c.competency_code,
        competency_name: c.competency_name,
        gap: c.gap,
        assignment: c.ojt_plan,
      })),
    },
    sent_at: new Date().toISOString(),
  };
};

/**
 * Mengirim Report AC yang sudah Completed secara otomatis ke sistem TMP
 * serta mencatat log pengiriman di tabel t_ac_report_tmp_log.
 */
export const syncACReportToTMP = async (
  report: ACReportDetail,
  options?: TMPSyncOptions
): Promise<TMPSyncResult> => {
  let pdfFilename: string | undefined;
  let pdfBase64: string | undefined;

  // Pastikan PDF sudah ter-generate di disk saat report Completed
  try {
    const generated = await ensureACReportPDFFile(report);
    pdfFilename = generated.filename;
    if (process.env.TMP_INCLUDE_PDF_BASE64 === "true") {
      pdfBase64 = fs.readFileSync(generated.filePath).toString("base64");
    }
  } catch (pdfErr) {
    console.error("ensureACReportPDFFile warning during TMP sync:", pdfErr);
  }

  const payload = buildTMPPayload(report, {
    requestBaseUrl: options?.requestBaseUrl,
    pdfFilename,
    pdfBase64,
  });

  // Hindari menyimpan string base64 besar ke kolom jsonb log DB
  const loggablePayload = pdfBase64
    ? {
        ...payload,
        assessment: {
          ...payload.assessment,
          pdf_base64: `[BASE64_OMITTED_IN_LOG:${pdfBase64.length}_CHARS]`,
        },
      }
    : payload;

  const tmpApiUrl = (process.env.TMP_API_URL || "").trim();
  const tmpApiKey = (process.env.TMP_API_KEY || "").trim();
  const tmpBasicUser = (process.env.TMP_AUTH_USERNAME || "").trim();
  const tmpBasicPass = (process.env.TMP_AUTH_PASSWORD || "").trim();
  const timeoutMs = Number(process.env.TMP_TIMEOUT_MS || 15000);

  let syncStatus: ACTmpSyncStatus = "Pending";
  let responseStatus: number | null = null;
  let responseBody: string | null = null;
  let externalId: string | null = null;
  let errorMessage: string | null = null;
  let syncedAt: Date | null = null;

  try {
    if (tmpApiUrl) {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (tmpApiKey) {
        headers["Authorization"] = tmpApiKey.startsWith("Bearer ")
          ? tmpApiKey
          : `Bearer ${tmpApiKey}`;
        headers["x-api-key"] = tmpApiKey.replace(/^Bearer\s+/i, "");
      }

      const response = await axios.post(tmpApiUrl, payload, {
        headers,
        timeout: timeoutMs,
        ...(tmpBasicUser
          ? { auth: { username: tmpBasicUser, password: tmpBasicPass } }
          : {}),
      });

      responseStatus = response.status;
      responseBody =
        typeof response.data === "string"
          ? response.data
          : JSON.stringify(response.data ?? {});
      externalId =
        response.data?.data?.id ||
        response.data?.id ||
        response.data?.reference_id ||
        `TMP-${Date.now()}`;
      syncStatus = "Synced";
      syncedAt = new Date();
    } else if (process.env.TMP_ALLOW_MOCK_SYNC === "true") {
      // Hanya aktif jika secara eksplisit menyalakan mode simulasi/demo lokal
      responseStatus = 200;
      externalId = `TMP-MOCK-${Date.now()}`;
      responseBody = JSON.stringify({
        mode: "mock_synced",
        reference_id: externalId,
        message: "Simulasi TMP aktif (TMP_ALLOW_MOCK_SYNC=true)",
      });
      syncStatus = "Synced";
      syncedAt = new Date();
    } else if (process.env.TMP_REQUIRE_ENDPOINT === "true") {
      syncStatus = "Failed";
      errorMessage = "TMP_API_URL belum dikonfigurasi pada environment server";
    } else {
      // Default aman: tidak memberi status Synced palsu jika TMP_API_URL belum disetel.
      // Payload tetap tercatat di t_ac_report_tmp_log dengan status Pending dan siap dikirim ulang.
      syncStatus = "Pending";
      errorMessage =
        "Menunggu konfigurasi TMP_API_URL pada server untuk pengiriman otomatis ke TMP";
      responseBody = JSON.stringify({
        mode: "pending_endpoint_config",
        message: errorMessage,
      });
    }
  } catch (err: any) {
    syncStatus = "Failed";
    responseStatus = err?.response?.status ?? null;
    responseBody = err?.response?.data
      ? JSON.stringify(err.response.data)
      : null;
    errorMessage =
      err?.response?.data?.message ||
      err?.message ||
      "Gagal mengirim Report AC ke sistem TMP";
  }

  const client = await db.connect();
  try {
    await client.query(
      `
      INSERT INTO public.t_ac_report_tmp_log
        (id, ac_report_id, request_payload, response_status, response_body, sync_status, error_message, attempted_at)
      VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, NOW())
      `,
      [
        uuidv4(),
        report.id,
        JSON.stringify(loggablePayload),
        responseStatus,
        responseBody,
        syncStatus,
        errorMessage,
      ]
    );

    await client.query(
      `
      UPDATE public.t_ac_report
      SET tmp_sync_status = $1,
          tmp_synced_at = $2,
          tmp_external_id = COALESCE($3, tmp_external_id),
          tmp_error_message = $4,
          updated_at = NOW()
      WHERE id = $5
      `,
      [syncStatus, syncedAt, externalId, errorMessage, report.id]
    );
  } finally {
    client.release();
  }

  return {
    sync_status: syncStatus,
    external_id: externalId,
    error_message: errorMessage,
    synced_at: syncedAt,
  };
};
