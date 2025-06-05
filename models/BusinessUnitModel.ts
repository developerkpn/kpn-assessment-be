import { db } from "@/config/connection.js";
import { TRANSACTION as TRANS } from "@/config/transaction.js";
import { deleteQuery, insertQuery, updateQuery } from "@/helper/queryBuilder.js";
import { BURequest } from "@/types/MasterDataTypes.js";

export const createBusinessUnit = async (payload: BURequest) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [q, v] = insertQuery("mst_business_unit", payload, "bu_code");
    const result = await client.query(q, v);
    await client.query(TRANS.COMMIT);
    return result.rows[0].bu_code;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const getBusinessUnit = async () => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
    SELECT * FROM mst_business_unit
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

export const updateBusinessUnit = async (payload: BURequest, id: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [q, v] = updateQuery("mst_business_unit", payload, { id }, "bu_code");
    const result = await client.query(q, v);
    if (result.rowCount === 0) throw new Error(`ID ${id} not exist`);
    await client.query(TRANS.COMMIT);
    return result.rows[0].bu_code;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const deleteBusinessUnit = async (id: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [q, v] = deleteQuery("mst_business_unit", { id });
    const result = await client.query(q, v);
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

export const getBusinessUnitDetail = async (id: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
        SELECT * FROM mst_business_unit WHERE id = $1
        `,
      [id]
    );
    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};
