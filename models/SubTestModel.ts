import { db } from "@/config/connection.js";
import { TRANSACTION as TRANS } from "@/config/transaction.js";
import { deleteQuery, insertQuery, updateQuery } from "@/helper/queryBuilder.js";
import { SubTestDetailRequest, SubTestHeaderRequest, SubTestRequest } from "@/types/MasterDataTypes.js";
import { ResponseError } from "@/error/response-error.js";

export const createSubTest = async (payloadHeader: any, payloadDetail: any[]) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [headerQ, headerV] = insertQuery("mst_subtest_head", payloadHeader, "subtest_code");
    const headerResult = await client.query(headerQ, headerV);
    const [detailQ, detailV] = insertQuery("mst_subtest_det", payloadDetail, "id");
    await client.query(detailQ, detailV);
    await client.query(TRANS.COMMIT);
    return headerResult.rows[0].subtest_code;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const getSubTest = async () => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
            SELECT
                h.id,
                h.subtest_name,
                h.subtest_code,
                h.is_duration,
                h.subtest_duration,
                h.is_active,
                a.fullname AS created_by,
                h.created_at,
                COUNT(d.series_id) AS series_count    
            FROM mst_subtest_head h
            LEFT JOIN mst_subtest_det d ON h.id = d.subtest_id
            LEFT JOIN mst_admin_web a ON h.created_by = a.id
            GROUP BY h.id, h.subtest_name, h.subtest_code, h.is_active, h.is_duration, h.subtest_duration, a.fullname, h.created_at
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

