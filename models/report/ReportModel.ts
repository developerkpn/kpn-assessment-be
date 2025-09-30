import { db } from "@/config/connection.js";
import { TRANSACTION as TRANS } from "@/config/transaction.js";
import { ClientAction, deleteQuery, insertQuery, updateQuery } from "@/helper/queryBuilder.js";
import path from "path";
import fs from "fs";
import { v7 as uuid } from "uuid";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
import { getDarwinUser } from "@/models/BatchModel.js";
import { getCriteriaDetail } from "@/models/CriteriaModel.js";
import { transformResponseFormat } from "@/helper/transformers.js";
import { getAssesseeExternalProfile } from "@/models/transactions/AssesseeModel.js";
import moment from "moment";
import S3ClientUpload from "@/helper/S3UploadClass.js";
import { ResponseError } from "@/error/response-error.js";
import { async } from "rxjs";
import { CriteriasReport, ReportCriteria, ReportDetailSection, ReportIntro } from "@/types/Report.js";

export const getBatchForReport = async (session: { role_name: string; user_id: string }) => {
  const client = await db.connect();
  try {
    let whereque = [];
    let whereval = [];
    let where = "";
    let index = 1;
    if (session.role_name != "Super Admin") {
      whereque.push(`maw.id = $${index}`);
      whereval.push(session.user_id);
      index++;
    }
    if (whereval.length > 0) {
      where = "and " + whereque.join(" and ");
    }
    const result = await client.query(
      `with batches as (
          select
            distinct on
            (tbh.id)
            tbh.id,
            tbh.batch_name,
            tbh.batch_code,
            tbh."type",
            tbh.status,
            mgh.grouptest_code ,
            tba.total_assessee ,
            tbh.start_period ,
            tbh.end_period ,
            mbu.bu_code ,
            maws.scope_id,
            mfm.fm_code,
            tbh.created_by,
            tbh.created_at,
            creator.fullname,
            maw.fullname,
            maw.id as user_id,
            r.id as report_id
          from
            mst_admin_web maw
          left join mst_admin_web_bu mawb on
            mawb.user_id = maw.id
          left join mst_admin_web_scope maws on
            maws.user_id = maw.id
          left join mst_business_unit mbu on
            mbu.bu_code = mawb.bu_code
          inner join t_batch_head tbh on
            tbh.bu_id = mbu.id
            and tbh."type" = maws.scope_id
          left join mst_grouptest_head mgh on
            mgh.id = tbh.grouptest_id
          left join (
            select
              count(tba.id) as total_assessee,
              tba.batch_id
            from
              t_batch_assessee tba
            group by
              tba.batch_id) tba on
            tba.batch_id = tbh.id
          left join mst_function_menu mfm on
            mfm.id = tbh.function_id
          left join report_head r on 
            r.batch_id = tbh.id
          left join mst_admin_web creator on
            creator.id = tbh.created_by where tbh.status = 'Published' ${where})
          select
            *
          from
            batches 
          order by
            created_at desc

            `,
      whereval
    );

    const mappingResult = result.rows.map((prev: any) => ({
      ...prev,
      is_report_exist: prev.report_id ? true : false,
    }));

    return mappingResult;
  } catch (e) {
    throw e;
  } finally {
    client.release();
  }
};
export const getReportGuide = async () => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
        SELECT id, content, created_at, created_by 
        FROM report_guide
        ORDER BY created_at DESC 
        `
    );
    return result.rows;
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    client.release();
  }
};

export const storeReportGuide = async (payload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [Q, V] = insertQuery("report_guide", payload);
    await client.query(Q, V);
    await client.query(TRANS.COMMIT);
  } catch (e) {
    await client.query(TRANS.ROLLBACK);
    console.log(e);
    throw e;
  } finally {
    client.release();
  }
};
export const updateReportGuide = async (payload: any, reportGuideId: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [Q, V] = updateQuery("report_guide", payload, { id: reportGuideId });
    await client.query(Q, V);
    // const [introQ, introV] = updateQuery("report_test_intro");
    await client.query(TRANS.COMMIT);
  } catch (e) {
    await client.query(TRANS.ROLLBACK);
    console.log(e);
    throw e;
  } finally {
    client.release();
  }
};

export const getBatchInformationForReport = async (batchId: string) => {
  const client = await db.connect();
  try {
    const batchInformation = await client.query(
      `
        SELECT 
          b.*,
          c.*, 
          g.*, 
          t.*,
          s.id as subtest_id,
          s.subtest_name,
          s.subtest_code,
          s.is_criteria
        FROM t_batch_head b
        LEFT JOIN mst_grouptest_det g ON b.grouptest_id = g.grouptest_id
        LEFT JOIN mst_test_head t ON g.test_id = t.id
        LEFT JOIN mst_category c ON t.category_id = c.id
        LEFT JOIN mst_test_det td ON t.id = td.test_id
        LEFT JOIN mst_subtest_head s ON td.subtest_id = s.id 
        WHERE b.id = $1
        GROUP BY b.id, g.id, t.id, c.id, s.id
        ORDER BY b.created_at DESC
        `,
      [batchId]
    );
    console.log(batchInformation.rows);
    return batchInformation.rows;
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    client.release();
  }
};

export const assignReportDesign = async (
  reportIntro: any,
  reportDetail: any,
  reportHead: any,
  update: boolean = false,
  report_id?: string,
  batchId?: string,
  generateStatus?: any
) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    if (update === false) {
      const [headerQ, headerV] = insertQuery("report_head", reportHead);
      await client.query(headerQ, headerV);
      const [introQ, introV] = insertQuery("report_test_intro", reportIntro);
      await client.query(introQ, introV);
      const [detailQ, detailV] = insertQuery("report_test_detail", reportDetail);
      await client.query(detailQ, detailV);
    } else {
      console.log("masuk update model");
      console.log(report_id);
      await client.query(
        `
        DELETE
        FROM report_test_intro 
        WHERE report_id = $1
        `,
        [report_id]
      );
      await client.query(
        `
        DELETE
        FROM report_test_detail
        WHERE report_id = $1
        `,
        [report_id]
      );
      console.log("end delete 3");
      console.log(reportHead);
      const [headerQ, headerV] = updateQuery("report_head", reportHead, { id: report_id });
      await client.query(headerQ, headerV);
      console.log("update");
      const [introQ, introV] = insertQuery("report_test_intro", reportIntro);
      await client.query(introQ, introV);
      console.log("insert 1");
      const [detailQ, detailV] = insertQuery("report_test_detail", reportDetail);
      await client.query(detailQ, detailV);
      console.log("insert 2");
      const [updateStatusQ, updateStatusV] = updateQuery("t_batch_assessee", generateStatus, { batch_id: batchId });
      await client.query(updateStatusQ, updateStatusV);
    }
    await client.query(TRANS.COMMIT);
  } catch (e) {
    console.error(e);
    await client.query(TRANS.ROLLBACK);
    throw e;
  } finally {
    client.release();
  }
};

export const getReportDesignDetail = async (batchId: string) => {
  const client = await db.connect();
  try {
    const intro = await client.query(
      `
        SELECT
          h.id as head_id, 
          h.*,
          i.*,
          d.*
        FROM report_head h
        LEFT JOIN report_test_intro i ON h.id = i.report_id
        LEFT JOIN report_test_detail d ON h.id = d.report_id
        WHERE h.batch_id = $1
        `,
      [batchId]
    );

    const detail = await client.query(
      `
    SELECT
        h.*,
        d.*
    FROM report_head h
    LEFT JOIN report_test_intro i ON h.id = i.report_id
    LEFT JOIN report_test_detail d ON h.id = d.report_id
    WHERE h.batch_id = $1
  `,
      [batchId]
    );

    const result = {
      intro: intro.rows,
      detail: detail.rows,
    };

    return result;
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    client.release();
  }
};

export const updateReportDesignDetail = async (batchId: string, introPayload: any, detailPayload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [introQ, introV] = updateQuery("report_test_intro", introPayload, {
      id: detailPayload.category_id,
      report_id: detailPayload.report_id,
    });
    await client.query(introQ, introV);
    const [detailQ, detailV] = updateQuery("report_test_detail", detailPayload, {
      test_id: detailPayload.test_id,
      report_id: detailPayload.report_id,
    });
    await client.query(detailQ, detailV);
    await client.query(TRANS.COMMIT);
  } catch (e) {
    await client.query(TRANS.ROLLBACK);
    console.error(e);
  } finally {
    client.release();
  }
};

export const generateReportForSpecificAssessee = async (assesseeId: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);

    await client.query(TRANS.COMMIT);
  } catch (e) {
    console.error(e);
    await client.query(TRANS.ROLLBACK);
    throw e;
  } finally {
    client.release();
  }
};

export const generateReportForWholeBatch = async (batchId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
        SELECT
           b.id as batch_id,
           b.batch_name,
           b.batch_code,
           b.start_period,
           b.end_period,
           b.type,
           t.id as test_id,
           t.test_name,
           t.test_code,
           st.id as subtest_id,
           st.subtest_name,
           st.subtest_code,
           q.id as question_id,
           q.q_input_text,
           a.assessee_nik,
           a.assessee_name,
           a.assessee_email,
           sto.point
        from t_batch_head b
        left join mst_grouptest_head mgh on b.grouptest_id = mgh.id  
        left join mst_grouptest_det gd on b.grouptest_id = gd.grouptest_id 
        left join mst_test_head t on gd.test_id = t.id
        left join mst_test_det td on t.id = td.test_id
        left join mst_subtest_head st on td.subtest_id = st.id 
        left join mst_subtest_det sd on st.id = sd.subtest_id
        left join mst_series s on sd.series_id = s.id 
        left join mst_series_det sed on s.id = sed.series_id 
        left join mst_question_answer q on sed.question_id = q.id 
        left join t_batch_assessee a on b.id = a.batch_id 
        left join t_progress_batch_head tpbh on a.assessee_nik = tpbh.assessee_id and b.id = tpbh.batch_id 
        left join t_progress_batch_det tpbd on tpbh.id = tpbd.head_id 
        left join t_store_answer sto on q.id = sto.question_id and tpbd.id = sto.det_id
        WHERE b.id = $1
        `,
      [batchId]
    );
    return result.rows;
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    client.release();
  }
};

