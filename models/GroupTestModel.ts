import {db} from "#dep/config/connection";
import { TRANSACTION as TRANS } from "#dep/config/transaction";
import {
    deleteQuery,
    insertQuery,
    updateQuery,
} from "#dep/helper/queryBuilder";
import {GroupTestDetailRequest, GroupTestHeaderRequest, GroupTestRequest} from "#dep/types/MasterDataTypes";
import {ResponseError} from "#dep/error/response-error";

export const getAvailableSubTestForGroupTest = async (grouptestId: string) => {
    const client = await db.connect();

    try {
        await client.query(TRANS.BEGIN);

        console.log(grouptestId);
        const existingSubTests = await client.query(
            `SELECT test_id FROM mst_grouptest_det WHERE grouptest_id = $1`,
            [grouptestId]
        );

        console.log(existingSubTests)

        const existingIds = existingSubTests.rows.map(r => r.test_id);

        console.log(existingIds);
        let exclusionClause = '';
        const queryParams: any[] = [];

        if (existingIds.length > 0) {
            queryParams.push(existingIds);
            exclusionClause = 'WHERE h.id != ALL($1)';
        }

        const result = await client.query(
            `
            SELECT
                h.id,
                h.test_name,
                h.test_code,
                h.is_active,
                a.fullname AS created_by,
                h.created_at,
                COUNT(d.subtest_id) AS subtest_count
            FROM mst_test_head h
            LEFT JOIN mst_test_det d ON h.id = d.test_id 
            LEFT JOIN mst_admin_web a ON h.created_by = a.id
            ${exclusionClause}
            GROUP BY h.id, h.test_name, h.test_code, h.is_active, a.fullname, h.created_at
            ORDER BY h.created_at DESC
            `,
            queryParams,
        );

        return result.rows;
    } catch (error) {
        console.error(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release
    }
}

export const createGroupTest = async (payloadHeader: GroupTestHeaderRequest, payloadDetail: GroupTestDetailRequest[]) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const [headerQ, headerV] = insertQuery("mst_grouptest_head", payloadHeader, "grouptest_code");
        const headerResult = await client.query(headerQ, headerV);
        const [detailQ, detailV] = insertQuery("mst_grouptest_det", payloadDetail, "id");
        await client.query(detailQ, detailV);
        await client.query(TRANS.COMMIT);
        return headerResult.rows[0].grouptest_code;
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
            SELECT 
            h.id,
            h.grouptest_name,
            h.grouptest_code,
            h.is_active,
            a.fullname AS created_by,
            h.created_at,
            COUNT(d.test_id) AS test_count
            FROM mst_grouptest_head h
            LEFT JOIN  mst_grouptest_det d ON h.id = d.grouptest_id
            LEFT JOIN mst_admin_web a ON h.created_by = a.id
            GROUP BY h.id, h.grouptest_name, h.grouptest_code, h.is_active, a.fullname, h.created_at
            ORDER BY h.created_at DESC
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

export const updateGroupTest = async (grouptestId: string, headerPayload: any, detailPayload: GroupTestRequest[]) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const [headerQ, headerV] = updateQuery("mst_grouptest_head", headerPayload, {id: grouptestId}, "grouptest_code");
        const result = await client.query(headerQ, headerV);
        if (result.rowCount === 0) throw new ResponseError(404, `Group Test with ID ${grouptestId} is not found`);
        if (detailPayload.length > 0) {
            const [detailQ, detailV] = insertQuery("mst_grouptest_det", detailPayload);
            await client.query(detailQ, detailV);
        }
        await client.query(TRANS.COMMIT);

        return result.rows[0].grouptest_code;
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

        if (detailResult.rowCount === 0 && headerResult.rowCount === 0) {
            throw new ResponseError(404, `Group Test with ID ${id} is not found.`);
        }

        await client.query(TRANS.COMMIT);
        console.log(headerResult);
        return headerResult.rows[0].grouptest_code;
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
                a.fullname AS created_by,
                h.created_at,
                ads.fullname AS updated_by,
                h.updated_at,
                s.id AS test_id,
                s.test_name,
                s.test_code,
                d.id AS detail_id,
                ad.fullname AS added_by,
                d.added_at,
                (
                    SELECT COUNT(sd.subtest_id)
                    FROM mst_test_det sd
                    WHERE sd.test_id = s.id
                ) AS subtest_count
            FROM
                mst_grouptest_head h
            LEFT JOIN
                mst_grouptest_det d ON h.id = d.grouptest_id
            LEFT JOIN 
                mst_test_head s ON d.test_id = s.id
            LEFT JOIN
                mst_admin_web a ON h.created_by = a.id
            LEFT JOIN 
                mst_admin_web ad ON d.added_by = ad.id
            LEFT JOIN
                mst_admin_web ads ON h.updated_by = ads.id
            WHERE
                h.id = $1 
            `, [id]
        );

        await client.query(TRANS.COMMIT);
        const grouptestDetail = {
            id: result.rows[0].grouptest_id,
            grouptest_name: result.rows[0].grouptest_name,
            grouptest_code: result.rows[0].grouptest_code,
            is_active: result.rows[0].is_active,
            created_by: result.rows[0].created_by,
            created_at: result.rows[0].created_date,
            updated_by: result.rows[0].updated_by,
            updated_at: result.rows[0].updated_at,
            tests: result.rows
                .filter(row => row.test_id !== null)
                .map(row => ({
                    id: row.detail_id,
                    test_id: row.test_id,
                    test_name: row.test_name,
                    test_code: row.test_code,
                    added_by: row.added_by,
                    added_at: row.added_at,
                    subtest_count: row.subtest_count
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


export const deleteTestFromGroupTest = async (detailId: string, grouptestId: string, updatePayload: any) => {
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
            throw new ResponseError(404, `Group Test with detail ID ${detailId} is not exist on existing Test`);
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

export const getTestFromChoosenGroupTest = async (grouptestId: string) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        console.log(grouptestId);
        const result = await client.query(
            `SELECT 
             test_id
             FROM 
             mst_grouptest_det
             WHERE 
             grouptest_id = $1`,
            [grouptestId]
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

export const getTestIdByGroupTestId = async (grouptestId: string) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const result = await client.query(
            `
            SELECT test_id 
            FROM mst_grouptest_det
            WHERE grouptest_id = $1
            `, [grouptestId]
        );

        return result.rows;
    } catch (error) {
        console.error(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release();
    }
}