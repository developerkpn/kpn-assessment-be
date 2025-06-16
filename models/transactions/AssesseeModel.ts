import { db } from "@/config/connection.js";
import { TRANSACTION, TRANSACTION as TRANS } from "@/config/transaction.js";
import { ClientAction, deleteQuery, insertQuery, updateQuery } from "@/helper/queryBuilder.js";
import { ResponseError } from "@/error/response-error.js";
import jwt, { Secret } from "jsonwebtoken";
const { sign, verify } = jwt;
import { accessExpiry, refreshExpiry } from "@/constant.js";
import { validatePassword } from "@/helper/auth/password.js";
import { getDarwinUser } from "../BatchModel";

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
        select
           p.assessee_email,
           h.id as batch_id,
           h.batch_name,
           h.batch_code,
           h.start_period,
           h.end_period,
           d.token
        FROM t_batch_assessee p
        LEFT JOIN t_progress_batch_head d ON p.assessee_nik = d.assessee_id
        LEFT JOIN t_batch_head h ON d.batch_id = h.id
        WHERE p.assessee_email = $1
        group by p.assessee_email, h.id, h.batch_code, d.assessee_id, d.token;
        `,
      [email]
    );
    console.log("hello");
    console.log(result.rows);
    return result.rows;
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
