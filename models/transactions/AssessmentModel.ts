import { db } from "#dep/config/connection";
import { TRANSACTION, TRANSACTION as TRANS } from "#dep/config/transaction";
import { deleteQuery, insertQuery, updateQuery } from "#dep/helper/queryBuilder";
import { ResponseError } from "#dep/error/response-error";
import { async } from "rxjs";
import { getGroupTestDetail, getTestIdByGroupTestId } from "#dep/models/GroupTestModel";
import { format } from "logform";
import cli = format.cli;

export const getBatchByAssessment = async (batchId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
                SELECT
                    batch_name,
                    batch_code,
                    description,
                    grouptest_id,
                    start_period,
                    end_period,
                    is_camera,
                    is_mic,
                    is_screenshot
                FROM 
                    t_batch_head 
                WHERE
                    id = $1
            `,
      [batchId]
    );

    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const getProgressHead = async (userId: string, batchId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
            SELECT 
                id 
            FROM
                t_progress_batch_head
            WHERE 
                assessee_id = $1 AND batch_id = $2 
            `,
      [userId, batchId]
    );
    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const getProgressDetail = async (progressHeadId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
             SELECT
                 id
             FROM
                 t_progress_batch_det
             WHERE
                 head_id = $1
             `,
      [progressHeadId]
    );

    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const createAssessmentProgressDetail = async (payload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [Q, V] = insertQuery("t_progress_batch_det", payload);
    await client.query(Q, V);
    await client.query(TRANS.COMMIT);
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const updateAssessmentStart = async (progressDetailId: any, payload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [Q, V] = updateQuery("t_progress_batch_det", payload, { id: progressDetailId });
    await client.query(Q, V);
    await client.query(TRANS.COMMIT);
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const assessmentSubmission = async (detId: string, payload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [Q, V] = updateQuery("t_progress_batch_det", payload, { id: detId });
    await client.query(Q, V);
    await client.query(TRANS.COMMIT);
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

export const getSubtestIdbyProgressId = async (progressDetailId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
            SELECT subtest_id 
            FROM t_progress_batch_det
            WHERE id = $1
            `,
      [progressDetailId]
    );

    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const getSubtestDurationById = async (subtestId: string) => {
  const client = await db.connect();
  try {
    const duration = await client.query(
      `
        SELECT subtest_duration
        FROM mst_subtest_head
        WHERE id = $1
        `,
      [subtestId]
    );
    return duration.rows[0];
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    client.release();
  }
};