export const getExternalAssesseeProfile = async (assesseeEmail: string) => {
  const client = await db.connect();
  try {
    const assessee = await client.query(
      `
        SELECT 
          name,
          email,
          gender,
          phone,
          education,
          institution,
          date_of_birth
        FROM mst_user_extern
        WHERE email = $1
        `,
      [assesseeEmail]
    );

    return assessee.rows[0];
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    client.release();
  }
};

export const getAssesseeProfile = async (assesseeId: string) => {
  const client = await db.connect();
  try {
  } catch (e) {
  } finally {
    client.release();
  }
};

export const getReportDetail = async (batchId: string) => {
  const client = await db.connect();
  try {
    console.log(batchId);
    const result = await client.query(
      `
      SELECT 
        rh.id as report_id,
        rtd.test_id,
        t.test_name,
        t.test_code,
        t.description,
        c.id as category_id,
        c.category_name,
        c.category_code,
        c.criteria_id,
        rtd.summary_type,
        rtd.summary_formula,
        rtd.summary_view
      FROM t_batch_head bh 
      LEFT JOIN report_head rh ON bh.id = rh.batch_id 
      LEFT JOIN report_test_detail rtd ON rh.id = rtd.report_id
      LEFT JOIN mst_test_head t ON rtd.test_id = t.id
      LEFT JOIN mst_category c ON t.category_id = c.id
      WHERE bh.id = $1
    `,
      [batchId]
    );

    return result.rows;
  } catch (e) {
    throw e;
  } finally {
    client.release();
  }
};

