import { ClientAction, insertQuery } from "@/helper/queryBuilder.js";
import { PostgresError } from "pg-error-enum";

const MutexModel = {
  LockTransaction: async (id: string) => {
    return await ClientAction(async (client) => {
      try {
        const { rowCount } = await client.query(
          `select transaction_id from mutex_transaction where transaction_id = $1`,
          [id]
        );
        if (rowCount && rowCount > 0) {
          return false;
        }
        const [query, value] = insertQuery("mutex_transaction", { transaction_id: id });
        await client.query(query, value);
        return true;
      } catch (error) {
        if (PostgresError.UNIQUE_VIOLATION) {
          return false;
        }
        throw error;
      }
    });
  },

  UnlockTransaction: async (id: string) => {
    return await ClientAction(async (client) => {
      try {
        const { rowCount } = await client.query(
          `select transaction_id from mutex_transaction where transaction_id = $1`,
          [id]
        );
        if (!rowCount) {
          throw new Error("No locked transaction");
        }
        await client.query(`delete from mutex_transaction where transaction_id = $1`, [id]);
        return true;
      } catch (error) {
        throw error;
      }
    });
  },
};

export default MutexModel;
