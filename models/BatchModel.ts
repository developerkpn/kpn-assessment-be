import { db } from "@/config/connection.js";
import { TRANSACTION as TRANS } from "@/config/transaction.js";
import { deleteQuery, insertQuery, updateQuery } from "@/helper/queryBuilder.js";
import { ResponseError } from "@/error/response-error.js";
import { async } from "rxjs";
import { Validation } from "@/validation/Validation.js";
import { BatchValidation } from "@/validation/BatchValidation.js";
import { v7 as uuid } from "uuid";
import axios from "axios";
import { axiosDarwin } from "@/config/axiosDarwin.js";
import { AxiosResponse } from "axios";
import { DataEmpDarwin } from "@/types/MasterDataTypes.js";
import { BatchTranslationRequest, BatchTranslationUpdateRequest } from "@/types/BatchTypes.js";
import moment from "moment";

export const createBatch = async (headerPayload: any, batchCodePayload: any, ccPayload: any, assesseePayload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [headerQ, headerV] = insertQuery("t_batch_head", headerPayload, "id");
    await client.query(headerQ, headerV);
    const [codeQ, codeV] = insertQuery("t_batch_code", batchCodePayload);
    await client.query(codeQ, codeV);
    const [emailQ, emailV] = insertQuery("t_batch_cc", ccPayload);
    await client.query(emailQ, emailV);
    const [assesseeQ, assesseeV] = insertQuery("t_batch_assessee", assesseePayload);
    await client.query(assesseeQ, assesseeV);
    await client.query(TRANS.COMMIT);
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const getBatch = async (
  { published }: { published: boolean },
  session: {
    role_name: string;
    user_id: string;
  }
) => {
  const client = await db.connect();
  let where = "";
  let whereque = [];
  let whereval: any[] = [];
  let index = 1;
  let query = "";
  if (published) {
    whereque.push(`tbh.status = $${index}`);
    whereval.push("Published");
    index++;
  }
  if (session.role_name != "Super Admin") {
    whereque.push(`maw.id = $${index}`);
    whereval.push(session.user_id);
    index++;
  }
  if (whereval.length > 0) {
    where = "WHERE " + whereque.join(" and ");
  }
  if (session.role_name != "Super Admin") {
    query = `
      with batches as (
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
                  creator.fullname as creator_fullname,
                  creator.id as creator_id,
                  maw.fullname,
                  maw.id as user_id
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
                left join mst_admin_web creator on
                  creator.id = tbh.created_by ${where})
                select
                  *
                from
                  batches 
                order by
                  created_at desc
    `;
  } else {
    query = `
    SELECT
                tbh.id,
                tbh.batch_name,
                tbh.batch_code,
                tbh.type,
                tbh.status,
                g.grouptest_code,
                COUNT(d.id) AS total_assessee,
                tbh.start_period,
                tbh.end_period,
                b.bu_code,
                f.fm_code
            FROM
                t_batch_head tbh
            LEFT JOIN
                mst_admin_web maw on maw.id = tbh.created_by
            LEFT JOIN
                mst_grouptest_head g ON tbh.grouptest_id = g.id
            LEFT JOIN
                t_batch_assessee d ON tbh.id = d.batch_id
            LEFT JOIN
                mst_business_unit b ON tbh.bu_id = b.id
            LEFT JOIN
                mst_function_menu f ON tbh.function_id = f.id
            GROUP BY 
                tbh.id, tbh.batch_name, tbh.batch_code, g.grouptest_code, tbh.type, tbh.status,
                tbh.start_period, tbh.end_period, b.bu_code, f.fm_code ${where}
            ORDER BY 
                tbh.created_at DESC   
    `;
  }
  try {
    const result = await client.query(query, whereval);

    return result.rows;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const updateBatch = async (
  id: string,
  batchHeadPayload: any,
  deletedCCEmailByRolePayload: any,
  deletedCCEmailByEmailPayload: any,
  selectedNewCCEmailPayload: any,
  deletedAssesseePayload: any,
  selectedNewAssesseePayload: any
) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    console.log("masuk 1");
    const [headerQ, headerV] = updateQuery("t_batch_head", batchHeadPayload, { id: id }, "batch_code");
    const header = await client.query(headerQ, headerV);
    if (header.rowCount === 0) throw new ResponseError(404, `Batch with ID ${id} is not found`);
    console.log("masuk 2");
    if (deletedCCEmailByEmailPayload.length > 0) {
      for (const item of deletedCCEmailByEmailPayload) {
        const [Q, V] = deleteQuery("t_batch_cc", item);
        await client.query(Q, V);
      }
    }
    console.log("masuk 3");
    if (deletedCCEmailByRolePayload.length > 0) {
      for (const item of deletedCCEmailByRolePayload) {
        const [Q, V] = deleteQuery("t_batch_cc", item);
        await client.query(Q, V);
      }
    }
    console.log("masuk 4");
    if (deletedAssesseePayload.length > 0) {
      for (const item of deletedAssesseePayload) {
        const [Q, V] = deleteQuery("t_batch_assessee", item);
        await client.query(Q, V);
      }
    }
    console.log("masuk 5");
    console.log(selectedNewCCEmailPayload);
    if (selectedNewCCEmailPayload.length > 0) {
      const [Q, V] = insertQuery("t_batch_cc", selectedNewCCEmailPayload);
      await client.query(Q, V);
    }
    console.log("masuk 6");
    if (selectedNewAssesseePayload.length > 0) {
      const [Q, V] = insertQuery("t_batch_assessee", selectedNewAssesseePayload);
      await client.query(Q, V);
    }
    console.log("masuk 7");
    await client.query(TRANS.COMMIT);
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const deleteBatch = async (id: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const detailResult = await client.query(
      `
            DELETE FROM t_batch_assessee WHERE batch_id = $1
            `,
      [id]
    );

    const headerResult = await client.query(
      `
            DELETE FROM t_batch_head WHERE id = $1 RETURNING batch_code
            `,
      [id]
    );

    if (detailResult.rowCount === 0 && headerResult.rowCount === 0) {
      throw new ResponseError(404, `Batch with ID ${id} is not found.`);
    }

    await client.query(TRANS.COMMIT);
    console.log(headerResult);
    return headerResult.rows[0].batch_code;
  } catch (error) {
    console.log(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const addAssessee = async (assesseePayload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [Q, V] = insertQuery("t_batch_assessee", assesseePayload);
    await client.query(Q, V);
    await client.query(TRANS.COMMIT);
  } catch (error) {
    console.log(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const getBatchDetail = async (id: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
           SELECT
                h.id,
                h.batch_name,
                h.batch_code,
                h.grouptest_id,
                h.bu_id,
                bu.bu_name,
                h.function_id,
                fm.fm_name,
                h.template_email_id,
                h.created_by,
                h.updated_by,
                h.created_at,
                h.updated_at,
                h.start_period,
                h.end_period,
                h.email_invitation,
                h.is_camera,
                h.is_mic,
                h.is_screenshot,
                h.description,
                h.status,
                h.type,
                h.language_id,
                COUNT(d.id) AS assessee_count
                FROM 
                    t_batch_head h 
                LEFT JOIN
                    t_batch_assessee d ON h.id = d.batch_id
                LEFT JOIN mst_email_template e ON h.template_email_id = e.id
                LEFT JOIN mst_function_menu fm ON h.function_id = fm.id
                LEFT JOIN mst_business_unit bu ON h.bu_id = bu.id
                WHERE h.id = $1 
                GROUP BY h.id,
                    h.batch_name,
                    h.batch_code,
                    h.grouptest_id,
                    h.bu_id,
                    bu.bu_name,
                    h.function_id,
                    fm.fm_name,
                    h.template_email_id,
                    h.created_by,
                    h.updated_by,
                    h.created_at,
                    h.updated_at,
                    h.start_period,
                    h.end_period,
                    h.email_invitation,
                    h.is_camera,
                    h.is_mic,
                    h.is_screenshot,
                    h.description,
                    h.status,
                    h.type      
           `,
      [id]
    );

    const ccEmails = await client.query(
      `
        SELECT id, role_id, cc_email
        FROM t_batch_cc
        WHERE batch_id = $1
        `,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ResponseError(404, `Batch with ID ${id} is not found`);
    }

    const email = await client.query(
      `
        SELECT
          id,
          subject,
          title,
          header,
          footer
         FROM mst_email_template
         WHERE id = $1
        `,
      [result.rows[0].template_email_id]
    );

    const batchAssessees = await client.query(
      `
          SELECT
            a.*,
            COALESCE(
              (SELECT COUNT(*) FROM t_progress_batch_det bd 
               JOIN t_progress_batch_head bh ON bd.head_id = bh.id 
               WHERE bh.assessee_id = a.assessee_nik AND bh.batch_id = a.batch_id AND bd.status = 'Not Taken'), 0
            ) as count_not_taken,
            COALESCE(
              (SELECT COUNT(*) FROM t_progress_batch_det bd 
               JOIN t_progress_batch_head bh ON bd.head_id = bh.id 
               WHERE bh.assessee_id = a.assessee_nik AND bh.batch_id = a.batch_id AND bd.status = 'In Progress'), 0
            ) as count_in_progress,
            COALESCE(
              (SELECT COUNT(*) FROM t_progress_batch_det bd 
               JOIN t_progress_batch_head bh ON bd.head_id = bh.id 
               WHERE bh.assessee_id = a.assessee_nik AND bh.batch_id = a.batch_id AND bd.status = 'Completed'), 0
            ) as count_completed,
            COALESCE(
              (SELECT COUNT(*) FROM t_progress_batch_det bd 
               JOIN t_progress_batch_head bh ON bd.head_id = bh.id 
               WHERE bh.assessee_id = a.assessee_nik AND bh.batch_id = a.batch_id), 0
            ) as total_tests
          FROM t_batch_assessee a
          WHERE a.batch_id = $1
        `,
      [id]
    );

    // Process assessee status based on test progress
    const assessees = batchAssessees.rows.map((assessee) => {
      let status = "Not Taken";

      // Converting string counts to numbers
      const notTaken = parseInt(assessee.count_not_taken) || 0;
      const inProgress = parseInt(assessee.count_in_progress) || 0;
      const completed = parseInt(assessee.count_completed) || 0;
      const totalTests = parseInt(assessee.total_tests) || 0;

      // If no tests are associated yet or all counts are 0, status is Not Taken
      if (totalTests === 0 || (notTaken === 0 && inProgress === 0 && completed === 0)) {
        status = "Not Taken";
      }
      // If all tests are completed and there's at least one completed test
      else if (completed === totalTests && completed > 0) {
        status = "Completed";
      }
      // If any test is in progress, status is In Progress
      else if (inProgress > 0) {
        status = "In Progress";
      }

      return {
        ...assessee,
        status,
      };
    });

    const batchDetail = result.rows[0];
    const ccEmail = ccEmails.rows;

    const data = {
      batch: {
        ...batchDetail,
        start_period: moment(batchDetail.start_period).tz("Asia/Jakarta").toISOString(),
        end_period: moment(batchDetail.end_period).tz("Asia/Jakarta").toISOString(),
        email: {
          id: email ? email.rows[0].id : null,
          subject: email ? email.rows[0].subject : null,
          title: email ? email.rows[0].title : null,
          header: email ? email.rows[0].header : null,
          footer: email ? email.rows[0].footer : null,
        },
      },
      assessees: assessees,
      cc_email: ccEmail,
    };

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const getBatchAssesses = async (id: string, assessee_id?: string) => {
  const client = await db.connect();
  try {
    let where_asseeid = "";
    let whereval = [id];
    if (assessee_id) {
      whereval.push(assessee_id);
      where_asseeid = "and assessee_nik = $2";
    }
    const result = await client.query(
      `
            SELECT 
                id,
                assessee_nik,
                assessee_name,
                assessee_email,
                is_darwin_exist
            FROM
                t_batch_assessee
            WHERE
                batch_id = $1 ${where_asseeid}
            `,
      whereval
    );
    return result.rows;
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    client.release();
  }
};

export const deleteBatchAssessee = async (batchId: string, assesseeId: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    await client.query(
      `
            DELETE FROM t_batch_assessee WHERE id = $2 AND batch_id = $1
            `,
      [batchId, assesseeId]
    );

    console.log(batchId, assesseeId);
    await client.query(TRANS.COMMIT);
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const publishBatch = async (id: string, status: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [Q, V] = updateQuery("t_batch_head", { status: status }, { id: id }, "template_email_id");
    const updateStatus = await client.query(Q, V);
    // const is_active = true;
    // const groupTestData: any = await client.query(
    //   `
    //   SELECT grouptest_id
    //   FROM t_batch_head
    //   WHERE id = $1
    // `,
    //   [id]
    // );
    //
    // console.log("grouptest data", groupTestData);
    //
    // // Update group test head
    // const [updateGTQ, updateGTV] = updateQuery("mst_grouptest_head", is_active, { id: id });
    // await client.query(updateGTQ, updateGTV);
    //
    // // Cari test dari group test
    // const testsData: any = await client.query(
    //   `
    //     SELECT
    //         test_id
    //     FROM mst_test_det
    //     WHERE grouptest_id = $1
    //     `,
    //   [groupTestData.id]
    // );
    //
    // // Update test-test head
    // let subtestData;
    // let seriesData;
    // let questionData;
    //
    // for (const testDatas of testsData) {
    //   const [updateTQ, updateTV] = updateQuery("mst_test_head", is_active, { id: testDatas.test_id });
    //   await client.query(updateTQ, updateTV);
    // }
    //
    // // Cari masing-masing subtest dari test
    //
    // // for
    //
    // // Update masing-masing subtest head
    // // Cari masing-masing series dari subtest
    // // Update masing-masing dari series head
    // // Cari masing-masing question dari series
    // // Update masing-masing question head
    //
    // // const [updateTQ];
    await client.query(TRANS.COMMIT);
    console.log("disini");
    console.log(updateStatus.rows[0].template_email_id);

    return updateStatus.rows[0].template_email_id;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const startProgress = async (headProgressPayload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [headerQ, headerV] = insertQuery("t_progress_batch_head", headProgressPayload);
    await client.query(headerQ, headerV);
    await client.query(TRANS.COMMIT);
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const getUserEmailByRole = async (roleId: any) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
       SELECT h.email
       FROM mst_admin_web h
       WHERE role_id = $1
       `,
      [roleId]
    );
    return result.rows;
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    client.release();
  }
};

export const storeEmailCC = async (data: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    console.log(data);
    const [Q, V] = insertQuery("t_batch_cc", data);
    await client.query(Q, V);
    await client.query(TRANS.COMMIT);
  } catch (e) {
    console.error(e);
    await client.query(TRANS.ROLLBACK);
    throw e;
  } finally {
    client.release();
  }
};

export const deleteEmailCC = async (batchId: string, id: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const deleteCCEmail = await client.query(
      `
      DELETE FROM t_batch_cc
      WHERE batch_id = $1 AND id = $2
      `,
      [batchId, id]
    );
    await client.query(TRANS.COMMIT);
  } catch (e) {
    console.error(e);
    await client.query(TRANS.ROLLBACK);
    throw e;
  } finally {
    client.release();
  }
};

export const getDarwinUser = async (nik_darwin: string) => {
  try {
    const { data: darwinUsers }: AxiosResponse<{ status: number; message: string; employee_data: DataEmpDarwin[] }> =
      await axiosDarwin.post("/employee", {
        api_key: process.env.API_KEY,
        datasetKey: process.env.DATASET_KEY,
        employee_ids: [nik_darwin],
      });

    if (darwinUsers.status == 0) {
      throw Error(darwinUsers.message);
    }
    return darwinUsers.employee_data[0];
  } catch (error) {
    throw error;
  }
};

export const getBatchCCEmail = async (id: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
        SELECT
          cc_email
        FROM t_batch_cc
        WHERE batch_id = $1
        `,
      [id]
    );

    return result.rows;
  } catch (e) {
    throw e;
  } finally {
    client.release();
  }
};

export const getAssesseeByDarwinNIK = async (assesseeNIK: string | string[]) => {
  // Convert single NIK to array if needed
  console.log("check file");
  console.log(Array.isArray(assesseeNIK));
  const nikList = Array.isArray(assesseeNIK) ? assesseeNIK : [assesseeNIK];
  console.log(nikList);
  return getAssesseeByDarwinNIKBatch(nikList);
};

export const getAssesseeByDarwinNIKBatch = async (nikList: string[]) => {
  try {
    const payload = {
      api_key: process.env.API_KEY,
      datasetKey: process.env.DATASET_KEY,
      employee_ids: nikList,
    };

    console.log("Payload:", payload);

    // Encode Basic Auth (username:password) to Base64
    const username = process.env.BASIC_AUTH_USERNAME || "no";
    console.log("Username:", username);
    const password = process.env.BASIC_AUTH_PASSWORD || "no";
    console.log("Password:", password);
    const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");
    console.log("Basic Auth:", basicAuth);

    const getAssessee: any = await axios.post(`${process.env.DARWIN_BASE_URL}/employee`, payload, {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
    });

    console.log("check");
    console.log(getAssessee);

    if (getAssessee.data.status === 0) {
      throw new ResponseError(404, "Assessee's not found");
    }

    console.log("Response received:");
    console.log("Employee data count:", getAssessee.data.employee_data.length);

    const assessee = getAssessee.data.employee_data.map((row: any) => {
      const result = {
        assessee_nik: row.employee_id,
        assessee_name: row.full_name,
        assessee_email: row.company_email_id,
      };
      return result;
    });

    console.log("Processed assessee data:", assessee);

    return assessee;
  } catch (e) {
    throw e;
  }
};

export const getBatchCode = async (tmCode: string, buCode: string, month: string, year: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
        SELECT 
        batch
        FROM t_batch_code
        WHERE tm_code = $1 AND bu_code = $2 AND month = $3 AND year = $4
        ORDER BY taken_at DESC
    `,
      [tmCode, buCode, month, year]
    );

    return result.rows[0];
  } catch (e) {
  } finally {
    client.release();
  }
};

export const getFMandBUCode = async (fmId: string, buId: string) => {
  const client = await db.connect();
  try {
    console.log(fmId, buId);
    const fmCode: any = await client.query(
      `
        SELECT
          fm_code
        FROM
          mst_function_menu
        WHERE 
          id = $1
        `,
      [fmId]
    );

    const buCode: any = await client.query(
      `
         SELECT 
            bu_code
         FROM
            mst_business_unit
         WHERE
            id = $1
        `,
      [buId]
    );

    const result = {
      fmCode: fmCode.rows[0].fm_code,
      buCode: buCode.rows[0].bu_code,
    };

    console.log(result);
    return result;
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    client.release();
  }
};

export const createBatchTranslation = async (payload: BatchTranslationRequest) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [q, v] = insertQuery("t_batch_head_translations", payload, "id");
    const result = await client.query(q, v);
    await client.query(TRANS.COMMIT);
    return result.rows[0].id;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const updateBatchTranslation = async (payload: BatchTranslationUpdateRequest, translationId: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [q, v] = updateQuery("t_batch_head_translations", payload, { id: translationId }, "id");
    const result = await client.query(q, v);
    await client.query(TRANS.COMMIT);
    return result.rows[0].id;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const getBatchTranslation = async (batchId: string, languageId?: string) => {
  const client = await db.connect();
  try {
    let result;
    if (languageId) {
      // Get specific translation for a language
      result = await client.query(
        `SELECT language_id, description FROM t_batch_head_translations
         WHERE batch_id = $1 AND language_id = $2`,
        [batchId, languageId]
      );
      return result.rows[0];
    } else {
      // Get all translations for the batch
      result = await client.query(
        `SELECT language_id, description FROM t_batch_head_translations
         WHERE batch_id = $1`,
        [batchId]
      );

      // Get all active languages
      const allLanguagesResult = await client.query(`SELECT language_code FROM mst_language WHERE is_active = true`);

      // Get batch main data for fallback
      const batchMainData = await client.query(`SELECT language_id, description FROM t_batch_head WHERE id = $1`, [
        batchId,
      ]);

      // Get English fallback if exists
      const enFallback = await client.query(
        `SELECT language_id, description FROM t_batch_head_translations
         WHERE batch_id = $1 AND language_id = 'en'`,
        [batchId]
      );

      // Create a map of existing translations
      const translationMap = new Map();
      result.rows.forEach((translation: any) => {
        translationMap.set(translation.language_id, translation);
      });

      // Fill in missing languages with fallback data
      const allLanguages = allLanguagesResult.rows;
      const mainLanguageId = batchMainData.rows[0]?.language_id;

      allLanguages.forEach((lang: any) => {
        const languageCode = lang.language_code;

        // If this language is the main language, add the main batch data
        if (languageCode === mainLanguageId && batchMainData.rows.length > 0) {
          if (!translationMap.has(languageCode)) {
            translationMap.set(languageCode, {
              batch_id: batchId,
              language_id: languageCode,
              description: batchMainData.rows[0].description,
              id: null,
              created_by: null,
              created_date: null,
              updated_by: null,
              updated_date: null,
            });
          }
        } else if (!translationMap.has(languageCode)) {
          // Try English fallback first
          if (enFallback.rows.length > 0) {
            translationMap.set(languageCode, {
              ...enFallback.rows[0],
              language_id: languageCode,
              id: null, // Mark as fallback
              is_fallback: true,
              fallback_source: "en",
            });
          } else {
            translationMap.set(languageCode, {
              batch_id: batchId,
              language_id: languageCode,
              description: batchMainData.rows[0].description,
              id: null,
              created_by: null,
              created_date: null,
              updated_by: null,
              updated_date: null,
              is_fallback: true,
              fallback_source: batchMainData.rows[0].language_id || "main",
            });
          }
        }
      });

      return Array.from(translationMap.values());
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const getLanguagesWithBatchTranslationStatus = async (batchId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `SELECT
        ml.id,
        ml.language_code,
        ml.language_name,
        ml.language_name_native,
        ml.is_active,
        bh.language_id as main_language_code,
        CASE
          WHEN bh.language_id = ml.language_code THEN 'main'
          WHEN bht.language_id IS NOT NULL THEN 'translation_exists'
          ELSE 'translation_available'
        END as translation_status
      FROM mst_language ml
      LEFT JOIN t_batch_head bh ON bh.id = $1
      LEFT JOIN t_batch_head_translations bht ON bht.batch_id = $1
        AND bht.language_id = ml.language_code
      WHERE ml.is_active = true
      ORDER BY ml.language_name`,
      [batchId]
    );
    return result.rows;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};
