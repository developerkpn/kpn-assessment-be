import { db } from "#dep/config/connection";
import { TRANSACTION as TRANS } from "#dep/config/transaction";
import { deleteQuery, insertQuery, updateQuery } from "#dep/helper/queryBuilder";



export const createBatch = async (headerPayload: any) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const [headerQ, headerV] = insertQuery("t_batch_head", headerPayload, "id");
        const headerResult = await client.query(headerQ, headerV);
        await client.query(TRANS.COMMIT);
        return headerResult.rows[0].id;
    } catch (error) {
        console.error(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release();
    }
}

export const addBatchAssessee = async (assesseePayload: any) => {
    const client = await db.connect();
    try {

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
        
    } catch (error) {
        console.log(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release();
    }
}

export const deleteBatchAssessee = async (assesseePayload: any) => {
    const client = await db.connect();
    try {

    } catch (error) {

    } finally {
        client.release();
    }
}