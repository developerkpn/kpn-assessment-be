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

export const getBatchForReport = async () => {
  const client = await db.connect();
  try {
    const result = await client.query(`
    SELECT
      b.id,
      b.batch_name,
      b.batch_code,
      b.type,
      b.start_period,
      b.end_period,
      (SELECT COUNT(*) 
      FROM t_batch_assessee
      WHERE batch_id = b.id) AS total_assessee,
      r.id AS report_id
      FROM t_batch_head b
      LEFT JOIN report_head r ON b.id = r.batch_id
      WHERE b.end_period < NOW()
      ORDER BY end_period DESC
    `);

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
  report_id?: string
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

export const storeReporDesign = async (introPayload: any, detailPayload: any) => {
  try {
  } catch (e) {}
};

export const checkReportDesign = async (reportId: string) => {
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
  assesseeEmail: any,
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
        WHERE assessee_email = $1 AND batch_id = $2 AND test_id = $3
        `,
        [assesseeEmail, batchId, testId]
      );
    } else if (type === "category") {
      console.log("masuk model category");
      result = await client.query(
        `
        SELECT *
        FROM test_result_by_category
        WHERE assessee_email = $1 AND batch_id = $2 AND test_id = $3
        `,
        [assesseeEmail, batchId, testId]
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
          d.taken_at,
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
        from t_batch_log l
        WHERE l.batch_id = $1 AND l.user_id = $2
        ORDER BY created_at ASC
    `,
      [batchId, assesseeId]
    );

    return result.rows;
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
        LEFT JOIN t_progress_batch_head h ON a.assessee_nik = h.assessee_id
        LEFT JOIN t_progress_batch_det d ON h.id = d.head_id
        WHERE a.batch_id = $1
        GROUP BY a.assessee_nik, a.assessee_name, a.assessee_email
        ORDER BY a.assessee_name
      `,
      [batchId]
    );

    return result.rows;
  } catch (e) {
    console.error("Error fetching assessee list for report:", e);
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
    const rawData = await getCriteriaDetail(criteriaId);

    const groupedData = {
      value_name: rawData[0]?.value_name ? rawData[0].value_name : null,
      value_code: rawData[0]?.value_code ? rawData[0].value_code : null,
      criterias: rawData.reduce((acc: any, row: any): CriteriasReport[] => {
        if (row.criteria_name) {
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
    };
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
    const criteria = await getCriteriaForReport(criteriaId);
    let matchingCriteria = criteria.criterias.find((criteria: any) => {
      return subtestPoint >= Number(criteria.minimum_score) && subtestPoint <= Number(criteria.maximum_score);
    });

    if (matchingCriteria) {
      return matchingCriteria;
    } else {
      const invalidCriteria = {
        criteria_name: null,
        criteria_color: null,
        minimum_score: null,
        maximum_score: null,
        description: "Criteria is not valid",
        color_id: null,
        color_name: null,
        hex_code: "#000000",
      };
      return invalidCriteria;
    }
  } catch (e) {
    throw e;
  }
};

export const proceedDetail = async (batchId: string, assesseeEmail: string): Promise<ReportDetailSection[]> => {
  try {
    const reportDetailData: any = await getReportDetail(batchId);
    let detail = [];

    for (const test of reportDetailData) {
      const testMapping: Record<string, any> = {};
      const testId = test.test_id;
      const subtestMapping: Record<string, any> = {};
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

        const norm = await getCriteriaForReport(test.criteria_id);
        testMapping[testId].norm.push(...norm.criterias);

        if (test.summary_type === "subtest") {
          // if detail summary is subtest
          const resultBySubtest: any = await getPersonalReportData(batchId, assesseeEmail, "subtest", test.test_id);
          let sumSubtestPoint = 0;
          let countSubtest = 0;

          for (const subtest of resultBySubtest) {
            const result = await proceedSubtestCriteria(subtest.criteria_id, Number(subtest.subtest_point));
            if (!isNaN(Number(subtest.subtest_point))) {
              sumSubtestPoint = sumSubtestPoint + Number(subtest.subtest_point);
              countSubtest++;
            }

            const proceedSubtest = {
              subtest_id: subtest.subtest_id,
              subtest_name: subtest.subtest_name,
              subtest_code: subtest.subtest_code,
              description: subtest.subtest_desc ? subtest.subtest_desc : null,
              result: {
                subtest_point: !isNaN(Number(subtest.subtest_point)) ? Number(subtest.subtest_point) : 0,
                subtest_criteria: result ? result.criteria_name : "Undefined",
                criteria_color: result ? result.hex_code : "#CCCCCC",
                categories: [],
              },
            };

            testMapping[testId].subtests.push(proceedSubtest);
          }

          let testResult;
          let finalTestPoint: number = Number(sumSubtestPoint);

          if (test.summary_type === "sum") {
            finalTestPoint *= 1;
          } else if (test.summary_type === "average") {
            finalTestPoint = countSubtest > 0 && !isNaN(sumSubtestPoint) ? finalTestPoint / countSubtest : 0;
          }

          const testCriteria = await proceedSubtestCriteria(test.criteria_id, finalTestPoint);

          testResult = {
            test_point: !isNaN(finalTestPoint) ? finalTestPoint : 0,
            criteria: testCriteria.criteria_name ? testCriteria.criteria_name : null,
            criteria_color: testCriteria.criteria_color ? testCriteria.criteria_color : 0,
            description: testCriteria.description ? testCriteria.description : null,
          };

          testMapping[testId].result = testResult;
        } else if (test.summary_type === "category") {
          // if summary type is category, category will be spread
          const resultByCategory: any = await getPersonalReportData(batchId, assesseeEmail, "category", test.test_id);
          let maxPoint = -Infinity;
          let bestCategory = null;
          let bestCriteria = null;

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
            let matchedCriteria;
            if (test.summary_formula === "sum") {
              categoryPoint = Number(category.category_point);
              matchedCriteria = await proceedSubtestCriteria(category.category_criteria_id, categoryPoint);
            } else if (test.summary_formula === "avg") {
              categoryPoint = Number(category.category_point_avg);
              matchedCriteria = await proceedSubtestCriteria(category.category_criteria_id, categoryPoint);
            }

            subtestMapping[subtestId].result.categories.push({
              category_id: category.category_id,
              category_name: category.category_name,
              category_code: category.category_code,
              category_point: categoryPoint,
              description: matchedCriteria?.description ?? null,
            });

            if (categoryPoint! > maxPoint) {
              maxPoint = Number(categoryPoint);
              bestCategory = category;
              bestCriteria = matchedCriteria;
            }
          }

          if (bestCategory) {
            const subtestId = bestCategory.subtest_id;
            subtestMapping[subtestId].result.subtest_point = Number(bestCategory.category_point);
            subtestMapping[subtestId].result.subtest_criteria = bestCategory.category_name;
            subtestMapping[subtestId].result.criteria_color = bestCriteria?.hex_code ?? "#CCCCCC";
          }

          const values = Object.values(subtestMapping);
          testMapping[testId].subtests.push(...values);
        }
      }

      const values = Object.values(testMapping);
      detail.push(...values);
    }
    return detail;
  } catch (e) {
    throw e;
  }
};

export const proceeedProfile = async (type: string, assesseeId: string, assesseeEmail: string) => {
  try {
    const assesseeData: any =
      type === "internal" ? await getDarwinUser(String(assesseeId)) : await getAssesseeExternalProfile(assesseeEmail);

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
    };

    return profile;
  } catch (e) {
    throw e;
  }
};

export const proceedReportDesign = async (batchId: string) => {
  try {
    const batchInformation = await getBatchInformationForReport(batchId);
    const design = await getReportDesignDetail(batchId);
    const reportDesign = await transformResponseFormat(batchInformation, design);
    return reportDesign;
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
    console.log(list);

    // Urutkan dari yang terbaru ke yang lama
    const sortedList = list.sort(
      (a: any, b: any) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );

    // Filter file yang mengandung "_webcam" atau "_screen"
    const filteredWebCam: { key: string; lastModified: string }[] = sortedList.filter((item: any) =>
      item.key.includes("_webcam")
    );

    const filteredScreen: { key: string; lastModified: string }[] = sortedList.filter((item: any) =>
      item.key.includes("_screen")
    );

    // Ambil 3 item teratas
    const result = {
      web_cam: filteredWebCam.slice(0, 3),
      screen: filteredScreen.slice(0, 3),
    };

    return result;
  } catch (e) {
    throw e;
  }
};

export const generateReportIndividual = async (batchId: string, assesseeId: string, assesseeEmail: string) => {
  try {
    // Get Report Guide

    const batchInformation = await getSpecificBatchInformationForReport(batchId, assesseeId);
    const profile = await proceeedProfile(batchInformation.type, assesseeId, assesseeEmail);

    const reportDetail = await proceedDetail(batchId, assesseeEmail);

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
    return result;
  } catch (error) {
    throw error;
  }
};
