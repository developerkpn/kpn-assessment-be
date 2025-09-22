import { db } from "@/config/connection.js";
import { TRANSACTION as TRANS } from "@/config/transaction.js";
import { accessExpiry, refreshExpiry } from "@/constant.js";
import { createOTP } from "@/helper/auth/OTP.js";
import { hashPassword, validatePassword } from "@/helper/auth/password.js";
import { deleteQuery, insertQuery, updateQuery } from "@/helper/queryBuilder.js";
import { Emailer } from "@/services/mail/Emailer.js";
import { User } from "@/types/AdminTypes.js";
import { v4 } from "uuid";
import jwt, { Secret } from "jsonwebtoken";
import { emailTemplate, generateTable } from "@/services/mail/emailTemplate.js";
const { sign, verify } = jwt;

export const loginAdmin = async (emailOrUname: string, password: string) => {
  const client = await db.connect();

  try {
    await client.query(TRANS.BEGIN);
    const checkUserData = await client.query(
      `
      SELECT maw.*, mr.role_name FROM mst_admin_web maw 
      left join mst_role mr on mr.id = maw.role_id
      WHERE username = $1 OR email = $1`,
      [emailOrUname]
    );
    if (checkUserData.rows.length === 0) {
      throw new Error("User Not Found");
    }

    const data = checkUserData.rows[0];

    const permission = await client.query(
      `
        SELECT menu_id, fcreate, fread, fupdate, fdelete
        FROM mst_menu_access
        WHERE role_id = $1
      `,
      [data.role_id]
    );

    data.permission = permission.rows;

    const accessToken = sign(
      {
        user_id: data.id,
        role_id: data.role_id,
        role_name: data.role_name,
        bu_id: data.bu_id,
        permission: permission.rows,
      },
      process.env.SECRETJWT as Secret,
      { expiresIn: accessExpiry }
    );

    const refreshToken = sign(
      {
        user_id: data.id,
        role_id: data.role_id,
        role_name: data.role_name,
        bu_id: data.bu_id,
        permission: permission.rows,
      },
      process.env.SECRETJWT as Secret,
      { expiresIn: refreshExpiry }
    );

    const [insertToken, valueToken] = updateQuery("mst_admin_web", { refresh_token: refreshToken }, { id: data.id });
    await client.query(insertToken, valueToken);

    await client.query(TRANS.COMMIT);
    console.log(data);
    if (data) {
      const valid = await validatePassword(password, data.password);
      if (!valid) {
        throw new Error("Invalid Password");
      } else {
        return { data, accessToken };
      }
    } else {
      throw new Error("User Not Found");
    }
  } catch (error) {
    await client.query(TRANS.ROLLBACK);
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const verifyPermission = async (roleId: any, menuId: number | number[]) => {
  const client = await db.connect();

  try {
    await client.query(TRANS.BEGIN);
    let menu = menuId.toString();
    if (Array.isArray(menuId)) {
      menu = `${menuId.join(",")}`;
    }
    const checkPermission = await client.query(
      `
        SELECT menu_id, fcreate, fread, fupdate, fdelete, mr.role_name
        FROM mst_menu_access mma
        left join mst_role mr on mr.id = mma.role_id
        WHERE mma.role_id = $1 AND menu_id in (${menu})
      `,
      [roleId]
    );

    const permission = checkPermission.rows;
    await client.query(TRANS.COMMIT);
    return permission;
  } catch (error) {
    await client.query(TRANS.ROLLBACK);
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const getNewToken = async (data: User) => {
  const client = await db.connect();

  try {
    await client.query(TRANS.BEGIN);
    const result = await client.query(
      `
      SELECT refresh_token FROM mst_admin_web WHERE id = $1
      `,
      [data.user_id]
    );
    const refreshToken = result.rows[0].refresh_token;

    verify(refreshToken, process.env.SECRETJWT as Secret);
    // If error, error.name === "TokenExpiredError"

    const permission = await client.query(
      `
        SELECT menu_id, fcreate, fread, fupdate, fdelete
        FROM mst_menu_access
        WHERE role_id = $1
      `,
      [data.role_id]
    );

    const newToken = sign(
      {
        user_id: data.user_id,
        role_id: data.role_id,
        bu_id: data.bu_id,
        role_name: data.role_name,
        permission: permission.rows,
      },
      process.env.SECRETJWT as Secret,
      { expiresIn: accessExpiry }
    );

    await client.query(TRANS.COMMIT);
    return newToken;
  } catch (error) {
    await client.query(TRANS.ROLLBACK);
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const getAllAdmin = async () => {
  const client = await db.connect();

  try {
    await client.query(TRANS.BEGIN);

    const { rows } = await client.query(
      `
      SELECT a.id, a.username, a.fullname, a.email, a.is_active, r.role_name
      FROM mst_admin_web a
      LEFT JOIN mst_role r ON a.role_id = r.id
      `
    );

    await client.query(TRANS.COMMIT);
    return rows;
  } catch (error) {
    await client.query(TRANS.ROLLBACK);
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const getAdminById = async (id: string) => {
  const client = await db.connect();

  try {
    await client.query(TRANS.BEGIN);

    const { rows } = await client.query(
      `
      select
        a.id,
        a.username,
        a.fullname,
        a.email,
        a.is_active,
        a.role_id,
        r.role_name,
        a.created_date,
        a.from_darwin,
        a.nik,
        mbu.bu_id,
        ms.scope
      from
        mst_admin_web a
      left join mst_role r on
        a.role_id = r.id
      left join (select
        user_id,
        JSON_AGG(JSON_BUILD_OBJECT('value',
        awbu.bu_code ,
        'label',
        mbu.bu_name)) as bu_id
      from
        mst_admin_web_bu awbu
      left join mst_business_unit mbu on
        awbu.bu_code = mbu.bu_code
      group by user_id) mbu on mbu.user_id = a.id 
      left join (select
        user_id,
        JSON_AGG(JSON_BUILD_OBJECT('value',
        awsc.scope_id ,
        'label',
        ms.scope_desc)) as scope
      from
        mst_admin_web_scope awsc
      left join mst_scope ms on
        awsc.scope_id  = ms.scope_id
      group by user_id) ms on ms.user_id = a.id
      WHERE a.id = $1
      `,
      [id]
    );

    await client.query(TRANS.COMMIT);
    return rows[0];
  } catch (error) {
    await client.query(TRANS.ROLLBACK);
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const createAdmin = async ({
  account_main,
  bu_id_account,
  scope_account,
}: {
  account_main: any;
  bu_id_account: any;
  scope_account: any;
}) => {
  const client = await db.connect();

  try {
    await client.query(TRANS.BEGIN);
    let payload = account_main;

    const checkUserExist = await client.query("SELECT * FROM mst_admin_web WHERE username = $1 OR email = $2", [
      payload.username,
      payload.email,
    ]);
    if (checkUserExist.rows.length > 0) {
      throw new Error("User already exist");
    }
    const [q, v] = insertQuery("mst_admin_web", payload, "id, role_id");
    const { rows } = await client.query(q, v);
    //bu_id_account insersion
    let payload_buid = bu_id_account.map((value: any) => ({
      user_id: account_main.id,
      bu_code: value,
      create_by: payload.created_by,
    }));
    const [q_buid, v_buid] = insertQuery("mst_admin_web_bu", payload_buid);
    await client.query(q_buid, v_buid);

    //scope insersion
    let payload_scope = scope_account.map((value: any) => ({
      user_id: account_main.id,
      scope_id: value,
      create_by: payload.created_by,
    }));
    const [q_scope, v_scope] = insertQuery("mst_admin_web_scope", payload_scope);
    await client.query(q_scope, v_scope);

    const { rows: role } = await client.query(
      `
      SELECT role_name FROM mst_role WHERE id = $1
      `,
      [rows[0].role_id]
    );

    await client.query(TRANS.COMMIT);
    return { id: rows[0].id, role: role[0].role_name };
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const getRole = async () => {
  const client = await db.connect();

  try {
    await client.query(TRANS.BEGIN);
    const { rows } = await client.query(
      `
      SELECT id, role_name FROM mst_role;
      `
    );

    await client.query(TRANS.COMMIT);
    return rows;
  } catch (error) {
    await client.query(TRANS.ROLLBACK);
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const reqResetPassword = async (email: string) => {
  const client = await db.connect();

  try {
    await client.query(TRANS.BEGIN);
    const checkRegis = await client.query("SELECT * FROM mst_admin_web where email = $1", [email]);
    if (checkRegis.rows.length === 0) {
      throw new Error("User not registered yet");
    }
    const [otpCode, encodedOTP, validUntil] = createOTP();
    const payload = {
      email: email,
      otp_code: encodedOTP,
      valid_until: validUntil,
    };
    const [cleanQuery, cleanValue] = deleteQuery("otp_trans", { email: email });
    await client.query(cleanQuery, cleanValue);
    const [insertOtpQuery, insertOtpValue] = insertQuery("otp_trans", payload);
    await client.query(insertOtpQuery, insertOtpValue);

    const Email = new Emailer();
    const sendOtp = await Email.otpResetPass(otpCode, email);
    console.log(sendOtp);

    await client.query(TRANS.COMMIT);
  } catch (error) {
    await client.query(TRANS.ROLLBACK);
    console.log(error);
    throw error;
  } finally {
    client.release();
  }
};

export const resetPassword = async (newPass: string, email: string) => {
  const client = await db.connect();

  try {
    await client.query(TRANS.BEGIN);
    const checkUser = await client.query("SELECT * FROM mst_admin_web WHERE email = $1", [email]);
    if (checkUser.rows.length == 0) {
      throw new Error("User not found");
    }
    const hashedNewPass = await hashPassword(newPass);
    const payload = {
      password: hashedNewPass,
    };
    const [updatePassQuery, updatePassValue] = updateQuery("mst_admin_web", payload, { email: email }, "username");
    await client.query(updatePassQuery, updatePassValue);

    const [cleanQuery, cleanValue] = deleteQuery("otp_trans", { email: email });
    await client.query(cleanQuery, cleanValue);

    await client.query(TRANS.COMMIT);
  } catch (error) {
    await client.query(TRANS.ROLLBACK);
    console.log(error);
    throw error;
  } finally {
    client.release();
  }
};

export const getPermission = async (id: string | null = null) => {
  const client = await db.connect();
  try {
    const { rows } = await client.query(
      `
          SELECT rl.*, ad.fullname AS created_by, ac.menu_id, ac.fcreate, ac.fread, ac.fupdate, ac.fdelete, pg.name AS menu_name 
      FROM mst_role rl
      LEFT JOIN mst_menu_access ac ON rl.id = ac.role_id
      LEFT JOIN mst_menu pg ON ac.menu_id = pg.id
      LEFT JOIN mst_admin_web ad ON rl.created_by = ad.id
      WHERE (rl.id = $1 OR $1 IS NULL)
      `,
      [id]
    );

    return rows;
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};

export const getPermission2 = async (id: string | null = null) => {
  const client = await db.connect();

  try {
    await client.query(TRANS.BEGIN);
    const { rows } = await client.query(
      `
     select
      coalesce(mma.role_id, $1) as role_id,
      ad.fullname as created_by,
      rl.created_date,
      rl.updated_date,
      rl.role_name,
      coalesce(mma.fcreate, false) as fcreate ,
      coalesce(mma.fread, false) as fread ,
      coalesce(mma.fupdate, false) as fupdate,
      coalesce(mma.fdelete, false) as fdelete ,
      mm.subheader ,
       mm.name as menu_name,
      mm.id as menu_id
    from
      mst_menu mm
    left join mst_menu_access mma on
      mm.id = mma.menu_id
    left join mst_role rl on rl.id = mma.role_id
    LEFT JOIN mst_admin_web ad ON rl.created_by = ad.id
    where
      mma.role_id = $1
      or mma.role_id is null
    order by mm.id asc
      `,
      [id]
    );

    await client.query(TRANS.COMMIT);
    return rows;
  } catch (error) {
    await client.query(TRANS.ROLLBACK);
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const createRole = async (payload: any, accessPayload: any) => {
  const client = await db.connect();

  try {
    await client.query(TRANS.BEGIN);

    const [q, v] = insertQuery("mst_role", payload, "id");
    const { rows } = await client.query(q, v);

    const [accessQ, accessV] = insertQuery("mst_menu_access", accessPayload);
    await client.query(accessQ, accessV);

    await client.query(TRANS.COMMIT);
    return rows[0].id;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const updateRole = async (id: string, payload: any, permPayload: any) => {
  const client = await db.connect();

  try {
    await client.query(TRANS.BEGIN);

    const [queryInsertRole, valueInsertRole] = updateQuery("mst_role", payload, { id }, "id");
    const { rows } = await client.query(queryInsertRole, valueInsertRole);

    const [queryDeleteAccess, valueDeleteAccess] = deleteQuery("mst_menu_access", { role_id: id });
    await client.query(queryDeleteAccess, valueDeleteAccess);

    const [queryInsertAccess, valueInsertAccess] = insertQuery("mst_menu_access", permPayload);
    await client.query(queryInsertAccess, valueInsertAccess);

    await client.query(TRANS.COMMIT);
    return rows[0].id;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const updateAdmin = async (id: string, payload: any, password: string | undefined | null) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [queryAdminUpdate, valueAdminUpdate] = updateQuery(
      "mst_admin_web",
      payload.user_account,
      { id: id },
      "username, email"
    );
    const { rows: result_up } = await client.query(queryAdminUpdate, valueAdminUpdate);

    //clean up bu_id if exist and insert new
    if (payload.bu_id_account) {
      await client.query(`delete from mst_admin_web_bu where user_id = $1`, [id]);
      let payload_bu = payload.bu_id_account.map((value: any) => ({
        user_id: id,
        bu_code: value,
        create_by: payload.user_account.update_by,
      }));
      const [q_buid, v_buid] = insertQuery("mst_admin_web_bu", payload_bu);
      await client.query(q_buid, v_buid);
    }

    if (payload.scope_account) {
      await client.query(`delete from mst_admin_web_scope where user_id = $1`, [id]);
      let payload_scope = payload.scope_account.map((value: any) => ({
        user_id: id,
        scope_id: value,
        create_by: payload.user_account.update_by,
      }));
      const [q_scope, v_scope] = insertQuery("mst_admin_web_scope", payload_scope);
      await client.query(q_scope, v_scope);
    }

    // email to user if there's payload password
    if (password) {
      const { rows: data_contact } = await client.query(
        "select email_dt from mst_email_contact where is_active = true"
      );
      const email_contact = data_contact[0].email_dt ?? "Assessmentcenter@kpn-corp.com";
      const Email = new Emailer();
      const Subject = Email.generateSubject("Reset Password User Admin");
      const html_email = emailTemplate(
        "Reset Password User",
        `
        <p>Hello, ${payload.fullname}</p>
        <p>Your account password to access KPN Online Assessment Platform as an Admin have reset</p>
        <p>Here's your credential:</p>
        ${generateTable([
          { label: "Username", value: result_up[0].username },
          { label: "Password", value: password },
        ])}
        <p>Please contact the Talent Management Corp Team if you have any questions</p>
        `,
        email_contact
      );
      await Email.sendEmail(result_up[0].email, Subject, html_email);
    }
    await client.query(TRANS.COMMIT);
  } catch (e) {
    await client.query(TRANS.ROLLBACK);
    throw e;
  } finally {
    client.release();
  }
};

export const deleteAdmin = async (id: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    await client.query(
      `
      DELETE FROM mst_admin_web WHERE id = $1
    `,
      [id]
    );
    await client.query(TRANS.COMMIT);
  } catch (e) {
    throw e;
  } finally {
    client.release();
  }
};
