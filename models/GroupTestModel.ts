import {db} from "#dep/config/connection";
import { TRANSACTION as TRANS } from "#dep/config/transaction";
import {
    deleteQuery,
    insertQuery,
    updateQuery,
} from "#dep/helper/queryBuilder";
import {GroupTestDetailRequest, GroupTestHeaderRequest, GroupTestRequest} from "#dep/types/MasterDataTypes";


export const createGroupTest = async (payloadHeader: GroupTestHeaderRequest, payloadDetail: GroupTestDetailRequest[]) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const [headerQ, headerV] = insertQuery("mst_grouptest_head", payloadHeader, "grouptest_name");
        const headerResult = await client.query(headerQ, headerV);
        const [detailQ, detailV] = insertQuery("mst_grouptest_det", payloadDetail, "id");
        await client.query(detailQ, detailV);
        await client.query(TRANS.COMMIT);
        return headerResult.rows[0].subtest_name;
    } catch (error) {
        console.error(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release
    }
}

export const getGroupTest = async () => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const result = await client.query(
            `
            SELECT * FROM mst_grouptest_head
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

export const updateGroupTest = async (subtestId: string, updatePayload: any) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const [q, v] = updateQuery("mst_grouptest_head", updatePayload, {id: subtestId});
        const result = await client.query(q, v);
        if (result.rowCount === 0) throw new Error(`ID ${subtestId} not exist`);
        await client.query(TRANS.COMMIT);
    } catch (error) {
        console.error(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release();
    }
}

export const deleteGroupTest = async (id: string) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);

        const detailResult = await client.query(
            `
            DELETE FROM mst_grouptest_det WHERE grouptest_id = $1
            `,
            [id]
        );

        const headerResult = await client.query(
            `
            DELETE FROM mst_grouptest_head WHERE id = $1 RETURNING grouptest_code
            `,
            [id]
        );

        if (detailResult.rowCount === 0 || headerResult.rowCount === 0) {
            throw new Error(`ID ${id} not found.`);
        }

        await client.query(TRANS.COMMIT);
        console.log(headerResult);
        return headerResult.rows[0].subtest_code;
    } catch (error) {
        console.error(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release();
    }
}

export const getGroupTestDetail = async (id: string) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const result = await client.query(
            `
            SELECT
                h.id AS grouptest_id,
                h.grouptest_name,
                h.grouptest_code,
                h.is_active,
                h.created_by,
                h.created_at,
                h.updated_by,
                h.updated_at,
                s.id AS subtest_id,
                s.subtest_name,
                s.subtest_code,
                k.category_code,
                d.id AS detail_id,
                d.added_by,
                d.added_at
            FROM
                mst_grouptest_head h
            LEFT JOIN
                mst_grouptest_det d ON h.id = d.grouptest_id
            LEFT JOIN 
                mst_subtest_head s ON d.subtest_id = s.id
            LEFT JOIN
                mst_category k ON s.category_id = k.id
            WHERE
                h.id = $1 
            `, [id]
        );

        await client.query(TRANS.COMMIT);
        const grouptestDetail = {
            id: result.rows[0].grouptest_id,
            subtest_name: result.rows[0].grouptest_name,
            subtest_code: result.rows[0].grouptest_code,
            is_active: result.rows[0].is_active,
            created_by: result.rows[0].created_by,
            created_at: result.rows[0].created_date,
            updated_by: result.rows[0].updated_by,
            updated_at: result.rows[0].updated_at,
            subtests: result.rows.map(row => ({
                id: row.detail_id,
                subtest_id: row.subtest_id,
                subtest_name: row.subtest_name,
                subtest_code: row.subtest_code,
                category_code: row.category_code,
                added_by: row.added_by,
                added_at: row.added_at
            }))
        };

        return grouptestDetail;
    } catch (error) {
        console.error(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release();
    }
}

export const addSubTestToGroupTest = async (id: string, updatePayload: any, subtestPayload: GroupTestRequest[]) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const [headerQ, headerV] = updateQuery("mst_grouptest_head", updatePayload, {id: id});
        const headerResult = await client.query(headerQ, headerV);
        const [detailQ, detailV] = insertQuery("mst_grouptest_det", subtestPayload);
        const detailResult = await client.query(detailQ, detailV);
        await client.query(TRANS.COMMIT);
    } catch (error) {
        console.error(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release();
    }
}

export const deleteSubTestFromGroupTest = async (detailId: string, grouptestId: string, updatePayload: any) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const [headerQ, headerV] = updateQuery("mst_grouptest_head", updatePayload, {id: grouptestId});
        const headerResult = await client.query(headerQ, headerV);

        const result = await client.query(
            `
        DELETE FROM mst_grouptest_det WHERE id = $1 AND grouptest_id = $2
        `,
            [detailId, grouptestId]
        );

        if (result.rowCount === 0) {
            throw new Error(`ID ${detailId} not exist`);
        }
        await client.query(TRANS.COMMIT);
    } catch (error){
        console.error(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release();
    }
}