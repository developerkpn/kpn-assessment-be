import {db} from "#dep/config/connection";
import { TRANSACTION as TRANS } from "#dep/config/transaction";
import {
    deleteQuery,
    insertQuery,
    updateQuery,
} from "#dep/helper/queryBuilder";
import {async} from "rxjs";
import {SubTestDetailRequest, SubTestHeaderRequest, SubTestRequest} from "#dep/types/MasterDataTypes";
import {format} from "logform";
import cli = format.cli;

export const createSubTest = async (payloadHeader: SubTestHeaderRequest, payloadDetail: SubTestDetailRequest[]) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const [headerQ, headerV] = insertQuery("mst_subtest_head", payloadHeader, "id");
        const headerResult = await client.query(headerQ, headerV);
        const [detailQ, detailV] = insertQuery("mst_subtest_det", payloadDetail, "id");
        await client.query(detailQ, detailV);
        await client.query(TRANS.COMMIT);
        return headerResult.rows[0].subtest_name;
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
            SELECT * FROM mst_subtest_head
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

export const updateSubTest = async (subtestId: string, updatePayload: any) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const [q, v] = updateQuery("mst_subtest_head", updatePayload, {id: subtestId});
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

export const getSubtestDetail = async (id: string) => {
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
                c.criteria_code,
                k.category_code,
                s.id AS series_id,
                s.series_name,
                s.series_code,
                d.id AS detail_id,
                d.added_by,
                d.added_at
            FROM
                mst_subtest_head h
            LEFT JOIN
                mst_subtest_det d ON h.id = d.subtest_id
            LEFT JOIN 
                mst_series s ON d.series_id = s.id
            LEFT JOIN
                mst_value c ON h.criteria_id = c.id
            LEFT JOIN
                mst_category k ON h.category_id = k.id
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
            criteria_code: result.rows[0].criteria_code,
            category_name: result.rows[0].category_name,
            created_by: result.rows[0].created_by,
            created_at: result.rows[0].created_date,
            updated_by: result.rows[0].updated_by,
            updated_at: result.rows[0].updated_at,
            questions: result.rows.map(row => ({
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

export const addSeriesToSubTest = async (id: string, updatePayload: any, seriesPayload: SubTestRequest[]) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const [headerQ, headerV] = updateQuery("mst_subtest_head", updatePayload, {id: id});
        const headerResult = await client.query(headerQ, headerV);
        const [detailQ, detailV] = insertQuery("mst_subtest_det", seriesPayload);
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

export const deleteSeriesFromSubTest = async (detailId: string, subtestId: string, updatePayload: any) => {
    const client = await db.connect();
    try {
        await client.query(TRANS.BEGIN);
        const [headerQ, headerV] = updateQuery("mst_subtest_head", updatePayload, {id: subtestId});
        const headerResult = await client.query(headerQ, headerV);

        const result = await client.query(
            `
        DELETE FROM mst_subtest_det WHERE id = $1 AND subtest_id = $2
        `,
            [detailId, subtestId]
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