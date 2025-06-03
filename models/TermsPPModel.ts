import { db } from "@/config/connection.js";
import { TRANSACTION as TRANS } from "@/config/transaction.js";
import { updateQuery } from "@/helper/queryBuilder.js";
import { BriefRequest, TermsPPRequest } from "@/types/MasterDataTypes.js";

export const getTermsPP = async () => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
    SELECT * FROM mst_term_pp
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

export const updateTermsPP = async (payload: TermsPPRequest, id: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [q, v] = updateQuery("mst_term_pp", payload, { id }, "id");
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
export const getShortBrief = async () => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
    SELECT * FROM mst_short_brief
    `
    );
    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const updateShortBrief = async (payload: BriefRequest, id: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [q, v] = updateQuery("mst_short_brief", payload, { id }, "id");
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
