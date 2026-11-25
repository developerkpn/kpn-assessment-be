import { db } from "@/config/connection.js";
import { TRANSACTION as TRANS } from "@/config/transaction.js";
import { PoolClient } from "pg";

let acMenuEnsured = false;

const ensureACMenuRegistered = async (client: PoolClient) => {
  if (acMenuEnsured) return;
  try {
    await client.query(`
      SELECT setval(
        'mst_page_id_seq',
        GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.mst_menu), (SELECT last_value FROM mst_page_id_seq))
      );

      INSERT INTO public.mst_menu (id, name, path, icon, is_active, position, subheader)
      SELECT
        nextval('mst_page_id_seq'),
        'Assessment Center',
        '/admin/report-ac',
        'FactCheck',
        true,
        COALESCE((SELECT MAX(position) FROM public.mst_menu WHERE subheader = 'Report'::public.subheader_type), 20) + 1,
        'Report'::public.subheader_type
      WHERE NOT EXISTS (
        SELECT 1 FROM public.mst_menu WHERE path = '/admin/report-ac'
      );

      UPDATE public.mst_menu
      SET icon = 'FactCheck'
      WHERE path = '/admin/report-ac' AND icon IS DISTINCT FROM 'FactCheck';

      INSERT INTO public.mst_menu_access (role_id, fcreate, fread, fupdate, fdelete, menu_id)
      SELECT r.id, true, true, true, true, m.id
      FROM public.mst_role r
      CROSS JOIN public.mst_menu m
      WHERE m.path = '/admin/report-ac'
        AND (
          r.role_name = 'Super Admin'
          OR EXISTS (
            SELECT 1 FROM public.mst_menu_access ma
            WHERE ma.role_id = r.id AND ma.menu_id = 17 AND ma.fread = true
          )
        )
        AND NOT EXISTS (
          SELECT 1 FROM public.mst_menu_access ma
          WHERE ma.menu_id = m.id AND ma.role_id = r.id
        );
    `);
    acMenuEnsured = true;
  } catch (err) {
    console.error("ensureACMenuRegistered warning:", err);
  }
};

export const getAdminMenu = async (roleId: string) => {
  const client = await db.connect();
  try {
    await ensureACMenuRegistered(client);
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
    await ensureACMenuRegistered(client);
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
