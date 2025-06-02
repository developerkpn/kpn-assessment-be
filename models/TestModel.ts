import { db } from "#dep/config/connection";
import { TRANSACTION as TRANS } from "#dep/config/transaction";
import { deleteQuery, insertQuery, updateQuery } from "#dep/helper/queryBuilder";
import {
  SubTestHeaderRequest,
  TestDetailRequest,
  TestHeaderRequest,
  TestHeaderUpdateRequest,
} from "#dep/types/MasterDataTypes";
import { ResponseError } from "#dep/error/response-error";

export const createTest = async (payloadHeader: any, payloadDetail: any[]) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [headerQ, headerV] = insertQuery("mst_test_head", payloadHeader, "test_code");
    const headerResult = await client.query(headerQ, headerV);
    const [detailQ, detailV] = insertQuery("mst_test_det", payloadDetail);
    await client.query(detailQ, detailV);
    await client.query(TRANS.COMMIT);
    return headerResult.rows[0].test_code;
  } catch (error: any) {
    console.log(error.message);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const getTest = async () => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
            SELECT
                h.id,
                h.test_name,
                h.test_code,
                c.category_name,
                c.category_code,
                h.is_active,
                a.fullname AS created_by,
                h.created_at,
                COUNT(d.subtest_id) AS subtest_count
            FROM mst_test_head h
            LEFT JOIN mst_test_det d ON h.id = d.test_id 
            LEFT JOIN mst_admin_web a ON h.created_by = a.id
            LEFT JOIN mst_category c ON h.category_id = c.id
            GROUP BY h.id, h.test_name, h.test_code, c.category_name, c.category_code, h.is_active, a.fullname, h.created_at
            ORDER BY h.created_at DESC
            `
    );
    return result.rows;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const updateTest = async (testId: string, headerPayload: any, detailPayload: any[]) => {
  const client = await db.connect();
  console.log(`test`);
  console.log(detailPayload);
  try {
    await client.query(TRANS.BEGIN);
    const [headerQ, headerV] = updateQuery("mst_test_head", headerPayload, { id: testId }, "test_code");
    console.log("keluar 1");
    const headerResult = await client.query(headerQ, headerV);
    console.log("keluar 2");
    if (!headerResult.rows[0].test_code) throw new ResponseError(404, `Test with ID ${testId} is not found`);
    console.log("keluar 3");
    if (detailPayload.length > 0) {
      console.log("masuk");
      const [detailQ, detailV] = insertQuery("mst_test_det", detailPayload);
      await client.query(detailQ, detailV);
    }
    await client.query(TRANS.COMMIT);
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const deleteTest = async (id: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);

    const detailResult = await client.query(
      `
            DELETE FROM mst_test_det WHERE test_id = $1
            `,
      [id]
    );

    const headerResult = await client.query(
      `
            DELETE FROM mst_test_head WHERE id = $1 RETURNING test_code
            `,
      [id]
    );

    if (headerResult.rowCount === 0) {
      throw new ResponseError(404, `Test with ID ${id} is not found.`);
    }

    await client.query(TRANS.COMMIT);
    console.log(headerResult);
    return headerResult.rows[0].test_code;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const getTestDetail = async (id: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
            SELECT
                h.id AS subtest_id,
                h.test_name,
                h.test_code,
                h.is_active,
                h.description,
                a.fullname AS created_by,
                h.created_at,
                a.fullname AS updated_by,
                h.updated_at,
                s.id AS subtest_id,
                s.subtest_name,
                s.subtest_code,
                h.category_id,
                c.category_name,
                c.category_code,
                d.id AS detail_id,
                ad.fullname AS added_by,
                d.added_at,
                (
                    SELECT COUNT(sd.series_id)
                    FROM mst_subtest_det sd
                    WHERE sd.subtest_id = s.id
                ) AS series_count
            FROM
                mst_test_head h
            LEFT JOIN
                mst_test_det d ON h.id = d.test_id
            LEFT JOIN 
                mst_subtest_head s ON d.subtest_id = s.id
            LEFT JOIN 
                mst_admin_web a ON h.created_by = a.id
            LEFT JOIN
                mst_admin_web ads ON h.updated_by = ads.id
            LEFT JOIN
                mst_admin_web ad ON d.added_by = ad.id
            LEFT JOIN
                mst_category c ON h.category_id = c.id
            WHERE
                h.id = $1 
            `,
      [id]
    );

    const subtestDetail = {
      id: result.rows[0].test_id,
      test_name: result.rows[0].test_name,
      test_code: result.rows[0].test_code,
      category_id: result.rows[0].category_id,
      category_name: result.rows[0].category_name,
      category_code: result.rows[0].category_code,
      description: result.rows[0].description,
      is_active: result.rows[0].is_active,
      created_by: result.rows[0].created_by,
      created_at: result.rows[0].created_at,
      updated_by: result.rows[0].updated_by,
      updated_at: result.rows[0].updated_at,
      subtests: result.rows.map((row) => ({
        id: row.detail_id,
        subtest_id: row.subtest_id,
        subtest_name: row.subtest_name,
        subtest_code: row.subtest_code,
        added_by: row.added_by,
        added_at: row.added_at,
        series_count: row.series_count,
      })),
    };

    return subtestDetail;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const getAvailableSubTestForTest = async (testId: string) => {
  const client = await db.connect();
  try {
    const existingSubTest = await client.query(
      `
            SELECT subtest_id FROM mst_test_det WHERE test_id = $1
            `,
      [testId]
    );

    const existingIds = existingSubTest.rows.map((r) => r.subtest_id);

    let exclusionClause = "";
    let queryParams: any[] = [];

    if (existingIds.length > 0) {
      queryParams.push(existingIds);
      exclusionClause = "WHERE h.id != ALL($1)";
    }

    const result = await client.query(
      `
            SELECT
                h.id,
                h.subtest_name,
                h.subtest_code,
                h.is_active,
                a.fullname AS created_by,
                h.created_at,
                COUNT(d.series_id) AS series_count    
            FROM mst_subtest_head h
            LEFT JOIN mst_subtest_det d ON h.id = d.subtest_id
            LEFT JOIN mst_admin_web a ON h.created_by = a.id
            ${exclusionClause}
            GROUP BY h.id, h.subtest_name, h.subtest_code, h.is_active, a.fullname, h.created_at
            ORDER BY h.created_at DESC
            `,
      queryParams
    );

    return result.rows;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const deleteSubTestFromTest = async (testId: string, detailId: string, updatePayload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [headerQ, headerV] = updateQuery("mst_test_head", updatePayload, { id: testId });
    await client.query(headerQ, headerV);

    const result = await client.query(
      `
        DELETE FROM mst_test_det WHERE id = $1
        `,
      [detailId]
    );

    if (result.rowCount === 0) {
      throw new ResponseError(404, `Test with detail ID ${detailId} is not exist on existing Test`);
    }
    await client.query(TRANS.COMMIT);
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const getSubTestIdByTestId = async (testId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
            SELECT subtest_id FROM mst_test_det WHERE test_id = $1
            `,
      [testId]
    );

    return result.rows;
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    client.release();
  }
};
