import { TRANSACTION } from "@/config/transaction.js";
import { ClientAction, insertQuery } from "@/helper/queryBuilder.js";
import moment from "moment";
import { PostgresError } from "pg-error-enum";

const MutexModel = {
  LockTransaction: async (id: string) => {
    return await ClientAction(async (client) => {
      try {
        await client.query(TRANSACTION.BEGIN);
        const now = moment();
        const { rows, rowCount } = await client.query(
          `select transaction_id, expires_at from mutex_transaction where transaction_id = $1 `,
          [id]
        );
        if (rowCount && rowCount > 0) {
          const expires_at = moment(rows[0].expires_at);
          if (now > expires_at) {
            await client.query(`delete from mutex_transaction where transaction_id = $1`, [id]);
          } else {
            return false;
          }
        }
        const [query, value] = insertQuery("mutex_transaction", {
          transaction_id: id,
          expires_at: now.add(30, "seconds").format("YYYY-MM-DDTHH:mm:ss"),
        });
        await client.query(query, value);
        await client.query(TRANSACTION.COMMIT);
        return true;
      } catch (error) {
        await client.query(TRANSACTION.ROLLBACK);
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
          return false;
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