export const getIntroData = async (batchId: string) => {
  const client = await db.connect();
  try {
    console.log(batchId);
    const result = await client.query(
      `
      SELECT 
        rh.id as report_id,
        rh.content,
        rtd.category_id,
        c.category_name,
        c.category_code,
        c.criteria_id,
        rtd.summary_type,
        rtd.summary_formula,
        rtd.summary_view
      FROM t_batch_head bh 
      LEFT JOIN report_head rh ON bh.id = rh.batch_id 
      LEFT JOIN report_test_intro rtd ON rh.id = rtd.report_id
      LEFT JOIN mst_category c ON rtd.category_id = c.id      
      WHERE bh.id = $1
    `,
      [batchId]
    );

    return result.rows;
  } catch (e) {
    throw e;
  } finally {
    client.release();
  }
};

export const getPersonalReportData = async (
  batchId: string,
  assessee_id: any,
  type: string,
  testId: string,
  subtestId?: string
) => {
  const client = await db.connect();
  try {
    let result;
    if (type === "subtest") {
      result = await client.query(
        `
        SELECT *
        FROM test_result_by_subtest
        WHERE assessee_id = $1 AND batch_id = $2 AND test_id = $3
        `,
        [assessee_id, batchId, testId]
      );
    } else if (type === "category") {
      console.log("masuk model category");
      result = await client.query(
        `
        SELECT *
        FROM test_result_by_category
        WHERE assessee_id = $1 AND batch_id = $2 AND test_id = $3
        `,
        [assessee_id, batchId, testId]
      );
    }

    return result?.rows;
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    client.release();
  }
};

export const getTestCriteriaModel = async (testId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
        SELECT
          ct.id
         FROM mst_test_head t
         LEFT JOIN mst_category c ON t.category_id = c.id
         LEFT JOIN mst_value ct ON c.criteria_id = ct.id
         WHERE t.id = $1
        `,
      [testId]
    );
    return result.rows[0];
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    client.release();
  }
};

export const getCategoryCriteriaModel = async (categoryId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
        SELECT
          ct.id
         FROM mst_category c
         LEFT JOIN mst_value ct ON c.criteria_id = ct.id
         WHERE c.id = $1
        `,
      [categoryId]
    );
    return result.rows[0];
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    client.release();
  }
};

export const storeReportPDF = async (report: any, batchId: string, assesseeId: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [Q, V] = updateQuery("t_batch_assessee", report, { batch_id: batchId, assessee_nik: assesseeId });
    await client.query(Q, V);
    await client.query(TRANS.COMMIT);
  } catch (e) {
  } finally {
    client.release();
  }
};

export const getGenerateStatus = async (batchId: string, assesseeId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
        SELECT is_generate, report_path
        FROM t_batch_assessee
        WHERE batch_id = $1 AND assessee_nik = $2
        `,
      [batchId, assesseeId]
    );

    return result.rows[0];
  } catch (e) {
  } finally {
    client.release();
  }
};

export const getSpecificBatchInformationForReport = async (batchId: string, assesseeId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
        SELECT
          b.id, 
          b.batch_name,
          b.batch_code,
          b.type,
          d.taken_at at TIME zone 'Asia/Jakarta' as taken_at,
          r.content,
          r.cover_id
         FROM t_batch_head b
         LEFT JOIN t_progress_batch_head h ON b.id = h.batch_id
         LEFT JOIN t_progress_batch_det d ON h.id = d.head_id
         LEFT JOIN report_head r ON b.id = r.batch_id
         WHERE b.id = $1 AND h.assessee_id = $2
         ORDER BY d.taken_at ASC
        `,
      [batchId, assesseeId]
    );

    return result.rows[0];
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    client.release();
  }
};

export const getReportLog = async (batchId: string, assesseeId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
        SELECT
           l.id,
           l.log,
           l.log_code,
           l.created_at
        FROM t_batch_log l
        WHERE l.batch_id = $1 AND l.user_id = $2
        ORDER BY created_at ASC
      `,
      [batchId, assesseeId]
    );

    const formattedLogs = result.rows.map((row: any) => ({
      ...row,
      created_at: moment(row.created_at).tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
    }));

    return formattedLogs;
  } catch (e) {
    throw e;
  } finally {
    client.release();
  }
};

export const getAssesseeListForReport = async (batchId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
        SELECT 
          a.assessee_nik,
          a.assessee_name,
          a.assessee_email,
          MIN(d.taken_at) as first_taken_subtest_at,
          MAX(d.submit_at) as last_finished_subtest_at
        FROM t_batch_assessee a
        LEFT JOIN t_progress_batch_head h ON a.assessee_nik = h.assessee_id AND a.batch_id = h.batch_id
        LEFT JOIN t_progress_batch_det d ON h.id = d.head_id
        WHERE a.batch_id = $1
        GROUP BY a.assessee_nik, a.assessee_name, a.assessee_email
        ORDER BY a.assessee_name
      `,
      [batchId]
    );

    console.log(result.rows);

    const formatted = result.rows.map((row: any) => ({
      ...row,
      first_taken_subtest_at: row.first_taken_subtest_at
        ? moment(row.first_taken_subtest_at).tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
        : null,
      last_finished_subtest_at: row.last_finished_subtest_at
        ? moment(row.last_finished_subtest_at).tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
        : null,
    }));

    return formatted;
  } catch (e) {
    throw e;
  } finally {
    client.release();
  }
};

