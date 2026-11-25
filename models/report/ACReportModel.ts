import fs from "fs";
import path from "path";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/config/connection.js";
import { TRANSACTION as TRANS } from "@/config/transaction.js";
import {
  AC_COMPETENCY_MASTER,
  AC_TARGET_GRADES,
  evaluateACCompetencies,
  getRequiredLevelsByGrade,
} from "@/helper/acCompetencyMaster.js";
import {
  ACCompetencyInput,
  ACRecommendationType,
  ACReportDetail,
  ACReportPayload,
} from "@/types/ACReportTypes.js";

let schemaEnsured = false;

export const ensureACReportSchema = async () => {
  if (schemaEnsured) return;
  const client = await db.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.t_ac_report (
        id varchar(200) DEFAULT gen_random_uuid() NOT NULL,
        assessee_nik varchar(100) NOT NULL,
        assessee_name varchar(255) NOT NULL,
        gender varchar(50) NULL,
        age varchar(50) NULL,
        business_unit varchar(255) NULL,
        department varchar(255) NULL,
        work_location varchar(255) NULL,
        join_date date NULL,
        review_date date NULL,
        assessor_name varchar(255) NULL,
        current_position_grade varchar(255) NULL,
        proposed_position varchar(255) NULL,
        target_grade varchar(20) NOT NULL,
        strength text NULL,
        area_of_development text NULL,
        recommendation_type varchar(50) NOT NULL DEFAULT 'Not Recommended',
        development_duration varchar(100) NULL DEFAULT '6 - 12 bulan',
        evaluation_grade varchar(20) NULL,
        sign_place_date varchar(150) NULL,
        pass_count int4 NOT NULL DEFAULT 0,
        status varchar(30) NOT NULL DEFAULT 'Draft',
        pdf_path text NULL,
        tmp_sync_status varchar(30) NOT NULL DEFAULT 'Pending',
        tmp_synced_at timestamptz NULL,
        tmp_external_id varchar(200) NULL,
        tmp_error_message text NULL,
        created_at timestamptz DEFAULT now() NULL,
        created_by varchar(200) NULL,
        updated_at timestamptz NULL,
        updated_by varchar(200) NULL,
        CONSTRAINT t_ac_report_pk PRIMARY KEY (id)
      );

      CREATE TABLE IF NOT EXISTS public.t_ac_report_competency (
        id varchar(200) DEFAULT gen_random_uuid() NOT NULL,
        ac_report_id varchar(200) NOT NULL,
        competency_code varchar(10) NOT NULL,
        competency_name varchar(150) NOT NULL,
        cluster varchar(30) NOT NULL,
        sort_order int4 NOT NULL DEFAULT 1,
        required_level int4 NOT NULL,
        actual_level int4 NOT NULL,
        gap int4 NOT NULL,
        is_pass bool NOT NULL DEFAULT false,
        uraian_kompetensi text NULL,
        uraian_gap text NULL,
        training_recommendation text NULL,
        coaching_plan text NULL,
        ojt_plan text NULL,
        CONSTRAINT t_ac_report_competency_pk PRIMARY KEY (id),
        CONSTRAINT t_ac_report_competency_fk FOREIGN KEY (ac_report_id)
          REFERENCES public.t_ac_report(id) ON DELETE CASCADE,
        CONSTRAINT t_ac_report_competency_uq UNIQUE (ac_report_id, competency_code)
      );

      CREATE TABLE IF NOT EXISTS public.t_ac_report_tmp_log (
        id varchar(200) DEFAULT gen_random_uuid() NOT NULL,
        ac_report_id varchar(200) NOT NULL,
        request_payload jsonb NULL,
        response_status int4 NULL,
        response_body text NULL,
        sync_status varchar(30) NOT NULL,
        error_message text NULL,
        attempted_at timestamptz DEFAULT now() NOT NULL,
        CONSTRAINT t_ac_report_tmp_log_pk PRIMARY KEY (id),
        CONSTRAINT t_ac_report_tmp_log_fk FOREIGN KEY (ac_report_id)
          REFERENCES public.t_ac_report(id) ON DELETE CASCADE
      );
    `);
    schemaEnsured = true;
  } catch (error) {
    console.error("ensureACReportSchema warning:", error);
  } finally {
    client.release();
  }
};

const normalizeDateOrNull = (val?: string | null): string | null => {
  if (!val) return null;
  const trimmed = String(val).trim();
  if (!trimmed) return null;
  const m = moment(trimmed);
  return m.isValid() ? m.format("YYYY-MM-DD") : null;
};

export const getACMasterMetadata = () => {
  const gradeStandards: Record<string, Record<string, number>> = {};
  for (const g of AC_TARGET_GRADES) {
    gradeStandards[g] = getRequiredLevelsByGrade(g);
  }
  return {
    grades: AC_TARGET_GRADES,
    grade_standards: gradeStandards,
    competencies: AC_COMPETENCY_MASTER,
  };
};

export const listACReports = async (session?: { role_name?: string; user_id?: string }) => {
  await ensureACReportSchema();
  const client = await db.connect();
  try {
    const params: any[] = [];
    let whereSql = "";

    if (session?.role_name && session.role_name !== "Super Admin" && session.user_id) {
      params.push(session.user_id);
      whereSql = `
        WHERE r.created_by = $1
           OR r.business_unit IN (
             SELECT mbu.bu_name
             FROM mst_admin_web_bu mawb
             JOIN mst_business_unit mbu ON mbu.bu_code = mawb.bu_code
             WHERE mawb.user_id = $1
           )
      `;
    }

    const result = await client.query(
      `
      SELECT
        r.id,
        r.assessee_nik,
        r.assessee_name,
        r.gender,
        r.age,
        r.business_unit,
        r.department,
        r.work_location,
        TO_CHAR(r.join_date, 'YYYY-MM-DD') AS join_date,
        TO_CHAR(r.review_date, 'YYYY-MM-DD') AS review_date,
        r.assessor_name,
        r.current_position_grade,
        r.proposed_position,
        r.target_grade,
        r.recommendation_type,
        r.pass_count,
        r.status,
        r.tmp_sync_status,
        r.tmp_synced_at,
        r.tmp_external_id,
        r.tmp_error_message,
        r.created_at,
        r.updated_at
      FROM public.t_ac_report r
      ${whereSql}
      ORDER BY COALESCE(r.updated_at, r.created_at) DESC
      `,
      params
    );

    return result.rows;
  } finally {
    client.release();
  }
};

export const getACReportById = async (id: string): Promise<ACReportDetail | null> => {
  await ensureACReportSchema();
  const client = await db.connect();
  try {
    const headRes = await client.query(
      `
      SELECT
        id,
        assessee_nik,
        assessee_name,
        gender,
        age,
        business_unit,
        department,
        work_location,
        TO_CHAR(join_date, 'YYYY-MM-DD') AS join_date,
        TO_CHAR(review_date, 'YYYY-MM-DD') AS review_date,
        assessor_name,
        current_position_grade,
        proposed_position,
        target_grade,
        strength,
        area_of_development,
        recommendation_type,
        development_duration,
        evaluation_grade,
        sign_place_date,
        pass_count,
        status,
        pdf_path,
        tmp_sync_status,
        tmp_synced_at,
        tmp_external_id,
        tmp_error_message,
        created_at,
        updated_at
      FROM public.t_ac_report
      WHERE id = $1
      `,
      [id]
    );

    if (headRes.rowCount === 0) return null;
    const head = headRes.rows[0];

    const compRes = await client.query(
      `
      SELECT
        competency_code,
        actual_level,
        uraian_kompetensi,
        uraian_gap,
        training_recommendation,
        coaching_plan,
        ojt_plan
      FROM public.t_ac_report_competency
      WHERE ac_report_id = $1
      ORDER BY sort_order ASC
      `,
      [id]
    );

    const compInputs: ACCompetencyInput[] = compRes.rows.map((r) => ({
      competency_code: r.competency_code,
      actual_level: Number(r.actual_level),
      uraian_kompetensi: r.uraian_kompetensi ?? "",
      uraian_gap: r.uraian_gap ?? "",
      training_recommendation: r.training_recommendation ?? "",
      coaching_plan: r.coaching_plan ?? "",
      ojt_plan: r.ojt_plan ?? "",
    }));

    const evaluated = evaluateACCompetencies(head.target_grade, compInputs);
    const finalRec = (head.recommendation_type ||
      evaluated.autoRecommendationType) as ACRecommendationType;

    return {
      id: head.id,
      assessee_nik: head.assessee_nik,
      assessee_name: head.assessee_name,
      gender: head.gender ?? "",
      age: head.age ?? "",
      business_unit: head.business_unit ?? "",
      department: head.department ?? "",
      work_location: head.work_location ?? "",
      join_date: head.join_date ?? null,
      review_date: head.review_date ?? null,
      assessor_name: head.assessor_name ?? "",
      current_position_grade: head.current_position_grade ?? "",
      proposed_position: head.proposed_position ?? "",
      target_grade: head.target_grade,
      strength: head.strength ?? "",
      area_of_development: head.area_of_development ?? "",
      recommendation_type: finalRec,
      auto_recommendation_type: evaluated.autoRecommendationType,
      recommendation_rule_info: evaluated.ruleInfo,
      development_duration: head.development_duration ?? "6 - 12 bulan",
      evaluation_grade: head.evaluation_grade || head.target_grade,
      sign_place_date: head.sign_place_date ?? "",
      pass_count: evaluated.passCount,
      sigap_gap_count: evaluated.sigapGapCount,
      leadership_gap_count: evaluated.leadershipGapCount,
      status: head.status,
      pdf_path: head.pdf_path ?? null,
      tmp_sync_status: head.tmp_sync_status,
      tmp_synced_at: head.tmp_synced_at ?? null,
      tmp_external_id: head.tmp_external_id ?? null,
      tmp_error_message: head.tmp_error_message ?? null,
      created_at: head.created_at,
      updated_at: head.updated_at,
      competencies: evaluated.competencies,
    };
  } finally {
    client.release();
  }
};

export const createACReport = async (
  payload: ACReportPayload,
  userId: string | null
): Promise<ACReportDetail> => {
  await ensureACReportSchema();
  const id = uuidv4();
  const evaluated = evaluateACCompetencies(payload.target_grade, payload.competencies);
  const finalRec = payload.recommendation_type || evaluated.autoRecommendationType;
  const status = payload.status || "Draft";

  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);

    await client.query(
      `
      INSERT INTO public.t_ac_report (
        id, assessee_nik, assessee_name, gender, age, business_unit, department, work_location,
        join_date, review_date, assessor_name, current_position_grade, proposed_position,
        target_grade, strength, area_of_development, recommendation_type, development_duration,
        evaluation_grade, sign_place_date, pass_count, status, tmp_sync_status, created_at, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18,
        $19, $20, $21, $22, 'Pending', NOW(), $23
      )
      `,
      [
        id,
        payload.assessee_nik,
        payload.assessee_name,
        payload.gender || "",
        payload.age || "",
        payload.business_unit || "",
        payload.department || "",
        payload.work_location || "",
        normalizeDateOrNull(payload.join_date),
        normalizeDateOrNull(payload.review_date),
        payload.assessor_name || "",
        payload.current_position_grade || "",
        payload.proposed_position || "",
        payload.target_grade,
        payload.strength || "",
        payload.area_of_development || "",
        finalRec,
        payload.development_duration || "6 - 12 bulan",
        payload.evaluation_grade || payload.target_grade,
        payload.sign_place_date || "",
        evaluated.passCount,
        status,
        userId,
      ]
    );

    for (const c of evaluated.competencies) {
      await client.query(
        `
        INSERT INTO public.t_ac_report_competency (
          id, ac_report_id, competency_code, competency_name, cluster, sort_order,
          required_level, actual_level, gap, is_pass, uraian_kompetensi, uraian_gap,
          training_recommendation, coaching_plan, ojt_plan
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11, $12,
          $13, $14, $15
        )
        `,
        [
          uuidv4(),
          id,
          c.competency_code,
          c.competency_name,
          c.cluster,
          c.no,
          c.required_level,
          c.actual_level,
          c.gap,
          c.is_pass,
          c.uraian_kompetensi,
          c.uraian_gap,
          c.training_recommendation,
          c.coaching_plan,
          c.ojt_plan,
        ]
      );
    }

    await client.query(TRANS.COMMIT);
  } catch (err) {
    await client.query(TRANS.ROLLBACK);
    throw err;
  } finally {
    client.release();
  }

  return (await getACReportById(id))!;
};

export const updateACReport = async (
  id: string,
  payload: ACReportPayload,
  userId: string | null
): Promise<ACReportDetail | null> => {
  await ensureACReportSchema();
  const evaluated = evaluateACCompetencies(payload.target_grade, payload.competencies);
  const finalRec = payload.recommendation_type || evaluated.autoRecommendationType;
  const status = payload.status || "Draft";

  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);

    const upd = await client.query(
      `
      UPDATE public.t_ac_report
      SET assessee_nik = $1,
          assessee_name = $2,
          gender = $3,
          age = $4,
          business_unit = $5,
          department = $6,
          work_location = $7,
          join_date = $8,
          review_date = $9,
          assessor_name = $10,
          current_position_grade = $11,
          proposed_position = $12,
          target_grade = $13,
          strength = $14,
          area_of_development = $15,
          recommendation_type = $16,
          development_duration = $17,
          evaluation_grade = $18,
          sign_place_date = $19,
          pass_count = $20,
          status = $21,
          pdf_path = NULL,
          updated_at = NOW(),
          updated_by = $22
      WHERE id = $23
      `,
      [
        payload.assessee_nik,
        payload.assessee_name,
        payload.gender || "",
        payload.age || "",
        payload.business_unit || "",
        payload.department || "",
        payload.work_location || "",
        normalizeDateOrNull(payload.join_date),
        normalizeDateOrNull(payload.review_date),
        payload.assessor_name || "",
        payload.current_position_grade || "",
        payload.proposed_position || "",
        payload.target_grade,
        payload.strength || "",
        payload.area_of_development || "",
        finalRec,
        payload.development_duration || "6 - 12 bulan",
        payload.evaluation_grade || payload.target_grade,
        payload.sign_place_date || "",
        evaluated.passCount,
        status,
        userId,
        id,
      ]
    );

    if (upd.rowCount === 0) {
      await client.query(TRANS.ROLLBACK);
      return null;
    }

    await client.query(`DELETE FROM public.t_ac_report_competency WHERE ac_report_id = $1`, [id]);

    for (const c of evaluated.competencies) {
      await client.query(
        `
        INSERT INTO public.t_ac_report_competency (
          id, ac_report_id, competency_code, competency_name, cluster, sort_order,
          required_level, actual_level, gap, is_pass, uraian_kompetensi, uraian_gap,
          training_recommendation, coaching_plan, ojt_plan
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11, $12,
          $13, $14, $15
        )
        `,
        [
          uuidv4(),
          id,
          c.competency_code,
          c.competency_name,
          c.cluster,
          c.no,
          c.required_level,
          c.actual_level,
          c.gap,
          c.is_pass,
          c.uraian_kompetensi,
          c.uraian_gap,
          c.training_recommendation,
          c.coaching_plan,
          c.ojt_plan,
        ]
      );
    }

    await client.query(TRANS.COMMIT);
  } catch (err) {
    await client.query(TRANS.ROLLBACK);
    throw err;
  } finally {
    client.release();
  }

  return await getACReportById(id);
};

export const deleteACReport = async (id: string): Promise<boolean> => {
  await ensureACReportSchema();
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const res = await client.query(`DELETE FROM public.t_ac_report WHERE id = $1`, [id]);
    await client.query(TRANS.COMMIT);

    const reportDir = path.join(process.cwd(), "uploads", "report-ac", id);
    if (fs.existsSync(reportDir)) {
      fs.rmSync(reportDir, { recursive: true, force: true });
    }

    return (res.rowCount ?? 0) > 0;
  } catch (err) {
    await client.query(TRANS.ROLLBACK);
    throw err;
  } finally {
    client.release();
  }
};

export const updateACReportPdfPath = async (id: string, pdfPath: string) => {
  const client = await db.connect();
  try {
    await client.query(`UPDATE public.t_ac_report SET pdf_path = $1 WHERE id = $2`, [pdfPath, id]);
  } finally {
    client.release();
  }
};