export const updateSubTest = async (subtestId: string, headerPayload: any, addSeries: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [headerQ, headerV] = updateQuery("mst_subtest_head", headerPayload, { id: subtestId }, "subtest_code");
    const headerResult = await client.query(headerQ, headerV);

    if (!headerResult.rows || headerResult.rows.length === 0 || !headerResult.rows[0].subtest_code) {
      throw new ResponseError(404, `Sub Test with ID ${subtestId} is not found`);
    }

    console.log("masuk 1s");

    await client.query(
      `
        DELETE FROM mst_subtest_det
        WHERE subtest_id = $1 
        `,
      [subtestId]
    );

    // if (deletedSeries.length > 0) {
    //   for (const item of deletedSeries) {
    //     const [Q, V] = deleteQuery("mst_subtest_det", item);
    //     await client.query(Q, V);
    //   }
    // }

    console.log("masuk 2s");
    console.log(addSeries);
    if (addSeries.length > 0) {
      const [Q, V] = insertQuery("mst_subtest_det", addSeries);
      await client.query(Q, V);
    }

    console.log("masuk 3s");

    await client.query(TRANS.COMMIT);
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const deleteSubTest = async (id: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);

    const detailResult = await client.query(
      `
            DELETE FROM mst_subtest_det WHERE subtest_id = $1
            `,
      [id]
    );

    const headerResult = await client.query(
      `
            DELETE FROM mst_subtest_head WHERE id = $1 RETURNING subtest_code
            `,
      [id]
    );

    await client.query(TRANS.COMMIT);
    console.log(headerResult);
    return headerResult.rows[0].subtest_code;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const getSubTestDetail = async (id: string) => {
  const client = await db.connect();
  try {
    console.log("check detail subtest");
    const result = await client.query(
      `
      SELECT
        h.id AS subtest_id,
        h.subtest_name,
        h.subtest_code,
        h.is_duration,
        h.subtest_duration,
        h.intro_desc,
        h.subtest_desc,
        h.series_example_id,
        h.is_example_answer_shown,
        h.is_active,
        h.is_criteria,
        a.fullname AS created_by,
        h.created_at,
        au.fullname AS updated_by,
        h.updated_at,
        s.id AS series_id,
        s.series_name,
        s.series_code,
        d.id AS detail_id,
        ad.fullname AS added_by,
        d.added_at,
        v.id as value_id,
        v.value_name,
        v.value_code,
        c.id as criteria_id,
        c.criteria_name,
        c.minimum_score,
        c.maximum_score,
        c.description,
        c.color_id,
        (
          SELECT COUNT(sd.question_id)
          FROM mst_series_det sd
          WHERE sd.series_id = s.id
        ) AS question_count
      FROM
        mst_subtest_head h
      LEFT JOIN
        mst_subtest_det d ON h.id = d.subtest_id
      LEFT JOIN 
        mst_series s ON d.series_id = s.id
      LEFT JOIN
        mst_admin_web a ON h.created_by = a.id
      LEFT JOIN
        mst_admin_web au ON h.updated_by = au.id
      LEFT JOIN 
        mst_admin_web ad ON d.added_by = ad.id
      LEFT JOIN
        mst_value v ON h.criteria_id = v.id
      LEFT JOIN
        mst_criteria c ON v.id = c.category_fk
      WHERE
        h.id = $1 
      `,
      [id]
    );

    console.log("masuk series example");

    let seriesExample;
    if (result.rows[0].series_example_id) {
      seriesExample = await client.query(
        `
        SELECT
          *
        FROM mst_series
        WHERE id = $1
        `,
        [result.rows[0].series_example_id]
      );
    }

    console.log(seriesExample);

    if (result.rows.length === 0) {
      return null;
    }

    // Group criteria by unique criteria data
    const criteriaMap = new Map();
    result.rows.forEach((row) => {
      if (row.criteria_id) {
        criteriaMap.set(row.criteria_id, {
          id: row.criteria_id,
          criteria_name: row.criteria_name,
          minimum_score: row.minimum_score,
          maximum_score: row.maximum_score,
          description: row.description,
          criteria_color: row.criteria_color,
        });
      }
    });

    // Get unique series
    const seriesMap = new Map();
    result.rows.forEach((row) => {
      if (row.series_id) {
        seriesMap.set(row.series_id, {
          id: row.detail_id,
          series_id: row.series_id,
          series_name: row.series_name,
          series_code: row.series_code,
          added_by: row.added_by,
          added_at: row.added_at,
          question_count: row.question_count,
        });
      }
    });

    const subtestDetail = {
      id: result.rows[0].subtest_id,
      subtest_name: result.rows[0].subtest_name,
      subtest_code: result.rows[0].subtest_code,
      is_duration: result.rows[0].is_duration,
      subtest_duration: result.rows[0].subtest_duration,
      is_active: result.rows[0].is_active,
      intro_desc: result.rows[0].intro_desc,
      subtest_desc: result.rows[0].subtest_desc,
      series_example_id: result.rows[0].series_example_id,
      is_example_answer_shown: result.rows[0].is_example_answer_shown,
      created_by: result.rows[0].created_by,
      created_at: result.rows[0].created_at,
      updated_by: result.rows[0].updated_by,
      updated_at: result.rows[0].updated_at,
      is_criteria: result.rows[0].is_criteria,
      example_series: {
        series_id: seriesExample ? seriesExample.rows[0].id : null,
        series_name: seriesExample ? seriesExample.rows[0].series_name : null,
        series_code: seriesExample ? seriesExample.rows[0].series_code : null,
      },
      criteria: {
        value_id: result.rows[0].value_id,
        value_name: result.rows[0].value_name,
        value_code: result.rows[0].value_code,
        criteria: Array.from(criteriaMap.values()),
      },
      series: Array.from(seriesMap.values()),
    };

    return subtestDetail;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const getAvailableSeriesForSubTest = async (subtestId: string) => {
  const client = await db.connect();
  try {
    const existingSeries = await client.query(
      `
            SELECT series_id FROM mst_subtest_det WHERE subtest_id = $1
            `,
      [subtestId]
    );

    const existingIds = existingSeries.rows.map((r) => r.series_id);

    let exclusionClause = "";
    let queryParams: any[] = [];

    if (existingIds.length > 0) {
      queryParams.push(existingIds);
      exclusionClause = "WHERE s.id != ALL($1)"; // Add table alias 's.' here
    }

    const result = await client.query(
      `
            SELECT 
              s.id,
              s.series_name, 
              s.series_code,
              a.fullname AS created_by,
              s.created_date AS created_at,
              (
                  SELECT COUNT(sd.question_id)
                  FROM mst_series_det sd
                  WHERE sd.series_id = s.id
              ) AS question_count
          FROM mst_series s
          LEFT JOIN mst_admin_web a ON s.created_by = a.id
          ${exclusionClause}
          ORDER BY s.created_date DESC;
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

export const deleteSeriesFromSubTest = async (subtestId: string, detailId: string, updatePayload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [headerQ, headerV] = updateQuery("mst_subtest_head", updatePayload, { id: subtestId });
    await client.query(headerQ, headerV);

    const result = await client.query(
      `
        DELETE FROM mst_subtest_det WHERE id = $1
        `,
      [detailId]
    );

    if (result.rowCount === 0) {
      throw new ResponseError(404, `Seris with Detail ID ${detailId} is not exist on existing Sub Test`);
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
