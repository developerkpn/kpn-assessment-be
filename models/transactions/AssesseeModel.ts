import { db } from "@/config/connection.js";
import { TRANSACTION, TRANSACTION as TRANS } from "@/config/transaction.js";
import { ClientAction, deleteQuery, insertQuery, updateQuery } from "@/helper/queryBuilder.js";
import { ResponseError } from "@/error/response-error.js";
import jwt, { Secret } from "jsonwebtoken";
const { sign, verify } = jwt;
import { accessExpiry, refreshExpiry } from "@/constant.js";
import { validatePassword } from "@/helper/auth/password.js";
import { getDarwinUser } from "@/models/BatchModel.js";

export const checkRegisteredExternalAssessee = async (email: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
            SELECT email 
            FROM mst_user_extern
            WHERE email = $1
            `,
      [email]
    );
    console.log("halo 2");
    console.log(result.rows);
    console.log(result.rows[0]);
    return result.rows;
  } catch (e) {
    throw e;
  } finally {
    client.release();
  }
};

export const storeExternalAssesseeAccount = async (payload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [Q, V] = updateQuery("mst_user_extern", payload, { email: payload.email });
    const result = await client.query(Q, V);
    await client.query(TRANS.COMMIT);
    return result.rows[0];
  } catch (e) {
    await client.query(TRANS.ROLLBACK);
    throw e;
  } finally {
    client.release();
  }
};

export const loginExternalAssessee = async (email: string, password: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
        SELECT * 
        FROM mst_user_extern
        WHERE email = $1
        `,
      [email]
    );

    if (result.rows.length === 0) {
      throw new ResponseError(400, "Email's not registered");
    }

    const data = result.rows[0];

    const accessToken = sign(
      {
        user_id: result.rows[0].id,
        email: result.rows[0].email,
        type: "external",
      },
      process.env.SECRETJWT as Secret,
      { expiresIn: refreshExpiry }
    );

    const refreshToken = sign(
      {
        user_id: result.rows[0].id,
        email: result.rows[0].email,
      },
      process.env.SECRETJWT as Secret,
      { expiresIn: refreshExpiry }
    );

    const [insertToken, valueToken] = updateQuery("mst_user_extern", { refresh_token: refreshToken }, { id: data.id });
    await client.query(insertToken, valueToken);
    await client.query(TRANS.COMMIT);
    console.log(data);
    if (data) {
      const valid = await validatePassword(password, data.password);
      if (!valid) {
        throw new ResponseError(400, "Invalid email or password");
      } else {
        return { data, accessToken };
      }
    } else {
      throw new ResponseError(400, "Invalid email or password");
    }
  } catch (e) {
    await client.query(TRANS.ROLLBACK);
    throw e;
  } finally {
    client.release();
  }
};

