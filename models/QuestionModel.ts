import { db } from "#dep/config/connection";
import { TRANSACTION as TRANS } from "#dep/config/transaction";
import { deleteQuery, insertQuery, updateQuery } from "#dep/helper/queryBuilder";
import { BURequest, QuestionRequest } from "#dep/types/MasterDataTypes";

export const createQuestion = async (payload: QuestionRequest) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [q, v] = insertQuery("mst_question_answer", payload, "id");
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

export const updateQuestion = async (payload: QuestionRequest, id: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [q, v] = updateQuery("mst_question_answer", payload, { id: id }, "id");
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

export const getQuestion = async (categoryId?: number) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);

    let query = `
      SELECT
        q.*, a.fullname AS created_by, c.category_name
      FROM mst_question_answer q
      LEFT JOIN mst_admin_web a ON q.created_by = a.id
      LEFT JOIN mst_category c ON q.category_id = c.id
    `;

    const values: any[] = [];

    // Jika categoryId ada, tambahkan kondisi WHERE
    if (categoryId) {
      query += ` WHERE q.category_id = $1`;
      values.push(categoryId);
    }

    query += ` ORDER BY q.created_date DESC`;

    const result = await client.query(query, values);
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

export const getQuestionById = async (id: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const result = await client.query(
      `
      SELECT
        q.*, a.fullname AS created_by
      FROM mst_question_answer q
      JOIN mst_admin_web a ON q.created_by = a.id
      WHERE q.id = $1
    `,
      [id]
    );
    await client.query(TRANS.COMMIT);
    return result.rows[0];
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const deleteQuestion = async (id: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [q, v] = deleteQuery("mst_question_answer", { id });
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
