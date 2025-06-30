import { db } from "@/config/connection.js";
import { TRANSACTION, TRANSACTION as TRANS } from "@/config/transaction.js";
import { deleteQuery, insertQuery, updateQuery } from "@/helper/queryBuilder.js";
import { ResponseError } from "@/error/response-error.js";
import { async } from "rxjs";
import { getGroupTestDetail, getTestIdByGroupTestId } from "@/models/GroupTestModel.js";
import { format } from "logform";
import cli = format.cli;
import { NextFunction } from "express";
import { QueryResult } from "pg";
import { QuestionRequest } from "@/types/MasterDataTypes.js";

export const getBatchByAssessment = async (batchId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
                SELECT
                    id as batch_id,
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
            SELECT subtest_id, test_id 
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
        SELECT subtest_duration, is_duration
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
        SELECT subtest_name, is_mandatory
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
                answer_choice_e_image_url,
                answer_choice_f_text,
                answer_choice_f_image_url,
                answer_choice_g_text,
                answer_choice_g_image_url
            FROM mst_question_answer
            WHERE id = ANY($1)
            `,
      [questionIds]
    );

    console.log("cek coy databasenya");
    console.log(result.rows);

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
      WHERE id = $1
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
      SELECT submit_at, test_id FROM t_progress_batch_det WHERE id = $1
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

export const getAssessmentByUserNIK = async (userId: string) => {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
        SELECT 
            p.token,
            p.batch_id, 
            h.batch_name, 
            h.batch_code,
            h.start_period,
            h.end_period
        FROM t_progress_batch_head p 
        LEFT JOIN t_batch_head h ON p.batch_id = h.id
        WHERE assessee_id = $1
        order by start_period desc
        `,
      [userId]
    );

    return result.rows;
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    client.release();
  }
};

export const storeLog = async (data: any) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const [Q, V] = insertQuery("t_batch_log", data);
    await client.query(Q, V);
    await client.query(TRANS.COMMIT);
  } catch (e) {
    await client.query(TRANS.ROLLBACK);
    console.error(e);
    throw e;
  } finally {
    client.release();
  }
};

