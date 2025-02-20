import { db } from "#dep/config/connection";
import { TRANSACTION as TRANS } from "#dep/config/transaction";
import { deleteQuery, insertQuery, updateQuery } from "#dep/helper/queryBuilder";
import {ResponseError} from "#dep/error/response-error";

export const createEmailTemplate = async (payload: any) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const [Q, V] = insertQuery("mst_email_template", payload, "subject")
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
}

export const updateEmailTemplate = async (tempalateId: string, payload: any) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const [Q, V] = updateQuery("mst_email_template", payload, {id: tempalateId}, "subject")
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
}

export const getEmailTemplate = async () => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const result = await client.query(
            `
            SELECT * FROM mst_email_template ORDER BY created_at DESC;
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
}

export const deleteEmailTemplate = async (id: string) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        deleteQuery("mst_email_template", id);
        await client.query(TRANS.COMMIT);
    } catch (error) {
        console.error(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release();
    }
}

export const getEmailTemplateDetail = async (emailTemplateId: string) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        console.log("test")
        const  result = await client.query(
            `
            SELECT subject, title, header, footer FROM mst_email_template WHERE id = $1;
            `, [emailTemplateId]
        )
        console.log("test 2")
        console.log(result)
        await client.query(TRANS.COMMIT);
        console.log(result.rows[0])
        console.log("test 3")
        console.log("test 3")
        console.log("test 3")
        return result.rows[0];

    } catch (error) {
        console.error(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release();
    }
}