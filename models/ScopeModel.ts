import { ClientAction } from "@/helper/queryBuilder.js";

const ScopeModel = {
  GetScope: async () => {
    return await ClientAction(async (client) => {
      try {
        const { rows } = await client.query(`select scope_id, scope_desc from mst_scope where is_active = true`);
        return rows;
      } catch (error) {
        throw error;
      }
    });
  },
  GetScopeByUserId: async (user_id: string, role_name: string) => {
    return await ClientAction(async (client) => {
      let where = "";
      let whereval: any[] = [];
      if (role_name !== "Super Admin") {
        where = "where maws.user_id = $1";
        whereval = [user_id];
      }
      try {
        const { rows } = await client.query(
          `
          select
            distinct ms.scope_id,
            scope_desc
          from
            mst_scope ms
          left join mst_admin_web_scope maws on
            ms.scope_id = maws.scope_id ${where}
          `,
          whereval
        );

        return rows;
      } catch (error) {
        throw error;
      }
    });
  },
};

export default ScopeModel;
