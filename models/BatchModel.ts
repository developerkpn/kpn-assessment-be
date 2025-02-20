import { db } from "#dep/config/connection";
import { TRANSACTION as TRANS } from "#dep/config/transaction";
import { deleteQuery, insertQuery, updateQuery } from "#dep/helper/queryBuilder";
import {ResponseError} from "#dep/error/response-error";
import {async} from "rxjs";

export const createBatch = async (headerPayload: any) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const [headerQ, headerV] = insertQuery("t_batch_head", headerPayload, "batch_code");
        const headerResult = await client.query(headerQ, headerV);
        await client.query(TRANS.COMMIT);
        return headerResult.rows[0].batch_code;
    } catch (error) {
        console.error(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release();
    }
}

export const getBatch = async () => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const result = await client.query(
            `
            SELECT
                h.id,
                h.batch_name,
                h.batch_code,
                g.grouptest_code,
                COUNT(d.id) AS total_assessee,
                h.start_period,
                h.end_period,
                b.bu_code,
                f.fm_code
            FROM
                t_batch_head h
            LEFT JOIN
                mst_grouptest_head g ON h.grouptest_id = g.id
            LEFT JOIN
                t_batch_assessee d ON h.id = d.batch_id
            LEFT JOIN
                mst_business_unit b ON h.bu_id = b.id
            LEFT JOIN
                mst_function_menu f ON h.function_id = f.id     
            GROUP BY 
                h.id, h.batch_name, h.batch_code, g.grouptest_code, 
                h.start_period, h.end_period, b.bu_code, f.fm_code
            ORDER BY 
                h.created_at DESC           
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

export const updateBatch = async (id: string, updatePayload: any) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const [headerQ, headerV] = updateQuery("t_batch_head", updatePayload, {id: id}, "batch_code");
        const result = await client.query(headerQ, headerV);
        if (result.rowCount === 0) throw new ResponseError(404, `Batch with ID ${id} is not found`)
        await client.query(TRANS.COMMIT);
        return result.rows[0].batch_code;
    } catch (error) {
        console.error(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release();
    }
}

export const deleteBatch = async (id: string) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const detailResult = await client.query(
            `
            DELETE FROM t_batch_assessee WHERE batch_id = $1
            `,
            [id]
        );

        const headerResult = await client.query(
            `
            DELETE FROM t_batch_head WHERE id = $1 RETURNING batch_code
            `,
            [id]
        );

        if (detailResult.rowCount === 0 && headerResult.rowCount === 0) {
            throw new ResponseError(404, `Batch with ID ${id} is not found.`);
        }

        await client.query(TRANS.COMMIT);
        console.log(headerResult);
        return headerResult.rows[0].batch_code;
    } catch (error) {
        console.log(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release();
    }
}

export const addAssessee = async (assesseePayload: any) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const [Q, V] = insertQuery("t_batch_assessee", assesseePayload);
        await client.query(Q, V);
        await client.query(TRANS.COMMIT);
    } catch (error) {
        console.log(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release();
    }
}

export const getBatchDetail = async (id: string) => {
    const client = await db.connect();
    try {
       await client.query(TRANS.BEGIN);
       const result = await client.query(
           `
           SELECT
                h.id,
                h.batch_name,
                h.batch_code,
                h.grouptest_id,
                h.bu_id,
                h.function_id,
                h.template_email_id,
                h.created_by,
                h.updated_by,
                h.created_at,
                h.updated_by,
                h.start_period,
                h.end_period,
                h.email_invitation,
                h.is_camera,
                h.is_mic,
                h.is_screenshot,
                COUNT(d.id) AS assessee_count
                FROM 
                    t_batch_head h 
                LEFT JOIN
                    t_batch_assessee d ON h.id = d.batch_id
                WHERE h.id = $1 
                GROUP BY h.id,
                    h.batch_name,
                    h.batch_code,
                    h.grouptest_id,
                    h.bu_id,
                    h.function_id,
                    h.template_email_id,
                    h.created_by,
                    h.updated_by,
                    h.created_at,
                    h.updated_by,
                    h.start_period,
                    h.end_period,
                    h.email_invitation,
                    h.is_camera,
                    h.is_mic,
                    h.is_screenshot      
           `, [id]
       );
       await client.query(TRANS.COMMIT);
       return result.rows[0];
    } catch (error) {
        console.log(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release();
    }
}

export const getBatchAssesses = async (id: string) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const result = await client.query(
            `
            SELECT 
                id,
                assessee_nik,
                assessee_name,
                assessee_email,
                is_darwin_exist
            FROM
                t_batch_assessee
            WHERE
                batch_id = $1
            `, [id]
        );
        console.log(result.rows)
        return result.rows;
    } catch (error) {
        console.log(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release();
    }
}

export const deleteBatchAssessee = async (batchId: string, assesseeId: string) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        await client.query(
            `
            DELETE FROM t_batch_assessee WHERE id = $2 AND batch_id = $1
            `,
            [batchId, assesseeId]
        );

        console.log(batchId, assesseeId);
        await client.query(TRANS.COMMIT);
    } catch (error) {
        console.error(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release();
    }
}

export const publishBatch = async (id: string, status: string) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        console.log("masuk query")

        const [Q, V] = updateQuery("t_batch_head", {status: status}, {id:id}, "template_email_id");
        console.log("keluar query")
        const updateStatus = await client.query(Q, V)
        console.log("keluar query 2")
        await client.query(TRANS.COMMIT);
        console.log("disini")
        console.log(updateStatus.rows[0].template_email_id);
        return updateStatus.rows[0].template_email_id;
    } catch (error) {
        console.error(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release();
    }
}

export const startProgress = async (headProgressPayload: any) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const [headerQ, headerV] = insertQuery("t_progress_batch_head", headProgressPayload);
        await client.query(headerQ, headerV);
        await client.query(TRANS.COMMIT);
    } catch (error) {
        console.error(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release();
    }
}
