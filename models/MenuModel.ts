import { db } from "#dep/config/connection";
import { TRANSACTION as TRANS } from "#dep/config/transaction";

export const getAdminMenu = async (roleId: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
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

export const getAllMenu = async () => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const result = await client.query(
      `
        SELECT * FROM mst_menu;
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
