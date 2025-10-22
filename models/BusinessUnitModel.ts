import { db } from "@/config/connection.js";
import { TRANSACTION as TRANS } from "@/config/transaction.js";
import { ClientAction, deleteQuery, insertQuery, updateQuery } from "@/helper/queryBuilder.js";
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

export const getBusinessUnitByUserId = async (user_id: string, role_name: string) => {
  return await ClientAction(async (client) => {
    let where = "";
    let whereval: any[] = [];
    if (role_name !== "Super Admin") {
      (where = `where mawb.user_id = $1`), (whereval = [user_id]);
    }
    try {
      const { rows } = await client.query(
        `
        select
          distinct mbu.id,
          mbu.bu_name
        from
          mst_business_unit mbu
        left join mst_admin_web_bu mawb on
          mbu.bu_code = mawb.bu_code ${where}
        `,
        whereval
      );

      return rows;
    } catch (error) {
      throw error;
    }
  });
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
