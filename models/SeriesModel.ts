import { db } from "#dep/config/connection";
import { TRANSACTION as TRANS } from "#dep/config/transaction";
import { deleteQuery, insertQuery, updateQuery } from "#dep/helper/queryBuilder";
import {SeriesDetailRequest, SeriesHeaderRequest } from "#dep/types/SeriesTypes";
import {ResponseError} from "#dep/error/response-error";


export const createSeries = async (headerPayload: SeriesHeaderRequest, detailPayload: SeriesDetailRequest[]) => { // (headerPayload: SeriesHeaderRequest, detailPayload: SeriesDetailRequest[])
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [headerQ, headerV] = insertQuery("mst_series", headerPayload, "series_code");
    const headerResult = await client.query(headerQ, headerV);
    const [detailQ, detailV] = insertQuery("mst_series_det", detailPayload);
    await client.query(detailQ, detailV);
    await client.query(TRANS.COMMIT);
    return headerResult.rows[0].series_code;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const getSeries = async () => {
  const client = await db.connect(); // Koneksi dibuat di awal
  try {
    await client.query(TRANS.BEGIN);

    const result = await client.query(
      `
      SELECT 
        h.id,
        h.series_name,
        h.series_code,
        h.is_active,
        a.fullname AS created_by,
        h.created_date AS created_at,
        COUNT(d.question_id) AS question_count
      FROM mst_series h
      LEFT JOIN mst_series_det d ON h.id = d.series_id
      LEFT JOIN mst_admin_web a ON h.created_by = a.id
      GROUP BY h.id, h.series_name, h.series_code, h.is_active, a.fullname, h.created_date
      ORDER BY h.created_date DESC
      `
    );

    await client.query(TRANS.COMMIT);
    return result.rows;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};


export const deleteSeries = async (id: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const detailResult = await client.query(
        `
            DELETE FROM mst_series_det WHERE series_id = $1
            `,
        [id]
    );

    const headerResult = await client.query(
        `
            DELETE FROM mst_series WHERE id = $1 RETURNING series_code
            `,
        [id]
    );

    if (detailResult.rowCount === 0 || headerResult.rowCount === 0) {
      throw new ResponseError(404, `ID ${id} not found.`);
    }

    await client.query(TRANS.COMMIT);
    return headerResult.rows[0].series_code;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const updateSeries = async (id: string, headerPayload: SeriesHeaderRequest, detailPayload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [headerQ, headerV] = updateQuery("mst_series", headerPayload, { id }, "series_code");
    const result = await client.query(headerQ, headerV);
    if (result.rowCount === 0) throw new ResponseError(404, `Series with code ${result.rows[0].series_code} not exist`);
    const [detailQ, detailV] = insertQuery("mst_series_det", detailPayload);
    await client.query(detailQ, detailV);
    await client.query(TRANS.COMMIT);
    return result.rows[0].series_code;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const getSeriesDetail = async (id: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);

    const result = await client.query(
        `
      SELECT 
        s.id AS series_id,
        s.series_name,
        s.series_code,
        s.is_active,
        a_created.fullname AS created_by,
        s.created_date,
        a_updated.fullname AS updated_by,
        s.updated_date,
        
        q_selected.id AS detail_id,
        q.id AS question_id,
        q.q_input_text,
        q.q_input_image_url,
        q.answer_type,
        c.category_name,
        c.category_code,

        q.answer_choice_a_text,
        q.answer_choice_a_image_url,
        q.answer_choice_b_text,
        q.answer_choice_b_image_url,
        q.answer_choice_c_text,
        q.answer_choice_c_image_url,
        q.answer_choice_d_text,
        q.answer_choice_d_image_url,
        q.answer_choice_e_text,
        q.answer_choice_e_image_url,

        q.key_answer_point_a,
        q.key_answer_point_b,
        q.key_answer_point_c,
        q.key_answer_point_d,
        q.key_answer_point_e,

        q.category_id,
        
        a.fullname AS added_by,
        q_selected.added_at

      FROM 
        mst_series s
      LEFT JOIN
        mst_admin_web a_created ON s.created_by = a_created.id
      LEFT JOIN
        mst_admin_web a_updated ON s.updated_by = a_updated.id    
      LEFT JOIN
        mst_series_det q_selected ON s.id = q_selected.series_id
      LEFT JOIN 
        mst_question_answer q ON q_selected.question_id = q.id
      LEFT JOIN 
        mst_category c ON q.category_id = c.id
      LEFT JOIN 
        mst_admin_web a ON q.created_by = a.id
      WHERE 
        s.id = $1
      ORDER BY q_selected.added_at DESC
      `,
        [id]
    );

    await client.query(TRANS.COMMIT);

    if (result.rows.length === 0) {
      throw new Error("Series not found or no questions available.");
    }

    const seriesDetail = {
      id: result.rows[0].series_id,
      series_name: result.rows[0].series_name,
      series_code: result.rows[0].series_code,
      is_active: result.rows[0].is_active,
      created_by: result.rows[0].created_by,
      created_at: result.rows[0].created_date,
      updated_by: result.rows[0].updated_by,
      updated_date: result.rows[0].updated_date,
      questions: result.rows.map(row => ({
        id: row.detail_id,
        question_id: row.question_id,
        sequence: row.q_seq,
        layout_type: row.q_layout_type,
        input_text: row.q_input_text,
        input_image_url: row.q_input_image_url,
        answer_type: row.answer_type,
        category_name: row.category_name,
        category_code: row.category_code,
        answers: [
          { text: row.answer_choice_a_text, image: row.answer_choice_a_image_url, point: row.key_answer_point_a},
          { text: row.answer_choice_b_text, image: row.answer_choice_b_image_url, point: row.key_answer_point_b},
          { text: row.answer_choice_c_text, image: row.answer_choice_c_image_url, point: row.key_answer_point_c},
          { text: row.answer_choice_d_text, image: row.answer_choice_d_image_url, point: row.key_answer_point_d},
          { text: row.answer_choice_e_text, image: row.answer_choice_e_image_url, point: row.key_answer_point_a},
        ],
        category_id: row.category_id,
        question_code: row.question_code,
        added_by: row.added_by,
        added_at: row.added_at,
      }))
    };

    return seriesDetail;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const deleteQuestionFromSeries = async (seriesId: string, questionId: string, updatePayload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [headerQ, headerV] = updateQuery("mst_series", updatePayload, {
      id: seriesId,
    });
    const headerResult = await client.query(headerQ, headerV);

    const result = await client.query(
        `
        DELETE FROM mst_series_det WHERE series_id = $1 AND question_id = $2
        `,
        [seriesId, questionId]
    );

    if (result.rowCount === 0) {
      throw new ResponseError(404, `Question with ID ${questionId} is not in the Series with ID ${seriesId}`);
    }

    await client.query(TRANS.COMMIT);
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
}

export const getAvailableQuestionsForSeries = async (seriesId: string) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const existingQuestions = await client.query(
        `SELECT question_id FROM mst_series_det WHERE series_id = $1`,
        [seriesId]
    );

    const existingIds = existingQuestions.rows.map(r => r.question_id);

    let exclusionClause = '';
    let queryParams: any[] = [];

    if (existingIds.length > 0) {
      queryParams.push(existingIds);
      exclusionClause = 'WHERE id != ALL($1)';
    }

    const result = await client.query(
        `
      SELECT 
        id, 
        question_code
      FROM mst_question_answer
      ${exclusionClause}
      ORDER BY question_code
      `,
        queryParams
    );

    await client.query('COMMIT');

    return result.rows;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// const getQuestionBySerie