export const getReportHead = async (batchId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
      SELECT * FROM report_head
      WHERE batch_id = $1
      `,
      [batchId]
    );

    return result.rows[0];
  } catch (e) {
    throw e;
  } finally {
    client.release();
  }
};

export const uploadCoverImage = async (
  file_name: string,
  image: string | NodeJS.ArrayBufferView,
  mimetype: string,
  user_id: string
) => {
  return ClientAction(async (client) => {
    try {
      await client.query(TRANS.BEGIN);
      //check if folder /cover is already exist, if not create new one
      const dir_cover = path.join(__dirname, "../../uploads/cover");
      if (!fs.existsSync(dir_cover)) {
        fs.mkdirSync(dir_cover);
      }
      //write historical master image
      const uid = uuid();
      let payload_image = {
        uid: uid,
        file_name: file_name,
        metadata: mimetype,
        create_by: user_id,
      };
      const [que_ins, val_ins] = insertQuery("mst_image_cover", payload_image, "uid");
      const { rows } = await client.query(que_ins, val_ins);
      // write to sys
      fs.writeFileSync(dir_cover + `/${file_name}`, image);
      await client.query(TRANS.COMMIT);
      return { id_file: uid };
    } catch (error) {
      await client.query(TRANS.ROLLBACK);
      throw error;
    }
  });
};

export const getCoverbyID = async (id: string) => {
  return ClientAction(async (client) => {
    try {
      const { rows } = await client.query(`select file_name from mst_image_cover where uid = $1`, [id]);
      const file_name = rows[0].file_name;
      //read file
      const dir_cover = path.join(__dirname, "../../uploads/cover/" + file_name);
      if (!fs.existsSync(dir_cover)) {
        console.warn(`File not found: ${dir_cover}`);
        return null; // or throw a custom error or return a default placeholder buffer
      }
      const buffer_file = await fs.createReadStream(dir_cover);
      return buffer_file;
    } catch (error) {
      throw error;
    }
  });
};

export const checkIsCoverUserbyOtherMod = async (batch_id: string, cover_id: string) => {
  return await ClientAction(async (client) => {
    try {
      const { rows, rowCount: is_exist } = await client.query(
        `
      select
        mic.uid,
        tbh.batch_code,
        tbh.batch_name
      from
        mst_image_cover mic
      left join report_head rh on
        mic.uid = rh.cover_id
      left join t_batch_head tbh on
        tbh.id = rh.batch_id
      where
        rh.batch_id <> $1
        and mic.uid = $2
        `,
        [batch_id, cover_id]
      );
      return { is_exist: is_exist ?? 0, existed_batch: rows };
    } catch (error) {
      throw error;
    }
  });
};

export const getAllDataCover = async () => {
  return ClientAction(async (client) => {
    try {
      const { rows } = await client.query(`select file_name, uid from mst_image_cover`);
      return rows;
    } catch (error) {
      throw error;
    }
  });
};

const getCriteriaForReport = async (criteriaId: string): Promise<ReportCriteria> => {
  try {
    console.log("masuk raw data");
    const rawData = await getCriteriaDetail(criteriaId);

    const groupedData: ReportCriteria = {
      value_name: rawData[0]?.value_name || null,
      value_code: rawData[0]?.value_code || null,

      // Hilangkan duplikasi berdasarkan criteria_id
      criterias: rawData.reduce((acc: CriteriasReport[], row: any) => {
        if (row.criteria_id && !acc.some((c) => c.criteria_id === row.criteria_id)) {
          acc.push({
            criteria_id: row.criteria_id,
            criteria_name: row.criteria_name,
            minimum_score: row.minimum_score,
            maximum_score: row.maximum_score,
            description: row.description,
            color_id: row.color_id,
            color_name: row.color_name,
            hex_code: row.hex_code,
          });
        }
        return acc;
      }, []),

      // Hilangkan duplikasi berdasarkan standardized_id
      standardized: rawData.reduce((acc: any[], row: any) => {
        if (row.standardized_id && !acc.some((s) => s.standardized_id === row.standardized_id)) {
          acc.push({
            standardized_id: row.standardized_id,
            raw_score: row.raw_score,
            standardized_score: row.standardized_score,
          });
        }
        return acc;
      }, []),
    };

    console.log("group datanya", groupedData);
    return groupedData;
  } catch (e) {
    throw e;
  }
};

export const proceedIntro = async (batchId: string, detail: ReportDetailSection[]): Promise<ReportIntro[]> => {
  try {
    let intro = [];
    const reportIntroData = await getIntroData(batchId);

    for (const category of reportIntroData) {
      const data: any = {
        category_id: category.category_id,
        category_name: category.category_name,
        category_code: category.category_code,
        summary_type: category.summary_type,
        summary_code: category.summary_code,
        summary_view: category.summary_view,
        summary_formula: category.summary_formula,
        norm: [],
        subtests: [],
        tests: [],
      };

      // Ambil criteria categorynya untuk norm - HANYA SEKALI
      let norm = await getCriteriaForReport(category.criteria_id);
      if (norm.criterias.length !== 0) {
        data.norm = [...norm.criterias]; // Langsung assign, tidak push
      }

      // Ambil detail berdasarkan category_id
      const categoryDetails: any = detail.flat().filter((d: any) => d.category_id === category.category_id);

      if (category.summary_type === "summary") {
        for (const test of categoryDetails) {
          if (test.summary_type === "subtest") {
            // const subtests = test.subtests || [];
            data.tests.push({
              test_id: test.test_id,
              test_name: test.test_name,
              test_code: test.test_code,
              description: test.description,
              test_result: test.result,
            });
          } else if (test.summary_type === "category") {
            let mergedResult = "";
            for (const subtest of test.subtests) {
              // subtest_criteria adalah string, bukan array
              if (subtest.result && subtest.result.subtest_criteria) {
                mergedResult += subtest.result.subtest_criteria + ",";
              }
            }
            data.tests.push({
              test_id: test.test_id ? test.test_id : null,
              test_name: test.test_name ? test.test_name : null,
              test_code: test.test_code ? test.test_code : null,
              description: test.description ? test.description : null,
              test_result: mergedResult.slice(0, -1), // remove trailing comma
            });
          }
        }
      } else if (category.summary_type === "detail") {
        for (const test of categoryDetails) {
          if (test.summary_type === "subtest") {
            const subtests = test.subtests || [];
            const values = Object.values(subtests);
            data.subtests.push(...values);
          } else if (test.summary_type === "category") {
            const subtests = test.subtests || [];
            const values = Object.values(subtests);
            data.subtests.push(...values);
          }
        }
      }
      intro.push(data);
    }

    return intro;
  } catch (e) {
    throw e;
  }
};

export const proceedSubtestCriteria = async (criteriaId: string, subtestPoint: number) => {
  try {
    let criteria;
    if (criteriaId) {
      criteria = await getCriteriaForReport(criteriaId);
    }

    console.log("criterianya", criteria);

    let matchingCriteria: any = null;
    let matchingStandardizedScore: any = null;

    if (criteria && criteria.standardized.length > 0) {
      matchingStandardizedScore = criteria.standardized.find((item) => {
        return subtestPoint === item.raw_score;
      });

      if (!matchingStandardizedScore) {
        matchingStandardizedScore = criteria.standardized.reduce((prev, curr) => {
          return Math.abs(curr.raw_score - subtestPoint) < Math.abs(prev.raw_score - subtestPoint) ? curr : prev;
        });
      }

      matchingCriteria = criteria.criterias.find((item: any) => {
        return (
          matchingStandardizedScore.standardized_score >= Number(item.minimum_score) &&
          matchingStandardizedScore.standardized_score <= Number(item.maximum_score)
        );
      });

      if (!matchingCriteria) {
        matchingCriteria = criteria.criterias.reduce((prev: any, curr: any) => {
          const diffPrev = Math.min(
            Math.abs(Number(prev.minimum_score) - matchingStandardizedScore.standardized_score),
            Math.abs(Number(prev.maximum_score) - matchingStandardizedScore.standardized_score)
          );
          const diffCurr = Math.min(
            Math.abs(Number(curr.minimum_score) - matchingStandardizedScore.standardized_score),
            Math.abs(Number(curr.maximum_score) - matchingStandardizedScore.standardized_score)
          );
          return diffCurr < diffPrev ? curr : prev;
        });
      }
    } else if (criteria && criteria.standardized.length === 0) {
      matchingCriteria = criteria.criterias.find((item: any) => {
        return subtestPoint >= Number(item.minimum_score) && subtestPoint <= Number(item.maximum_score);
      });

      if (!matchingCriteria) {
        matchingCriteria = criteria.criterias.reduce((prev: any, curr: any) => {
          const diffPrev = Math.min(
            Math.abs(Number(prev.minimum_score) - subtestPoint),
            Math.abs(Number(prev.maximum_score) - subtestPoint)
          );
          const diffCurr = Math.min(
            Math.abs(Number(curr.minimum_score) - subtestPoint),
            Math.abs(Number(curr.maximum_score) - subtestPoint)
          );
          return diffCurr < diffPrev ? curr : prev;
        });
      }
    }

    if (criteria && matchingCriteria && matchingStandardizedScore) {
      return {
        matchingCriteria,
        matchingStandardizedScore,
        scale:
          criteria.criterias && criteria.criterias.length > 0
            ? {
                minimum_score: Math.min(...criteria.criterias.map((c: any) => Number(c.minimum_score))),
                maximum_score: Math.max(...criteria.criterias.map((c: any) => Number(c.maximum_score))),
              }
            : null,
      };
    } else if (criteria && matchingCriteria && matchingStandardizedScore === null) {
      return {
        matchingCriteria,
        matchingStandardizedScore: {
          raw_score: subtestPoint,
          standardized_score: subtestPoint,
        },
        scale:
          criteria.criterias && criteria.criterias.length > 0
            ? {
                minimum_score: Math.min(...criteria.criterias.map((c: any) => Number(c.minimum_score))),
                maximum_score: Math.max(...criteria.criterias.map((c: any) => Number(c.maximum_score))),
              }
            : null,
      };
    } else {
      return {
        matchingCriteria: {
          criteria_name: null,
          criteria_color: null,
          minimum_score: null,
          maximum_score: null,
          description: "Criteria is not valid",
          color_id: null,
          color_name: null,
          hex_code: "#000000",
        },
        matchingStandardizedScore: {
          raw_score: subtestPoint,
          standardized_score: subtestPoint,
        },
        scale: {
          minimum_score: 0,
          maximum_score: 100,
        },
      };
    }
  } catch (e) {
    throw e;
  }
};

export const proceedDetail = async (batchId: string, assessee_id: string): Promise<ReportDetailSection[]> => {
  try {
    const reportDetailData: any = await getReportDetail(batchId);
    let detail = [];

    for (const test of reportDetailData) {
      const testMapping: Record<string, any> = {};
      const testId = test.test_id;
      const subtestMapping: Record<string, any> = {};
      // get test in batch data
      if (!testMapping[testId]) {
        testMapping[testId] = {
          category_id: test.category_id,
          category_name: test.category_name,
          category_code: test.category_code,
          test_id: testId,
          test_name: test.test_name,
          test_code: test.test_code,
          description: test.description,
          summary_type: test.summary_type,
          summary_formula: test.summary_formula,
          summary_view: test.summary_view,
          result: {},
          norm: [],
          subtests: [],
        };
        console.log("masuk norm");
        const norm = await getCriteriaForReport(test.criteria_id);
        testMapping[testId].norm.push(...norm.criterias);
        console.log("keluar norm");
        if (test.summary_type === "subtest") {
          // if detail summary is subtest
          const resultBySubtest: any = await getPersonalReportData(batchId, assessee_id, "subtest", test.test_id);
          let sumSubtestPoint = 0;
          let countSubtest = 0;

          for (const subtest of resultBySubtest) {
            let result = await proceedSubtestCriteria(subtest.criteria_id, Number(subtest.subtest_point));
            if (!isNaN(Number(subtest.subtest_point))) {
              console.log("sub subtest pointnya", subtest.subtest_point);
              sumSubtestPoint = sumSubtestPoint + Number(subtest.subtest_point);
              countSubtest++;
            }

            const proceedSubtest = {
              subtest_id: subtest.subtest_id,
              subtest_name: subtest.subtest_name,
              subtest_code: subtest.subtest_code,
              description: subtest.subtest_desc ? subtest.subtest_desc : null,
              result: {
                subtest_point: !isNaN(Number(result.matchingStandardizedScore.standardized_score))
                  ? Number(result.matchingStandardizedScore.standardized_score)
                  : 0,
                subtest_criteria: result ? result.matchingCriteria.criteria_name : "Undefined",
                criteria_color: result ? result.matchingCriteria.hex_code : "#CCCCCC",
                scale: result.scale,
                categories: [],
              },
            };

            console.log("proceedSubtest", proceedSubtest);
            testMapping[testId].subtests.push(proceedSubtest);
          }

          let testResult;
          let finalTestPoint: number = Number(sumSubtestPoint);
          console.log("final test poinnya", finalTestPoint);
          if (test.summary_type === "sum") {
            finalTestPoint *= 1;
          } else if (test.summary_type === "average") {
            finalTestPoint = countSubtest > 0 && !isNaN(sumSubtestPoint) ? finalTestPoint / countSubtest : 0;
          }

          const testCriteria: any = await proceedSubtestCriteria(test.criteria_id, finalTestPoint);

          testResult = {
            test_point: !isNaN(testCriteria.matchingStandardizedScore.standardized_score)
              ? testCriteria.matchingStandardizedScore.standardized_score
              : 0,
            criteria: testCriteria.matchingCriteria.criteria_name ? testCriteria.matchingCriteria.criteria_name : null,
            criteria_color: testCriteria.matchingCriteria.criteria_color
              ? testCriteria.matchingCriteria.criteria_color
              : 0,
            description: testCriteria.matchingCriteria.description ? testCriteria.matchingCriteria.description : null,
          };

          console.log(testResult);

          testMapping[testId].result = testResult;
        } else if (test.summary_type === "category") {
          // if summary type is category, category will be spread
          const resultByCategory: any = await getPersonalReportData(batchId, assessee_id, "category", test.test_id);
          let maxPoint: number = -Infinity;
          let bestCategory;
          let bestCriteria;

          for (const category of resultByCategory) {
            const subtestId = category.subtest_id;

            if (!subtestMapping[subtestId]) {
              subtestMapping[subtestId] = {
                subtest_id: subtestId,
                subtest_name: category.subtest_name,
                subtest_code: category.subtest_code,
                description: category.subtest_desc,
                result: {
                  subtest_point: null,
                  subtest_criteria: null,
                  criteria_color: null,
                  categories: [],
                },
              };
            }

            let categoryPoint;
            let criteria: any;
            if (test.summary_formula === "sum") {
              categoryPoint = Number(category.category_point);
              criteria = await proceedSubtestCriteria(category.category_criteria_id, categoryPoint);
            } else if (test.summary_formula === "avg") {
              const rawPoint = Number(category.category_point_avg);

              // Custom rounding rules
              const decimal = rawPoint % 1;
              if (decimal > 0.5) {
                categoryPoint = Math.ceil(rawPoint); // Naik
              } else if (decimal < 0.5) {
                categoryPoint = Math.floor(rawPoint); // Turun
              } else {
                categoryPoint = Math.trunc(rawPoint); // Tetap
              }

              criteria = await proceedSubtestCriteria(category.category_criteria_id, categoryPoint);
            }

            subtestMapping[subtestId].result.categories.push({
              category_id: category.category_id,
              category_name: category.category_name,
              category_code: category.category_code,
              category_point: categoryPoint,
              description: criteria.matchingCriteria?.description ?? null,
            });

            if (categoryPoint! > maxPoint) {
              maxPoint = categoryPoint!;
              bestCategory = [category]; // simpan seluruh objek
              bestCriteria = [criteria];
            } else if (categoryPoint === maxPoint) {
              bestCategory!.push(category);
              bestCriteria!.push(criteria);
            }
          }

          if (bestCategory) {
            const subtestId = bestCategory[0].subtest_id;
            subtestMapping[subtestId].result.subtest_point = Number(maxPoint);
            subtestMapping[subtestId].result.subtest_criteria = bestCategory.map((cat) => cat.category_name).join(", ");
            subtestMapping[subtestId].result.criteria_color = bestCriteria![0]?.hex_code ?? "#CCCCCC";
          }

          const values = Object.values(subtestMapping);
          testMapping[testId].subtests.push(...values);
        }
      }

      const values = Object.values(testMapping);
      detail.push(...values);
      console.log("detailnya nih", detail);
    }

    console.log("detailnya", detail[0].subtests);
    return detail;
  } catch (e) {
    throw e;
  }
};

export const proceeedProfile = async (type: string, assesseeId: string) => {
  try {
    const assesseeData: any =
      type === "internal" ? await getDarwinUser(String(assesseeId)) : await getAssesseeExternalProfile(assesseeId);
    console.log(assesseeData);
    const profile = {
      assessee_id: type === "internal" ? assesseeData.employee_id : assesseeData.id,
      assessee_name: type === "internal" ? assesseeData.full_name : assesseeData.name,
      assessee_email: type === "internal" ? assesseeData.company_email_id : assesseeData.email,
      assessee_gender: type === "internal" ? assesseeData.gender : assesseeData.gender,
      work_place: type === "internal" ? assesseeData.group_company : assesseeData.institution,
      assessee_age: moment().diff(
        moment(type === "internal" ? assesseeData.date_of_birth : assesseeData.date_of_birth, "YYYY-MM-DD"),
        "years"
      ),
      type: type,
      education: type === "internal" ? "" : assesseeData.education,
    };
    console.log("sebelum return");
    return profile;
  } catch (e) {
    throw e;
  }
};

const proceedLog = async (batchId: string, assesseeId: string) => {
  try {
    const log = await getReportLog(batchId, assesseeId);
    return log;
  } catch (e) {
    throw e;
  }
};

const proceedProctoring = async (batchId: string, user_id: string) => {
  try {
    const s3 = new S3ClientUpload();
    const list: any = await s3.ListObjects(`${batchId}/${user_id}`);

    const filteredWebCam = list.filter((item: any) => item.key.includes("_webcam"));
    const filteredScreen = list.filter((item: any) => item.key.includes("_screen"));

    const getRandomItems = <T>(arr: T[], n: number): T[] => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, n);
    };

    const result = {
      web_cam: getRandomItems(filteredWebCam, 8),
      screen: getRandomItems(filteredScreen, 8),
    };

    return result;
  } catch (e) {
    throw e;
  }
};

export const generateReportIndividual = async (batchId: string, assesseeId: string) => {
  try {
    // Get Report Guide

    const batchInformation = await getSpecificBatchInformationForReport(batchId, assesseeId);
    const profile = await proceeedProfile(batchInformation.type, assesseeId);
    console.log("keluar profile");
    const reportDetail = await proceedDetail(batchId, assesseeId);
    console.log("keluar report detail");
    // Get Report Intro
    const reportIntro = await proceedIntro(batchId, reportDetail);

    // Get Report Proctoring
    const reportProctoring = await proceedProctoring(batchId, assesseeId);

    // Get Report Log
    const reportLog = await proceedLog(batchId, assesseeId);

    const result = {
      cover: batchInformation.cover_id,
      guide: {
        content: batchInformation.content,
      },
      batch: {
        name: batchInformation.batch_name,
        code: batchInformation.batch_code,
        type: batchInformation.type,
        taken_at: batchInformation.taken_at,
      },
      profile: profile,
      intro: reportIntro,
      detail: reportDetail,
      log: reportLog,
      proctoring: reportProctoring,
    };

    console.log("resultnya", result);
    return result;
  } catch (error) {
    throw error;
  }
};

export const checkGenerate = async (batchId: string, assesseeId: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const result = await client.query(
      `
        SELECT * FROM
        t_batch_assessee
        WHERE batch_id = $1 AND assessee_nik = $2
        `,
      [batchId, assesseeId]
    );
    await client.query(TRANS.COMMIT);
    return result.rows[0];
  } catch (e) {
    await client.query(TRANS.ROLLBACK);
    throw e;
  } finally {
    client.release();
  }
};

export const getCoverDetailData = async (reportId: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    console.log("masuk query");
    const { rows } = await client.query(`select * from mst_image_cover where uid = $1`, [reportId]);
    await client.query(TRANS.COMMIT);
    console.log("keluar cover detail");
    console.log(rows[0]);
    return rows[0];
  } catch (e) {
    await client.query(TRANS.ROLLBACK);
    throw e;
  } finally {
    client.release();
  }
};

export const deleteCoverData = async (id_cover: string) => {
  return await ClientAction(async (client) => {
    try {
      await client.query(TRANS.BEGIN);
      const { rows: delete_cover } = await client.query(`delete from mst_image_cover where uid = $1`, [id_cover]);
      // set all report with this cover id to latest added existing cover
      const { rows: get_cover } = await client.query(`select uid from mst_image_cover order by create_at desc`);
      let cover_updated = "";
      if (get_cover[0]?.uid) {
        cover_updated = get_cover[0].uid;
      }
      const [que, val] = updateQuery("report_head", { cover_id: cover_updated }, { cover_id: id_cover });
      await client.query(que, val);

      await client.query(TRANS.COMMIT);
      return;
    } catch (error) {
      await client.query(TRANS.ROLLBACK);
      throw error;
    }
  });
};

export const GetAssessmentResultByUser = async (user_id: string, batch_id: string) => {
  return await ClientAction(async (client) => {
    try {
      let whereval = [];
      let whereque = [];
      let where = "";
      let index = 1;
      if (user_id) {
        whereque.push(`assessee_id = $${index}`);
        whereval.push(user_id);
        index++;
      }
      if (batch_id) {
        whereque.push(`batch_id = $${index}`);
        whereval.push(batch_id);
        index++;
      }
      if (whereval.length > 0) {
        where = "where " + whereque.join(" and ");
      }
      let query = `
      WITH
      -- 1. Filter the smallest set early
      filtered_tpbh AS (
          SELECT *
          FROM t_progress_batch_head ${where}
      ),

      -- 2. Precompute avg_score once for trbc
      trbc_avg AS (
          SELECT
              trbc.*,
              CASE 
                  WHEN category_point / question_count % 1 > 0.5 THEN ceil(category_point / question_count)
                  WHEN category_point / question_count % 1 < 0.5 THEN floor(category_point / question_count)
                  ELSE category_point / question_count
              END AS avg_score
          FROM test_result_by_category trbc
      )
          
      -- 3. Main query
        select
          tpbh.batch_id,
          tbh.batch_code,
          tbh.batch_name,
          tba.assessee_name,
          tbh.bu_id,
          tpbh.assessee_id,
          tbh.start_period,
          tbh.end_period,
          tpbd.test_id,
          mth.test_name,
          mth.test_code,
          tpbd.subtest_id,
          msh.subtest_name,
          msh.subtest_code,
          trbc.category_code,
          tpbd.sum_point,
          mss.standardized_score,
          mc_subtest.criteria_name as subtest_criteria_name,
          mc_subtest.description as subtest_criteria_desc,
          mc_subtest.minimum_score as subtest_minimum_score,
          mc_subtest.maximum_score as subtest_maximum_score,
          trbc.avg_score,
          mc_category.criteria_name as category_criteria_name,
          mc_category.description as category_criteria_desc,
          mc_category.minimum_score as category_min_score,
          mc_category.maximum_score as category_max_score,
          trbc.category_point,
          trbc.question_count,
          rtd.summary_formula,
          rtd.summary_type
        from
          filtered_tpbh tpbh
        left join t_batch_head tbh
            on
          tpbh.batch_id = tbh.id
        left join t_batch_assessee tba
            on
          tba.assessee_nik = tpbh.assessee_id
          and tba.batch_id = tpbh.batch_id
        left join t_progress_batch_det tpbd
            on
          tpbh.id = tpbd.head_id
        left join report_head rh
            on
          rh.batch_id = tpbh.batch_id
        left join report_test_detail rtd
            on
          rh.id = rtd.report_id
          and rtd.test_id = tpbd.test_id
        left join mst_subtest_head msh
            on
          msh.id = tpbd.subtest_id
        left join mst_test_head mth
            on
          mth.id = tpbd.test_id
        left join trbc_avg trbc
            on
          trbc.batch_id = tpbh.batch_id
          and trbc.subtest_id = tpbd.subtest_id
          and trbc.assessee_id = tpbh.assessee_id
        left join mst_standardized_score mss
            on
          msh.criteria_id = mss.value_id
          and tpbd.sum_point = case
            when summary_formula = 'sum' then mss.raw_score
            when summary_formula = 'avg' then trbc.avg_score
            else mss.raw_score
          end
        left join mst_criteria mc_subtest
            on
          mc_subtest.category_fk = msh.criteria_id
          and ((mss.standardized_score >= mc_subtest.minimum_score
            and mss.standardized_score <= mc_subtest.maximum_score
            and mss.standardized_score is not null)
          or (tpbd.sum_point >= mc_subtest.minimum_score
            and tpbd.sum_point <= mc_subtest.maximum_score
            and mss.standardized_score is null))
        left join mst_criteria mc_category
            on
          mc_category.category_fk = trbc.category_criteria_id
          and mc_category.minimum_score <= trbc.avg_score
          and mc_category.maximum_score >= trbc.avg_score
        order by
          tpbh.batch_id desc;

      `;
      const { rows: raw_data } = await client.query(query, whereval);
      let user_identity = {
        assessee_name: raw_data[0].assessee_name,
        assessee_id: raw_data[0].assessee_id,
      };
      const batch_data = new Map();
      for (const row of raw_data) {
        let main_data;
        if (row.summary_type == "subtest") {
          main_data = {
            category: row.subtest_code,
            points: parseFloat(
              row.standardized_score ?? (row.summary_formula == "avg" ? row.avg_score : row.sum_point)
            ),
            criteria: row.subtest_criteria_name,
            desc: row.subtest_criteria_desc,
          };
        } else {
          main_data = {
            category: row.category_code,
            points: parseFloat(
              row.standardized_score ?? (row.summary_formula == "avg" ? row.avg_score : row.sum_point)
            ),
            criteria: row.category_criteria_name,
            desc: row.category_criteria_desc,
          };
        }
        if (!batch_data.has(row.batch_id)) {
          let result = new Map();
          let subtest_result = new Map();
          subtest_result.set(row.subtest_code, {
            test_code: row.test_code,
            test_name: row.test_name,
            subtest_name: row.subtest_name,
            subtest_code: row.subtest_code,
            result: [main_data],
          });
          result.set(row.test_code, subtest_result);

          batch_data.set(row.batch_id, {
            batch_id: row.batch_id,
            batch_code: row.batch_code,
            batch_name: row.batch_name,
            result_batch: result,
          });
        } else {
          const test_batch = batch_data.get(row.batch_id).result_batch;
          let subtest_result = new Map();
          subtest_result.set(row.subtest_code, {
            test_code: row.test_code,
            test_name: row.test_name,
            subtest_name: row.subtest_name,
            subtest_code: row.subtest_code,
            result: [main_data],
          });
          if (!test_batch.has(row.test_code)) {
            test_batch.set(row.test_code, subtest_result);
          } else {
            if (!test_batch.get(row.test_code).has(row.subtest_code)) {
              test_batch.get(row.test_code).set(row.subtest_code, {
                test_code: row.test_code,
                test_name: row.test_name,
                subtest_name: row.subtest_name,
                subtest_code: row.subtest_code,
                result: [main_data],
              });
            } else {
              test_batch.get(row.test_code).get(row.subtest_code).result.push(main_data);
            }
          }
        }
      }
      let main: any[] = Object.values(Object.fromEntries(batch_data)).map((value) => value);
      main.map((value, index_main) => {
        main[index_main].result_batch = Object.fromEntries(value.result_batch);
        Object.keys(main[index_main].result_batch).forEach((value, index) => {
          console.log(main[index_main]);
          main[index_main].result_batch[value] = Object.fromEntries(main[index_main].result_batch[value]);
        });
      });

      return { user_identity, result: main };
    } catch (error) {
      throw error;
    }
  });
};