export const getSubtestExampleisTaken = async (subtest_id: string) => {
  try {
    const client = await db.connect();
    try {
      const { rows }: QueryResult<{ example_taken: boolean }> = await client.query(
        `select example_taken from t_progress_batch_det where id = $1`,
        [subtest_id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    throw error;
  }
};

export const getSubtestExampleData = async (subtest_id: string) => {
  try {
    const client = await db.connect();
    try {
      const {
        rows,
      }: QueryResult<QuestionRequest & { subtest_name: string; intro_desc: string; is_example_answer_shown: boolean }> =
        await client.query(
          `
        select
          mqa.*, msh.subtest_name, msh.subtest_name, msh.intro_desc, msh.is_example_answer_shown
        from
          t_progress_batch_det tpbd
        left join mst_subtest_head msh on
          msh.id = tpbd.subtest_id
        left join mst_series_det ms on
          ms.series_id = msh.series_example_id
        left join mst_question_answer mqa on
          mqa.id = ms.question_id
        where
          tpbd.id = $1
        `,
          [subtest_id]
        );
      const result = rows.map((item) => ({
        question_id: item.id,
        input: {
          text: item.q_input_text,
          image_url: item.q_input_image_url,
        },
        answer_type: item.answer_type,
        choices: {
          a: {
            text: item.answer_choice_a_text,
            image_url: item.answer_choice_a_image_url,
            point: item.key_answer_point_a,
          },
          b: {
            text: item.answer_choice_b_text,
            image_url: item.answer_choice_b_image_url,
            point: item.key_answer_point_b,
          },
          c: {
            text: item.answer_choice_c_text,
            image_url: item.answer_choice_c_image_url,
            point: item.key_answer_point_c,
          },
          d: {
            text: item.answer_choice_d_text,
            image_url: item.answer_choice_d_image_url,
            point: item.key_answer_point_d,
          },
          e: {
            text: item.answer_choice_e_text,
            image_url: item.answer_choice_e_image_url,
            point: item.key_answer_point_e,
          },
          f: {
            text: item.answer_choice_f_text,
            image_url: item.answer_choice_f_image_url,
            point: item.key_answer_point_f,
          },
          g: {
            text: item.answer_choice_g_text,
            image_url: item.answer_choice_g_image_url,
            point: item.key_answer_point_g,
          },
        },
      }));
      return {
        data: result,
        subtest_name: rows[0].subtest_name,
        intro_desc: rows[0].intro_desc,
        is_example_answer_shown: rows[0].is_example_answer_shown,
      };
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    throw error;
  }
};

export const updateExampleTaken = async (subtest_id: string) => {
  try {
    const client = await db.connect();
    try {
      await client.query(TRANS.BEGIN);
      const { rowCount } = await client.query(
        "UPDATE t_progress_batch_det set example_taken = true where id = $1 returning id",
        [subtest_id]
      );
      if (!rowCount) {
        throw new Error("Failed to update");
      }
      await client.query(TRANS.COMMIT);
      return true;
    } catch (error) {
      await client.query(TRANS.ROLLBACK);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    throw error;
  }
};

export const getPointPerQuestion = async (detId: string) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    console.log("masuk 1");
    // 1. Ambil semua jawaban yang tersimpan untuk detId ini
    const resAnswers = await client.query(
      `SELECT id, question_id, answer_a, answer_b, answer_c, answer_d, answer_e, answer_f, answer_g
       FROM t_store_answer
       WHERE det_id = $1`,
      [detId]
    );
    const storeAnswers = resAnswers.rows;
    if (storeAnswers.length === 0) {
      await client.query("ROLLBACK");
      return [];
    }

    console.log("masuk 2");
    // 2. Ambil key points dari mst_question_answer untuk semua question_id
    const questionIds = Array.from(new Set(storeAnswers.map((r) => r.question_id)));
    const resKeys = await client.query(
      `SELECT id AS question_id, key_answer_point_a, key_answer_point_b, key_answer_point_c,
              key_answer_point_d, key_answer_point_e, key_answer_point_f, key_answer_point_g
       FROM mst_question_answer
       WHERE id = ANY($1)`,
      [questionIds]
    );
    const keyMap = resKeys.rows.reduce(
      (acc, row) => {
        acc[row.question_id] = row;
        return acc;
      },
      {} as Record<string, any>
    );

    console.log("masuk 3");
    const results: { id: string; question_id: string; totalPoint: number }[] = [];

    // 3. Hitung dan update per jawaban
    for (const ans of storeAnswers) {
      const key = keyMap[ans.question_id] || {};
      let total = 0;

      // opsi a sampai g
      for (const letter of ["a", "b", "c", "d", "e", "f", "g"] as const) {
        const answered = ans[`answer_${letter}`];
        const point = key[`key_answer_point_${letter}`] || 0;
        if (answered && point) total += Number(point);
      }

      // update point di t_store_answer
      await client.query(`UPDATE t_store_answer SET point = $1 WHERE id = $2`, [total, ans.id]);

      results.push({ id: ans.id, question_id: ans.question_id, totalPoint: total });
    }

    // Hitung total agregat sum untuk subtest
    const sumSubTest = await client.query(
      `
        SELECT SUM(point) AS point 
        FROM t_store_answer
        WHERE det_id = $1
        GROUP BY det_id
        `,
      [detId]
    );

    console.log(sumSubTest.rows[0].point);
    const [sumQ, sumV] = updateQuery("t_progress_batch_det", { sum_point: sumSubTest.rows[0].point }, { id: detId });
    await client.query(sumQ, sumV);
    console.log("sumSubTest");
    console.log(sumSubTest.rows[0]);
    await client.query("COMMIT");
    return results;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
