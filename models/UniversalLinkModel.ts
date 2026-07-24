import { db } from "@/config/connection.js";
import { TRANSACTION as TRANS } from "@/config/transaction.js";
import { insertQuery, updateQuery } from "@/helper/queryBuilder.js";

export const getUniversalLinks = async () => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
      SELECT id, link_name, slug, is_active, created_at, created_by, updated_at, updated_by
      FROM mst_universal_link
      ORDER BY created_at DESC
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

export const getUniversalLinkBySlug = async (slug: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
      SELECT id, link_name, slug, is_active
      FROM mst_universal_link
      WHERE slug = $1
      `,
      [slug]
    );
    return result.rows[0] ?? null;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const createUniversalLink = async (payload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [q, v] = insertQuery("mst_universal_link", payload, "id");
    const result = await client.query(q, v);
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

export const updateUniversalLink = async (id: string, payload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [q, v] = updateQuery("mst_universal_link", payload, { id });
    const result = await client.query(q, v);
    await client.query(TRANS.COMMIT);
    return result.rowCount;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const deleteUniversalLink = async (id: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    await client.query(`DELETE FROM mst_universal_link WHERE id = $1`, [id]);
    await client.query(TRANS.COMMIT);
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};
