import { db } from "#dep/config/connection";
import { TRANSACTION as TRANS } from "#dep/config/transaction";
import { deleteQuery, insertQuery, updateQuery } from "#dep/helper/queryBuilder";
import { ResponseError } from "#dep/error/response-error";

export const getBatchInformationForReport = async (batchId: string) => {
  const client = await db.connect();
  try {
    const batchInformation = await client.query(
      `
        SELECT 
          b.*,
          c.*, 
          g.*, 
          t.*
        FROM t_batch_head b
        LEFT JOIN mst_grouptest_det g ON b.grouptest_id = g.grouptest_id
        LEFT JOIN mst_test_head t ON g.test_id = t.id
        LEFT JOIN mst_category c ON t.category_id = c.id
        WHERE b.id = $1
        GROUP BY b.id, g.id, t.id, c.id
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

export const assignReportDesign = async (reportHead: any, reportIntro: any, reportDetail: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [headerQ, headerV] = insertQuery("report_head", reportHead);
    await client.query(headerQ, headerV);
    const [introQ, introV] = insertQuery("report_test_intro", reportIntro);
    await client.query(introQ, introV);
    const [detailQ, detailV] = insertQuery("report_test_detail", reportDetail);
    await client.query(detailQ, detailV);

    await client.query(TRANS.COMMIT);
  } catch (e) {
    console.error(e);
    await client.query(TRANS.ROLLBACK);
    throw e;
  } finally {
    client.release();
  }
};

export const generateReportForSpecificAssessee = async (assesseeId: any) => {
  const client = await db.connect();
  try {
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
