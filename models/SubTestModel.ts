import {db} from "#dep/config/connection";
import { TRANSACTION as TRANS } from "#dep/config/transaction";
import {
    deleteQuery,
    insertQuery,
    updateQuery,
} from "#dep/helper/queryBuilder";
import {SubTestDetailRequest, SubTestHeaderRequest, SubTestRequest} from "#dep/types/MasterDataTypes";
import {ResponseError} from "#dep/error/response-error";

export const createSubTest = async (payloadHeader: SubTestHeaderRequest, payloadDetail: SubTestDetailRequest[]) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const [headerQ, headerV] = insertQuery("mst_subtest_head", payloadHeader, "subtest_code");
        const headerResult = await client.query(headerQ, headerV);
        const [detailQ, detailV] = insertQuery("mst_subtest_det", payloadDetail, "id");
        await client.query(detailQ, detailV);
        await client.query(TRANS.COMMIT);
        return headerResult.rows[0].subtest_code;
    } catch (error) {
        console.error(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release();
    }
}

export const getSubTest = async () => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const result = await client.query(
            `
            SELECT
                h.id,
                h.subtest_name,
                h.subtest_code,
                h.is_active,
                a.fullname AS created_by,
                h.created_at,
                COUNT(d.series_id) AS series_count    
            FROM mst_subtest_head h
            LEFT JOIN mst_subtest_det d ON h.id = d.subtest_id
            LEFT JOIN mst_admin_web a ON h.created_by = a.id
            GROUP BY h.id, h.subtest_name, h.subtest_code, h.is_active, a.fullname, h.created_at
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

export const updateSubTest = async (subtestId: string, headerPayload: SubTestHeaderRequest, detailPayload: any) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const [headerQ, headerV] = updateQuery("mst_subtest_head", headerPayload, {id: subtestId});
        const headerResult = await client.query(headerQ, headerV);
        if (!headerResult.rows[0].subtest_code) throw new ResponseError(404, `Sub Test with ID ${subtestId} is not found`)
        const [detailQ, detailV] = insertQuery("mst_subtest_det", detailPayload);
        await client.query(detailQ, detailV);
        await client.query(TRANS.COMMIT);
    } catch (error) {
        console.error(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release();
    }
}

export const deleteSubTest = async (id: string) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);

        const detailResult = await client.query(
            `
            DELETE FROM mst_subtest_det WHERE subtest_id = $1
            `,
            [id]
        );

        const headerResult = await client.query(
            `
            DELETE FROM mst_subtest_head WHERE id = $1 RETURNING subtest_code
            `,
            [id]
        );

        if (detailResult.rowCount === 0 || headerResult.rowCount === 0) {
            throw new ResponseError(404, `Sub Test with ID ${id} is not found.`);
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

export const getSubTestDetail = async (id: string) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const result = await client.query(
            `
            SELECT
                h.id AS subtest_id,
                h.subtest_name,
                h.subtest_code,
                h.subtest_duration,
                h.is_active,
                h.created_by,
                h.created_at,
                h.updated_by,
                h.updated_at,
                s.id AS series_id,
                s.series_name,
                s.series_code,
                d.id AS detail_id,
                d.added_by,
                d.added_at,
                c.id AS value_id,
                c.value_code,
                c.value_name
            FROM
                mst_subtest_head h
            LEFT JOIN
                mst_subtest_det d ON h.id = d.subtest_id
            LEFT JOIN 
                mst_series s ON d.series_id = s.id
            LEFT JOIN
                mst_value c ON h.criteria_id = c.id
            WHERE
                h.id = $1 
            `, [id]
        );

        await client.query(TRANS.COMMIT);
        const subtestDetail = {
            id: result.rows[0].subtest_id,
            subtest_name: result.rows[0].subtest_name,
            subtest_code: result.rows[0].subtest_code,
            subtest_duration: result.rows[0].subtest_duration,
            is_active: result.rows[0].is_active,
            category_name: result.rows[0].category_name,
            created_by: result.rows[0].created_by,
            created_at: result.rows[0].created_date,
            updated_by: result.rows[0].updated_by,
            updated_at: result.rows[0].updated_at,
            criteria: {
                id: result.rows[0].value_id,
                criteria_name: result.rows[0].value_name,
                criteria_code: result.rows[0].value_code,
            },
            series: result.rows.map(row => ({
                id: row.detail_id,
                series_id: row.series_id,
                series_name: row.series_name,
                series_code: row.series_code,
                added_by: row.added_by,
                added_at: row.added_at
            }))
        };
        return subtestDetail;
    } catch (error) {
        console.error(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release();
    }
}

export const getAvailableSeriesForSubTest = async (subtestId: string) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);

        const existingSeries = await client.query(
            `
            SELECT series_id FROM mst_subtest_det WHERE subtest_id = $1
            `,
            [subtestId]
        );

        const existingIds = existingSeries.rows.map(r => r.series_id);

        let exclusionClause = '';
        let queryParams: any[] = [];

        if (existingIds.length > 0) {
            queryParams.push(existingIds);
            exclusionClause = 'WHERE id != ALL($1)'
        }

        const result = await client.query(
            `
            SELECT 
                id, 
                series_name, 
                series_code
            FROM mst_series
            ${exclusionClause}
            ORDER BY created_date DESC
            `,
            queryParams,
        );

        return result.rows;
    } catch (error){
        console.error(error);
        await client.query(TRANS.ROLLBACK);
        throw error;
    } finally {
        client.release();
    }
}

export const deleteSeriesFromSubTest = async (subtestId: string, detailId: string, updatePayload: any) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const [headerQ, headerV] = updateQuery("mst_subtest_head", updatePayload, {id: subtestId});
        await client.query(headerQ, headerV);

        const result = await client.query(
            `
        DELETE FROM mst_subtest_det WHERE id = $1
        `,
            [detailId]
        );

        if (result.rowCount === 0) {
            throw new ResponseError(404, `Seris with Detail ID ${detailId} is not exist on existing Sub Test`);
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