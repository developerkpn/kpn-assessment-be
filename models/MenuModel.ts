import { db } from "@/config/connection.js";
import { TRANSACTION as TRANS } from "@/config/transaction.js";

export const getAdminMenu = async (roleId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
        SELECT * FROM mst_menu_access ac
        LEFT JOIN mst_menu pg ON ac.menu_id = pg.id
        WHERE ac.role_id = $1
        AND (ac.fcreate = true OR ac.fread = true OR ac.fupdate = true OR ac.fdelete = true)
        ORDER BY pg.position
    `,
      [roleId]
    );

    return result.rows;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const getAllMenu = async () => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
        SELECT * FROM mst_menu;
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