export const getSubtestNamebyId = async (subTestId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
        SELECT subtest_name
        FROM mst_subtest_head
        WHERE id = $1
        `,
      [subTestId]
    );
    return result.rows[0];
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    client.release();
  }
};

export const getSeriesBySubtestId = async (subtestId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
            SELECT series_id 
            FROM mst_subtest_det
            WHERE subtest_id = $1
            `,
      [subtestId]
    );
    return result.rows;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const getQuestionsBySeriesId = async (seriesId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
            SELECT question_id FROM mst_series_det
            WHERE series_id = $1
            `,
      [seriesId]
    );

    return result.rows;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const getQuestionAssessment = async (questionIds: string[]) => {
  const client = await db.connect();
  try {
    // Use parameterized query with array
    const result = await client.query(
      `
            SELECT
                id,
                q_input_text,
                q_input_image_url,
                answer_type,
                answer_choice_a_text,
                answer_choice_a_image_url,
                answer_choice_b_text,
                answer_choice_b_image_url,
                answer_choice_c_text,
                answer_choice_c_image_url,
                answer_choice_d_text,
                answer_choice_d_image_url,
                answer_choice_e_text,
                answer_choice_e_image_url
            FROM mst_question_answer
            WHERE id = ANY($1)
            `,
      [questionIds]
    );

    return result.rows;
  } catch (error) {
    throw error;
    console.log(error);
  } finally {
    client.release();
  }
};

export const storeAnswer = async (detId: string, questionId: string, payload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    console.log(payload);
    const [Q, V] = updateQuery("t_store_answer", payload, { det_id: detId, question_id: questionId });
    await client.query(Q, V);
    await client.query(TRANS.COMMIT);
  } catch (e) {
    await client.query(TRANS.ROLLBACK);
    throw e;
  } finally {
    client.release();
  }
};

export const getAssessmentSubTest = async (progressHeadId: string, testId: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const testResult = await client.query(
      `
            SELECT 
                test_name,
                description
            FROM 
                mst_test_head
            WHERE id = $1
        `,
      [testId]
    );
    const result = await client.query(
      `
            SELECT
                td.id,
                td.subtest_id,
                sh.subtest_name,
                sh.subtest_duration,
                td.status
             FROM t_progress_batch_det td
             LEFT JOIN
                mst_subtest_head sh ON td.subtest_id = sh.id
             WHERE td.head_id = $1 AND td.test_id = $2
        `,
      [progressHeadId, testId]
    );

    return { test: testResult.rows[0], subtests: result.rows };
  } catch (e) {
    await client.query(TRANS.ROLLBACK);
    throw e;
  } finally {
    client.release();
  }
};

export const getAssessmentTest = async (headId: string) => {
  const client = await db.connect();
  try {
    // Updated query to return only distinct test_ids with their corresponding test_name
    const result = await client.query(
      `
            SELECT DISTINCT
                td.test_id,
                th.test_name
            FROM
                t_progress_batch_det td
            LEFT JOIN
                mst_test_head th ON td.test_id = th.id
            WHERE
                td.head_id = $1
        `,
      [headId]
    );
    return result.rows;
  } catch (e) {
    throw e;
  } finally {
    client.release();
  }
};

export const getTestStatus = async (headId: string, testId: string) => {
  const client = await db.connect();
  try {
    // First, get all subtests for this test_id
    const subtestsResult = await client.query(
      `
            SELECT
                td.id,
                td.status,
                td.subtest_id
            FROM
                t_progress_batch_det td
            WHERE
                td.head_id = $1 AND td.test_id = $2
        `,
      [headId, testId]
    );

    // If any subtest is not "Completed", the entire test is considered incomplete
    const allSubtests = subtestsResult.rows;
    const hasIncompleteSubtests = allSubtests.some((subtest) => subtest.status !== "Completed");

    return hasIncompleteSubtests ? "Not Completed" : "Completed";
  } catch (e) {
    throw e;
  } finally {
    client.release();
  }
};

export const checkSubTestIsTaken = async (detId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
            SELECT det_id FROM t_store_answer WHERE det_id = $1
            `,
      [detId]
    );
    return result.rows[0];
  } catch (e) {
    throw e;
  } finally {
    client.release();
  }
};

export const getTakenQuestions = async (detId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
            SELECT * FROM t_store_answer WHERE det_id = $1
            `,
      [detId]
    );

    return result.rows;
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    client.release();
  }
};

export const storeTakenQuestions = async (payload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [Q, V] = insertQuery("t_store_answer", payload);
    await client.query(Q, V);
    await client.query(TRANS.COMMIT);
  } catch (e) {
    await client.query(TRANS.ROLLBACK);
    throw e;
  } finally {
    client.release();
  }
};

export const updateStoreQuestion = async (questionId: string, detId: string) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    // const [Q, V];
    await client.query(TRANS.COMMIT);
  } catch (e) {
    await client.query(TRANS.ROLLBACK);
    throw e;
  } finally {
    client.release();
  }
};

export const checkQuestionType = async (questionId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
      SELECT answer_type FROM mst_question_answer WHERE id = $1
        `,
      [questionId]
    );
    return result.rows[0];
  } catch (e) {
    throw e;
  } finally {
    await client.release();
  }
};

export const storingQuestion = async (questionId: string, detId: string, payload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [Q, V] = updateQuery("t_store_answer", payload, { id: questionId });
    await client.query(Q, V);
    await client.query(TRANS.COMMIT);
  } catch (e) {
    await client.query(TRANS.ROLLBACK);
    throw e;
  } finally {
    client.release();
  }
};

export const getFinishAt = async (detId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
      SELECT should_be_finished_at 
      FROM t_progress_batch_det
      WHERE subtest_id = $1
        `,
      [detId]
    );

    return result.rows[0];
  } catch (e) {
    throw e;
  } finally {
    client.release();
  }
};

export const updateProgressDet = async (detId: string, payload: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    updateQuery("t_progress_batch_det", payload, { id: detId });
    await client.query(TRANS.COMMIT);
  } catch (e) {
    await client.query(TRANS.ROLLBACK);
    throw e;
  } finally {
    client.release();
  }
};

export const checkSubmissionStatus = async (detId: string) => {
  const client = await db.connect();
  try {
    const status = await client.query(
      `
      SELECT submit_at FROM t_progress_batch_det WHERE id = $1
        `,
      [detId]
    );
    return status.rows[0];
  } catch (e) {
    throw e;
  } finally {
    client.release();
  }
};

export const getAssessmentTermsPP = async () => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
    SELECT id, name FROM mst_term_pp
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
