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
};

export default ScopeModel;
