import { db } from "#dep/config/connection";
import { TRANSACTION as TRANS } from "#dep/config/transaction";
import { deleteQuery, insertQuery, updateQuery } from "#dep/helper/queryBuilder";
import { ResponseError } from "#dep/error/response-error";

export const createEmailTemplate = async (payload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [Q, V] = insertQuery("mst_email_template", payload, "subject");
    const result = await client.query(Q, V);
    await client.query(TRANS.COMMIT);
    return result.rows[0].subject;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const updateEmailTemplate = async (tempalateId: string, payload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [Q, V] = updateQuery("mst_email_template", payload, { id: tempalateId }, "subject");
    const result = await client.query(Q, V);
    await client.query(TRANS.COMMIT);
    return result.rows[0].subject;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const getEmailTemplate = async () => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
            SELECT 
             e.id,
             e.subject,
             e.title,
             e.header,
             e.footer,
             e.body,
             a.fullname AS created_by,
             e.created_at
            FROM mst_email_template e
            LEFT JOIN mst_admin_web a ON e.created_by = a.id
            ORDER BY created_at DESC;
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

export const deleteEmailTemplate = async (id: string) => {
  const client = await db.connect();
  try {
    console.log(id);
    await client.query(TRANS.BEGIN);
    await client.query(
      `
        DELETE FROM mst_email_template
        WHERE id = $1
        `,
      [id]
    );
    await client.query(TRANS.COMMIT);
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const getEmailTemplateDetail = async (emailTemplateId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
            SELECT subject, title, header, body, footer FROM mst_email_template WHERE id = $1;
            `,
      [emailTemplateId]
    );
    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const getUserRole = async () => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
        SELECT id, role_name
        FROM mst_role
        `
    );
    return result.rows;
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    client.release();
  }
};