export const getAssesseeExternalProfile = async (id: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
        SELECT 
        id,
        name,
        email, 
        age, 
        TO_CHAR(date_of_birth, 'YYYY-MM-DD') as date_of_birth,
        gender, 
        phone, 
        education,
        institution
        FROM mst_user_extern
        WHERE id = $1 or email = $1
        `,
      [id]
    );
    return result?.rows[0] ?? null;
  } catch (e) {
    throw e;
  } finally {
    client.release();
  }
};

export const getAssesseeInternal = async (nik: string) => {
  try {
    const data = await getDarwinUser(nik);
    return data;
  } catch (error) {
    throw error;
  }
};
export const getAssesseeExternalbyEmail = async (email: string) => {
  return await ClientAction(async (client) => {
    try {
      const result = await client.query(
        `
          SELECT 
          name, 
          email, 
          password,
          age, 
          gender, 
          phone, 
          education
          FROM mst_user_extern
          WHERE email = $1
          `,
        [email]
      );

      return result?.rows[0].password
        ? { is_exist: true, data: result?.rows[0] }
        : { is_exist: false, data: result?.rows[0] };
    } catch (error) {
      throw error;
    }
  });
};

export const getExternalDashboard = async (email: string) => {
  const client = await db.connect();
  try {
    console.log(email);
    const result = await client.query(
      `
        SELECT
           p.assessee_email,
           p.assessee_nik,
           h.id as batch_id,
           h.batch_name,
           h.batch_code,
           h.start_period,
           h.end_period,
           d.token,
           COALESCE(
             (SELECT COUNT(*) FROM t_progress_batch_det bd 
              JOIN t_progress_batch_head bh ON bd.head_id = bh.id 
              WHERE bh.assessee_id = p.assessee_nik AND bh.batch_id = h.id AND bd.status = 'Not Taken'), 0
           ) as count_not_taken,
           COALESCE(
             (SELECT COUNT(*) FROM t_progress_batch_det bd 
              JOIN t_progress_batch_head bh ON bd.head_id = bh.id 
              WHERE bh.assessee_id = p.assessee_nik AND bh.batch_id = h.id AND bd.status = 'In Progress'), 0
           ) as count_in_progress,
           COALESCE(
             (SELECT COUNT(*) FROM t_progress_batch_det bd 
              JOIN t_progress_batch_head bh ON bd.head_id = bh.id 
              WHERE bh.assessee_id = p.assessee_nik AND bh.batch_id = h.id AND bd.status = 'Completed'), 0
           ) as count_completed,
           COALESCE(
             (SELECT COUNT(*) FROM t_progress_batch_det bd 
              JOIN t_progress_batch_head bh ON bd.head_id = bh.id 
              WHERE bh.assessee_id = p.assessee_nik AND bh.batch_id = h.id), 0
           ) as total_tests
        FROM t_batch_assessee p
        LEFT JOIN t_progress_batch_head d ON p.assessee_nik = d.assessee_id
        LEFT JOIN t_batch_head h ON d.batch_id = h.id
        WHERE p.assessee_email = $1
        GROUP BY p.assessee_email, p.assessee_nik, h.id, h.batch_name, h.batch_code, 
                 h.start_period, h.end_period, d.token;
        `,
      [email]
    );

    console.log("hello");
    console.log(result.rows);

    // Process batch status based on test progress (similar to getBatchDetail logic)
    const batchesWithStatus = result.rows.map((batch) => {
      let status = "Not Taken";

      // Converting string counts to numbers
      const notTaken = parseInt(batch.count_not_taken) || 0;
      const inProgress = parseInt(batch.count_in_progress) || 0;
      const completed = parseInt(batch.count_completed) || 0;
      const totalTests = parseInt(batch.total_tests) || 0;

      // If no tests are associated yet or all counts are 0, status is Not Taken
      if (totalTests === 0 || (notTaken === 0 && inProgress === 0 && completed === 0)) {
        status = "Not Taken";
      }
      // If all tests are completed and there's at least one completed test
      else if (completed === totalTests && completed > 0) {
        status = "Completed";
      }
      // If any test is in progress, status is In Progress
      else if (inProgress > 0) {
        status = "In Progress";
      }

      return {
        assessee_email: batch.assessee_email,
        batch_id: batch.batch_id,
        batch_name: batch.batch_name,
        batch_code: batch.batch_code,
        start_period: batch.start_period,
        end_period: batch.end_period,
        token: batch.token,
        progress: {
          status: status,
          completion_percentage: totalTests > 0 ? Math.round((completed / totalTests) * 100) : 0,
        },
      };
    });

    return batchesWithStatus;
  } catch (e) {
    throw e;
  } finally {
    client.release();
  }
};

export const updateExternalAssessee = async (id: string, payload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [Q, V] = updateQuery("mst_user_extern", payload, { id: id });
    await client.query(Q, V);
    await client.query(TRANS.COMMIT);
  } catch (e) {
    throw e;
  } finally {
    client.release();
  }
};

export const openGuideline = async (batch_id: string, user_id: string) => {
  return await ClientAction(async (client) => {
    try {
      await client.query(TRANS.BEGIN);
      //get if guideline opened;
      const { rows } = await client.query(
        `select guideline_open from t_progress_batch_head where batch_id = $1 and assessee_id = $2`,
        [batch_id, user_id]
      );
      if (rows[0].guideline_open) {
        return false;
      }
      const [upque, upval] = updateQuery(
        "t_progress_batch_head",
        { guideline_open: true },
        { batch_id, assessee_id: user_id }
      );
      await client.query(upque, upval);
      await client.query(TRANS.COMMIT);
      return true;
    } catch (error) {
      throw error;
    }
  });
};
