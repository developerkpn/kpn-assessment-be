import { db } from "@/config/connection.js";
import { TRANSACTION as TRANS } from "@/config/transaction.js";
import { deleteQuery, insertQuery, updateCriteriaQuery, updateQuery } from "@/helper/queryBuilder.js";
import { Criteria, CriteriaGroup, StandardizedPayload } from "@/types/MasterDataTypes.js";

export const getCriteriaColor = async () => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
        SELECT * FROM mst_criteria_color
        `
    );
    return result.rows;
  } catch (e) {
    console.log(e);
    await client.query(TRANS.ROLLBACK);
    throw e;
  } finally {
    client.release();
  }
};

export const createCriteria = async (
  groupPayload: CriteriaGroup,
  criteriaPayload: Criteria[],
  standardizedPayload: StandardizedPayload[]
) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);

    const [groupQ, groupV] = insertQuery("mst_value", groupPayload, "value_name");
    const groupResult = await client.query(groupQ, groupV);
    const [criteriaQ, criteriaV] = insertQuery("mst_criteria", criteriaPayload, "criteria_name");
    const criteriaResult = await client.query(criteriaQ, criteriaV);
    if (standardizedPayload !== undefined) {
      const [standardizedQ, standardizedV] = insertQuery("mst_standardized_score", standardizedPayload);
      const standardizedResult = await client.query(standardizedQ, standardizedV);
    }
    await client.query(TRANS.COMMIT);
    return groupResult.rows[0].value_name;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const getCriteria = async () => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
    SELECT cr.*, v.value_code, v.value_name, v.id AS value_id, cl.id as color_id, cl.name as color_name, cl.hex_code, ss.id as standardized_id, ss.value_id as standardized_value_id, ss.raw_score, ss.standardized_score 
    FROM mst_criteria cr
    JOIN mst_value v ON cr.category_fk = v.id
    LEFT JOIN mst_criteria_color cl ON cr.color_id = cl.id
    LEFT JOIN mst_standardized_score ss ON v.id = ss.value_id
    ORDER BY v.created_date DESC, v.value_name DESC, cr.minimum_score ASC, ss.raw_score ASC
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

export const deleteCriteria = async (id: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const result = await client.query(
      `
      DELETE FROM mst_criteria WHERE category_fk = $1
      `,
      [id]
    );
    const categoryResult = await client.query(
      `
      DELETE FROM mst_value WHERE id = $1 RETURNING value_name
      `,
      [id]
    );
    if (result.rowCount === 0 || categoryResult.rowCount === 0) {
      throw new Error(`ID ${id} not exist`);
    }
    await client.query(TRANS.COMMIT);
    console.log(categoryResult);
    return categoryResult.rows[0].value_name;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const updateCriteria = async (
  payload: CriteriaGroup,
  newCriteria: Criteria[],
  id: string,
  standardizedPayload: StandardizedPayload
) => {
  const client = await db.connect();
  try {
    console.log("masuk update criteria model");
    console.log(payload);
    console.log(newCriteria);
    await client.query(TRANS.BEGIN);

    // UPDATE CATEGORY
    const [groupQ, groupV] = updateQuery("mst_value", payload, { id: id }, "value_name");
    const groupResult = await client.query(groupQ, groupV);

    // DELETE PREV CRITERIA
    const [deleteCriteriaQ, deleteCriteriaV] = deleteQuery("mst_criteria", {
      category_fk: id,
    });
    await client.query(deleteCriteriaQ, deleteCriteriaV);

    console.log("add new criteria model");
    console.log(newCriteria);
    // ADD NEW CRITERIA
    const [insertCriteriaQ, insertCriteriaV] = insertQuery("mst_criteria", newCriteria);
    console.log("cek query");
    console.log(insertCriteriaQ, insertCriteriaV);
    await client.query(insertCriteriaQ, insertCriteriaV);

    // DELETE PREV STANDARDIZED
    await client.query(
      `
      DELETE FROM mst_standardized_score WHERE value_id = $1
        `,
      [id]
    );

    if (standardizedPayload !== undefined) {
      // ADD NEW SRANDARDIZED
      const [standardizedQ, standardizedV] = insertQuery("mst_standardized_score", standardizedPayload);
      const standardizedResult = await client.query(standardizedQ, standardizedV);
    }

    await client.query(TRANS.COMMIT);
    return groupResult.rows[0].value_name;
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const getCriteriaDetail = async (id: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
      SELECT 
        v.id AS value_id, 
        v.value_name, 
        v.value_code, 
        cr.id as criteria_id,
        cr.criteria_name, 
        cr.minimum_score, 
        cr.maximum_score, 
        cr.description, 
        cr.color_id, 
        cl.name as color_name,
        cl.hex_code,
        st.id as standardized_id,
        st.raw_score,
        st.standardized_score
      FROM mst_value v
      LEFT JOIN mst_criteria cr ON v.id = cr.category_fk
      LEFT JOIN mst_criteria_color cl ON cr.color_id = cl.id
      LEFT JOIN mst_standardized_score st ON v.id = st.value_id
      WHERE v.id = $1
      ORDER BY cr.minimum_score ASC
      `,
      [id]
    );
    return result.rows;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};
