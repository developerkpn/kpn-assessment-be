import { db } from "#dep/config/connection";
import { TRANSACTION as TRANS } from "#dep/config/transaction";
import { deleteQuery, insertQuery, updateQuery } from "#dep/helper/queryBuilder";
import { SeriesRequest } from "#dep/types/MasterDataTypes";
import {SeriesDetailRequest, SeriesHeaderRequest, SeriesRequests} from "#dep/types/SeriesTypes";


export const getListSeriesByCategory = async (id: number) => {
    const client = await db.connect();

    try {
      await client.query(TRANS.BEGIN);
      const seriesListByCategory = await client.query(
          `
          SELECT
           id, series_name, series_code
          FROM mst_series
          WHERE category_id = $1
          `, [id]
      );
      await client.query(TRANS.COMMIT);
      return seriesListByCategory.rows;
    } catch (error) {
      console.error(error);
      await client.query(TRANS.ROLLBACK);
      throw error;
    } finally {
      client.release();
    }
}

export const getListQuestionForSeries = async (page: number, search: string, category: number) => {
  const client = await db.connect();

  // const limit = 10; // Jumlah data per halaman
  // const offset = (page - 1) * limit; // Menghitung offset berdasarkan nomor halaman

  console.log(category);
  try {
    await client.query(TRANS.BEGIN);

    // Query to fetch paginated data with search on question_code
    const result = await client.query(
        `
      SELECT id, question_code FROM mst_question_answer
      WHERE question_code ILIKE $1 OR category_id = $2 
      `, [`%${search}%`, category]
    );

    // // Query to count total rows matching the search term
    // const countResult = await client.query(
    //     `
    //   SELECT COUNT(*) AS total FROM mst_question_answer
    //   WHERE question_code ILIKE $1 AND category_id = $2
    //   `, [`%${search}%`, category]
    // );

    await client.query(TRANS.COMMIT);

    // const totalRows = parseInt(countResult.rows[0].total, 10);
    // const totalPages = Math.ceil(totalRows / limit);
    //
    // if (page > totalPages) throw Error("Data tidak ditemukan");

    return {
      data: result.rows,
      // paging: {
      //   current_page: page,
      //   total_page: totalPages,
      //   size: limit,
      // },
    };
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
}

export const getAvailableQuestionsForSeries = async (
    page: number,
    search: string,
    seriesId: string
) => {
  const client = await db.connect();
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    await client.query('BEGIN');

    // 1. Ambil kategori series dan validasi keberadaan
    const seriesQuery = await client.query(
        `SELECT category_id FROM mst_series WHERE id = $1`,
        [seriesId]
    );

    if (seriesQuery.rows.length === 0) {
      throw new Error('Series tidak ditemukan');
    }

    const categoryId = seriesQuery.rows[0].category_id;

    console.log(categoryId)
    // 2. Ambil question_id yang sudah ada di series
    const existingQuestions = await client.query(
        `SELECT question_id FROM mst_series_det WHERE series_id = $1`,
        [seriesId]
    );

    const existingIds = existingQuestions.rows.map(r => r.question_id);
    console.log(existingIds)
    // 3. Query utama dengan filter
    const queryParams: any[] = [
      limit,
      offset,
      `%${search}%`,
      categoryId,
    ];

    // Filter ID yang sudah ada
    let exclusionClause = '';
    if (existingIds.length > 0) {
      queryParams.push(existingIds);
      exclusionClause = 'AND mqa.id != ALL($5)';
    }

    // Query data
    const result = await client.query(
        `
      SELECT 
        mqa.id,
        mqa.question_code,
        mqa.category_id
      FROM mst_question_answer mqa
      WHERE 
        mqa.category_id = $4 AND
        mqa.question_code ILIKE $3
        ${exclusionClause}
      ORDER BY mqa.question_code
      LIMIT $1 OFFSET $2
      `,
        queryParams
    );

    console.log(result)

    // Query total data
    const countResult = await client.query(
        `
      SELECT COUNT(*) AS total
      FROM mst_question_answer mqa
      WHERE 
        mqa.category_id = $2 AND
        mqa.question_code ILIKE $1
        ${existingIds.length > 0 ? 'AND mqa.id != ALL($3)' : ''}
      `,
        [
          `%${search}%`,
          categoryId,
          ...(existingIds.length > 0 ? [existingIds] : [])
        ]
    );

    await client.query('COMMIT');

    // Hitung pagination
    const totalRows = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(totalRows / limit);

    return {
      data: result.rows,
      paging: {
        current_page: page,
        total_page: totalPages,
        size: limit,
        total_items: totalRows
      }
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const createSeries = async (headerPayload: SeriesHeaderRequest) => { // (headerPayload: SeriesHeaderRequest, detailPayload: SeriesDetailRequest[])
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [headerQ, headerV] = insertQuery("mst_series", headerPayload, "series_name");
    const headerResult = await client.query(headerQ, headerV);
    // const [detailQ, detailV] = insertQuery("mst_series_det", detailPayload);
    // const detailResult = await client.query(detailQ, detailV);
    await client.query(TRANS.COMMIT);
    return headerResult.rows[0].series_name;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const getSeries = async (page: number, search: string, date: string, active: boolean) => {
  const client = await db.connect();
  const limit = 10;
  const offset = (page - 1) * limit;
  try {
    await client.query(TRANS.BEGIN);

    const sortOrder = date === 'ASC' ? 'ASC' : 'DESC';

    const result = await client.query(
        `
      SELECT 
        h.id AS series_id,
        h.series_name,
        h.series_code,
        h.is_active,
        h.created_by,
        h.created_date AS created_at,
        COUNT(d.question_id) AS question_count
      FROM mst_series h
      LEFT JOIN mst_series_det d ON h.id = d.series_id
      LEFT JOIN mst_admin_web a ON h.created_by = a.id
      WHERE h.is_active = $4 AND (h.series_name ILIKE $3 OR h.series_code ILIKE $3)
      GROUP BY h.id, h.series_name, h.series_code, h.is_active, h.created_by, h.created_date
      ORDER BY h.created_date ${sortOrder}
      LIMIT $1 OFFSET $2
      `,
        [limit, offset, `%${search}%`, active]
    );

    // Query untuk menghitung total baris
    const countResult = await client.query(
        `
      SELECT COUNT(*) AS total
      FROM mst_series
      WHERE (series_name ILIKE $1 OR series_code ILIKE $1) AND is_active = $2
      `,
        [`%${search}%`, active]
    );

    await client.query(TRANS.COMMIT);

    const totalRows = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(totalRows / limit);

    if (page > totalPages) throw Error("Data tidak ditemukan");

    return {
      data: result.rows,
      paging: {
        current_page: page,
        total_page: totalPages,
        size: limit,
      },
    };
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
    const [q, v] = deleteQuery("mst_series", { id });
    const result = await client.query(q, v);
    if (result.rowCount === 0) throw new Error(`ID ${id} not exist`);
    await client.query(TRANS.COMMIT);
    console.log(result);
    return id;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const updateSeries = async (payload: SeriesRequest, id: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [q, v] = updateQuery("mst_series", payload, { id }, "series_name");
    const result = await client.query(q, v);
    if (result.rowCount === 0) throw new Error(`ID ${id} not exist`);
    await client.query(TRANS.COMMIT);
    return result.rows[0].series_name;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const getSeriesListQuestion = async (id: string) => {
  const client = await db.connect();

  try {
    await client.query(TRANS.BEGIN);

    // Query utama untuk mendapatkan semua data berdasarkan series_id
    const result = await client.query(
        `
      SELECT 
        d.id AS detail_id,
        d.question_id,
        q.*,
        c.category_code,
        a.fullname AS added_by,
        d.added_at
      FROM mst_series_det d
      LEFT JOIN mst_question_answer q ON d.question_id = q.id
      LEFT JOIN mst_category c ON q.category_id = c.id
      LEFT JOIN mst_admin_web a ON d.added_by = a.id
      WHERE d.series_id = $1
      `,
        [id]
    );

    await client.query(TRANS.COMMIT);
    return { data: result.rows };
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

// export const getSeriesListQuestion = async (id: string, page: number, search: string, date: string) => {
//   const client = await db.connect();
//   const limit = 10; // Jumlah data per halaman
//   const offset = (page - 1) * limit; // Menghitung offset berdasarkan nomor halaman
//   const sortOrder = date === 'ASC' ? 'ASC' : 'DESC';
//
//   try {
//     await client.query(TRANS.BEGIN);
//
//     // Query utama untuk mendapatkan data dengan pagination dan search
//     const result = await client.query(
//         `
//       SELECT
//         d.id AS detail_id,
//         d.question_id,
//         q.question_code,
//         c.category_code,
//         a.fullname AS added_by,
//         d.added_at
//       FROM mst_series_det d
//       LEFT JOIN mst_question_answer q ON d.question_id = q.id
//       LEFT JOIN mst_category c ON q.category_id = c.id
//       LEFT JOIN mst_admin_web a ON d.added_by = a.id
//       WHERE
//         d.series_id = $1
//         AND (
//           q.question_code ILIKE $4 OR
//           c.category_code ILIKE $4
//         )
//       ORDER BY d.added_at ${sortOrder}
//       LIMIT $2 OFFSET $3
//       `,
//         [id, limit, offset, `%${search}%`]
//     );
//
//     // Query untuk menghitung total baris yang cocok
//     const countResult = await client.query(
//         `
//       SELECT
//         COUNT(*) AS total
//       FROM mst_series_det d
//       LEFT JOIN mst_question_answer q ON d.question_id = q.id
//       LEFT JOIN mst_category c ON q.category_id = c.id
//       WHERE
//         d.series_id = $1
//         AND (
//           q.question_code ILIKE $2 OR
//           c.category_code ILIKE $2
//         )
//       `,
//         [id, `%${search}%`]
//     );
//
//     await client.query(TRANS.COMMIT);
//
//     const totalRows = parseInt(countResult.rows[0].total, 10);
//     const totalPages = Math.ceil(totalRows / limit);
//
//     return {
//       data: result.rows,
//       paging: {
//         current_page: page,
//         total_page: totalPages,
//         size: limit,
//       },
//     };
//   } catch (error) {
//     console.error(error);
//     await client.query(TRANS.ROLLBACK);
//     throw error;
//   } finally {
//     client.release();
//   }
// };


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
      c.category_name,
      a_created.fullname AScreated_by,
      s.created_date,
      a_updated.fullname AS updated_by,
      s.updated_date
    FROM 
        mst_series s
    LEFT JOIN 
        mst_category c ON s.category_id = c.id
    LEFT JOIN
        mst_admin_web a_created ON s.created_by = a_created.id
    LEFT JOIN
        mst_admin_web a_updated ON s.updated_by = a_updated.id    
    WHERE 
        s.id = $1
    `, [id]
    );
    await client.query(TRANS.COMMIT);
    // const seriesDetail = {
    //   id: result.rows[0].series_id,
    //   series_name: result.rows[0].series_name,
    //   series_code: result.rows[0].series_code,
    //   is_active: result.rows[0].is_active,
    //   category_name: result.rows[0].category_name,
    //   created_by: result.rows[0].created_by,
    //   created_at: result.rows[0].created_date,
    //   updated_by: result.rows[0].updated_by,
    //   updated_date: result.rows[0].updated_date,
    //   questions: result.rows.map(row => ({
    //     id: row.detail_id,
    //     question_id: row.question_id,
    //     question_name: row.question_name,
    //     question_code: row.question_code,
    //     added_by: row.added_by,
    //     added_at: row.added_at
    //   }))
    // };
    return result.rows;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
}

export const addQuestionToSeries = async (id: string, updatePayload: any, questionPayload: SeriesRequests[]) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [headerQ, headerV] = updateQuery("mst_series", updatePayload, {id: id});
    const headerResult = await client.query(headerQ, headerV);
    const [detailQ, detailV] = insertQuery("mst_series_det", questionPayload, "question_id");
    const detailResult = await client.query(detailQ, detailV);
    await client.query(TRANS.COMMIT);
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
}

export const deleteQuestionFromSeries = async (detailId: string, seriesId: string, updatePayload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [headerQ, headerV] = updateQuery("mst_series", updatePayload, {id: seriesId});
    const headerResult = await client.query(headerQ, headerV);

    const result = await client.query(
        `
        DELETE FROM mst_series_det WHERE id = $1 AND series_id = $2
        `,
        [detailId, seriesId]
    );

    if (result.rowCount === 0) {
      throw new Error(`ID ${detailId} not exist`);
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