import { db } from "@/config/connection.js";
import { TRANSACTION as TRANS } from "@/config/transaction.js";
import { deleteQuery, insertQuery, updateQuery } from "@/helper/queryBuilder.js";
import { CategoryRequest, CategoryUpdateRequest } from "@/types/MasterDataTypes.js";

export const createCategory = async (payload: CategoryRequest) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [q, v] = insertQuery("mst_category", payload, "category_code");
    const result = await client.query(q, v);
    await client.query(TRANS.COMMIT);
    return result.rows[0].category_code;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const getCategory = async () => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
            SELECT h.id, h.category_name, h.category_code, h.criteria_id, v.value_name, v.value_code, h.created_at, h.is_active, d.fullname AS created_by 
            FROM mst_category h
            LEFT JOIN mst_admin_web d ON h.created_by = d.id
            LEFT JOIN mst_value v ON h.criteria_id = v.id 
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

export const updateCategory = async (payload: CategoryUpdateRequest, id: number) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [q, v] = updateQuery("mst_category", payload, { id }, "category_code");
    const result = await client.query(q, v);
    if (result.rowCount === 0) throw new Error(`ID ${id} not exist`);
    await client.query(TRANS.COMMIT);
    return result.rows[0].category_code;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const deleteCategory = async (id: number) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [q, v] = deleteQuery("mst_category", { id });
    const result = await client.query(q, v);
    console.log(result);
    if (result.rowCount === 0) throw new Error(`ID ${id} not exist`);
    await client.query(TRANS.COMMIT);
    return id;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};
