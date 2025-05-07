import { Request, Response, NextFunction } from "express";
import { getBatch, getBatchDetail } from "#dep/models/BatchModel";
import {
  assessmentSubmission,
  checkQuestionType,
  checkSubmissionStatus,
  checkSubTestIsTaken,
  createAssessmentProgressDetail,
  getAssessmentByUserNIK,
  getAssessmentSubTest,
  getAssessmentTermsPP,
  getAssessmentTest,
  getBatchByAssessment,
  getFinishAt,
  getPointPerQuestion,
  getProgressDetail,
  getProgressHead,
  getQuestionAssessment,
  getQuestionsBySeriesId,
  getSeriesBySubtestId,
  getSubtestDurationById,
  getSubtestExampleData,
  getSubtestExampleisTaken,
  getSubtestIdbyProgressId,
  getSubtestNamebyId,
  getTakenQuestions,
  getTestStatus,
  storeAnswer,
  storeLog,
  storeTakenQuestions,
  updateAssessmentStart,
  updateExampleTaken,
} from "#dep/models/transactions/AssessmentModel";
import { Validation } from "#dep/validation/Validation";
import { getQuestion } from "#dep/models/QuestionModel";
import { v7 as uuid } from "uuid";
import { ResponseError } from "#dep/error/response-error";
import { getTestIdByGroupTestId } from "#dep/models/GroupTestModel";
import { Secret, verify } from "jsonwebtoken";
import { AssessmentToken } from "#dep/types/Transaction";
import { getSubTestIdByTestId, getTest } from "#dep/models/TestModel";
import { getSeriesDetail } from "#dep/models/SeriesModel";
import fs from "fs";
import path from "path";
import moment from "moment";
import "moment-timezone/index";
import axios, { isAxiosError } from "axios";
import { PP_ID, TERMS_ID } from "#dep/constant";
import { checkRegisteredExternalAssessee } from "#dep/models/transactions/AssesseeModel";

export const handleAssessmentToken = async (token: string) => {
  try {
    const tokenDecode = verify(token, process.env.SECRETJWT as Secret);
    return tokenDecode;
  } catch (e) {
    throw e;
  }
};

export const handleGetAssessmentsByUserId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userNIK = req.params.nik;
    const data = await getAssessmentByUserNIK(userNIK);
    res.status(200).send({
      message: "Success!",
      data: data,
    });
  } catch (e) {
    throw e;
  }
};

export const handleGetAssesseeProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token: any = await handleAssessmentToken(req.params.token);

    const payload = {
      api_key: process.env.API_KEY,
      datasetKey: process.env.DATASET_KEY,
      employee_ids: [`${token.user_id}`],
    };

    console.log(payload);

    // Encode Basic Auth (username:password) ke Base64
    const username = process.env.BASIC_AUTH_USERNAME || "no";
    console.log(username);
    const password = process.env.BASIC_AUTH_PASSWORD || "no";
    console.log(password);
    const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");
    console.log(basicAuth);
    const getAssessee = await axios.post(`${process.env.DARWIN_EMPLOYEE_BASE_URL}`, payload, {
      headers: {
        Authorization: `Basic ${basicAuth}`, // Menambahkan header Authorization
        "Content-Type": "application/json",
      },
    });

    res.status(200).send({
      message: "Success!",
      data: getAssessee.data.employee_data,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetBatchDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate and get token
    const token: any = await handleAssessmentToken(req.params.token);
    const batch = await getBatchByAssessment(token.batch_id);

    // Check if user has permission
    const progressHead = await getProgressHead(token.user_id, token.batch_id);
    if (!progressHead) {
      throw new ResponseError(401, "You haven't been assigned to this assessment");
    }

    // Check existing progress
    const progressDet = await getProgressDetail(progressHead.id);
    if (progressDet) {
      res.status(200).send({
        message: "Assessment progress already exists!",
        data: batch,
      });
    } else {
      // Get all tests from group test
      const tests = await getTestIdByGroupTestId(batch.grouptest_id);
      if (!tests || tests.length === 0) {
        throw new ResponseError(404, "No tests found in this group");
      }

      // Create progress details for each test and its subtests
      const progressDetails = [];
      for (const test of tests) {
        // Get subtests for current test
        const subtests = await getSubTestIdByTestId(test.test_id);

        if (subtests && subtests.length > 0) {
          // Create progress detail for each subtest
          for (const subtest of subtests) {
            const payload = {
              id: uuid(),
              head_id: progressHead.id,
              test_id: test.test_id,
              subtest_id: subtest.subtest_id,
            };
            progressDetails.push(payload);
          }
        }
      }

      // Bulk create all progress details
      await createAssessmentProgressDetail(progressDetails);

      res.status(200).send({
        message: "Assessment progress initialized successfully!",
        data: batch,
      });
    }
  } catch (e) {
    next(e);
  }
};

export const handleGetAsssessmentQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const progressDetailId = req.params.id;

    // Cek apakah sudah disubmit
    const checkIfAlreadySubmitted = await checkSubmissionStatus(progressDetailId);
    console.log(checkIfAlreadySubmitted);
    if (checkIfAlreadySubmitted.submit_at !== null) {
      throw new ResponseError(400, "Sub Test's already submitted!");
    }

    // Ambil Subtest Id
    const subtest = await getSubtestIdbyProgressId(progressDetailId);
    // Ambil nama subtest
    const subtestName = await getSubtestNamebyId(subtest.subtest_id);

    console.log("Masuk hey");
    console.log(progressDetailId);
    console.log(subtest);

    // Cek apakah ada det_id pada t_store_answer
    const checkQuestionIsAlreadyTaken = await checkSubTestIsTaken(progressDetailId);
    console.log(checkQuestionIsAlreadyTaken);
    let response;
    // Kalo ada dia berarti udah pernah diambil
    if (checkQuestionIsAlreadyTaken) {
      console.log("Masuk hey 1");
      console.log("Keluar");

      // Ambil waktu sekarang
      const now = moment();
      console.log("Current time:", now.format());

      // Ambil waktu selesai dari database (sudah dalam zona +07:00)
      const finishAtFromDB = await getFinishAt(subtest.subtest_id);
      console.log("Raw finishAt from DB:", finishAtFromDB);

      // Langsung parse tanpa .utc()
      const shouldBeFinishedAt = moment.utc(finishAtFromDB.should_be_finished_at).tz("Asia/Jakarta");
      console.log("Parsed shouldBeFinishedAt:", shouldBeFinishedAt.format());

      // Jika waktu sudah habis, lempar error
      if (now.isAfter(shouldBeFinishedAt)) {
        const payload = {
          submit_at: new Date(),
          status: "Completed",
        };
        await assessmentSubmission(progressDetailId, payload);
        throw new ResponseError(404, "Time's Out!");
      }

      // Hitung sisa durasi dalam detik
      const remainingDurationSeconds = shouldBeFinishedAt.diff(now, "seconds");
      console.log("Remaining seconds:", remainingDurationSeconds);

      // Konversi ke format "hh:mm:ss"
      const remainingDurationFormatted = moment.utc(remainingDurationSeconds * 1000).format("HH:mm:ss");
      console.log("Remaining duration formatted:", remainingDurationFormatted);

      // Ambil data pertanyaan yang sudah diambil
      const takenQuestion: any[] = await getTakenQuestions(progressDetailId);
      console.log(takenQuestion);

      // Ambil question_id dari takenQuestion
      const questionIds = takenQuestion.map((q: any) => q.question_id);
      console.log(questionIds);

      // Ambil detail pertanyaan dari daftar question_id
      const questions = await getQuestionAssessment(questionIds);
      console.log(questions);

      console.log(subtest);

      // Format response
      response = {
        det_id: progressDetailId,
        duration: remainingDurationFormatted,
        subtest_name: subtestName.subtest_name,
        questions: questions.map((q: any) => {
          // Cari taken question yang sesuai berdasarkan question_id
          const taken = takenQuestion.find((t: any) => t.question_id === q.id);

          return {
            question_id: q.id,
            subtest_id: subtest.subtest_id,
            input: {
              text: q.q_input_text,
              image_url: q.q_input_image_url,
            },
            answer_type: q.answer_type,
            choices: {
              a: { text: q.answer_choice_a_text, image_url: q.answer_choice_a_image_url },
              b: { text: q.answer_choice_b_text, image_url: q.answer_choice_b_image_url },
              c: { text: q.answer_choice_c_text, image_url: q.answer_choice_c_image_url },
              d: { text: q.answer_choice_d_text, image_url: q.answer_choice_d_image_url },
              e: { text: q.answer_choice_e_text, image_url: q.answer_choice_e_image_url },
              f: { text: q.answer_choice_f_text, image_url: q.answer_choice_f_image_url },
              g: { text: q.answer_choice_g_text, image_url: q.answer_choice_g_image_url },
            },
            choosen_answer: {
              a: taken.answer_a,
              b: taken.answer_b,
              c: taken.answer_c,
              d: taken.answer_d,
              e: taken.answer_e,
              f: taken.answer_f,
              g: taken.answer_g,
            },
          };
        }),
      };
    } else {
      console.log("Masuk hey 2");
      // Ambil durasi
      const subtestDurations: any = await getSubtestDurationById(subtest.subtest_id);

      // Get and randomize series
      const seriesList: any[] = await getSeriesBySubtestId(subtest.subtest_id);
      const choosenSeriesId = seriesList[Math.floor(Math.random() * seriesList.length)].series_id;

      console.log(seriesList);
      console.log(choosenSeriesId);
      // Get and randomize questions
      const questionList = await getQuestionsBySeriesId(choosenSeriesId);
      const shuffledQuestions = questionList.sort(() => Math.random() - 0.5);
      console.log(questionList);
      // [
      //     { question_id: 'bf58979f-e72e-47eb-adb7-cbecf1668792' },
      //     { question_id: 'bf58979f-e72e-47eb-adb7-cbecf1668792' },
      //     { question_id: 'bf58979f-e72e-47eb-adb7-cbecf1668792' },
      //     { question_id: '032bd1b3-f1b6-4136-ba3e-1676478580b8' },
      //     { question_id: 'a83e564e-fae2-47c5-96d4-b01ee40eb647' }
      // ]
      console.log(shuffledQuestions);

      // Get detailed question information
      const questions = await getQuestionAssessment(shuffledQuestions.map((q) => q.question_id));
      console.log(questions);

      const storeQuestion = questionList.map((question: any) => ({
        ...question,
        id: uuid(), // id baru dengan UUID
        det_id: progressDetailId,
      }));
      console.log(questionList);
      console.log("store the question");
      console.log(storeQuestion);
      await storeTakenQuestions(storeQuestion);

      // Format response
      response = {
        det_id: progressDetailId,
        duration: subtestDurations.subtest_duration, // Default 1 hour if not specified
        subtest_name: subtestName.subtest_name,
        questions: questions.map((q: any) => ({
          question_id: q.id,
          input: {
            text: q.q_input_text,
            image_url: q.q_input_image_url,
          },
          answer_type: q.answer_type,
          choices: {
            a: { text: q.answer_choice_a_text, image_url: q.answer_choice_a_image_url },
            b: { text: q.answer_choice_b_text, image_url: q.answer_choice_b_image_url },
            c: { text: q.answer_choice_c_text, image_url: q.answer_choice_c_image_url },
            d: { text: q.answer_choice_d_text, image_url: q.answer_choice_d_image_url },
            e: { text: q.answer_choice_e_text, image_url: q.answer_choice_e_image_url },
            f: { text: q.answer_choice_f_text, image_url: q.answer_choice_f_image_url },
            g: { text: q.answer_choice_g_text, image_url: q.answer_choice_g_image_url },
          },
          choosen_answer: {
            a: false,
            b: false,
            c: false,
            d: false,
            e: false,
            f: false,
            g: false,
          },
        })),
      };

      // Menggunakan moment.js untuk menangani tanggal dan waktu
      const takenAt = moment(); // waktu saat ini
      // Mengonversi string durasi ("00:30:00") menjadi objek duration
      const subtestDuration = moment.duration(subtestDurations.subtest_duration);
      // Menambahkan durasi ke waktu pengambilan
      const shouldBeFinishedAt = moment(takenAt).add(subtestDuration);
      console;
      // Membuat payload untuk update assessment (mengonversi kembali ke objek Date jika diperlukan)
      const updatePayload = {
        taken_at: takenAt.toDate(),
        should_be_finished_at: shouldBeFinishedAt.toDate(),
        status: "In Progress",
      };

      await updateAssessmentStart(progressDetailId, updatePayload);
    }
    // Jalankan fungsi kalo dia dah pernah diambil
    // Ambil soal yang udah diambil
    // Ambil jawaban yang udah dipilih
    // Cek durasinya sisa durasi
    // Kalo ga ada berarti dia belum pernah diambil
    // Jalankan fungsi belum pernah diambil
    // Store question_id pada t_store_answer

    res.status(200).json({
      message: "Success!",
      data: response,
    });
  } catch (e) {
    next(e);
  }
};

// export const handleStoreAnswer = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { id, questions } = req.body; // Get questions array from request body
//
//     // Array to store all answer records to be inserted
//     const answerRecords: any = [];
//
//     // Process each question's answers
//     questions.forEach((questionItem: any) => {
//       const { question_id, answers } = questionItem;
//
//       // Handle each answer for this question
//       answers.forEach((answerItem: any) => {
//         answerRecords.push({
//           id: uuid(), // Generate unique ID for each answer record
//           det_id: id, // Use the ID from request params
//           question_id: question_id,
//           answer: answerItem.answer,
//         });
//         0;
//       });
//     });
//
//     // Store each answer record separately
//     for (const payload of answerRecords) {
//       console.log(payload);
//       await storeAnswer(payload);
//     }
//
//     res.status(200).send({
//       message: "Answers stored successfully!",
//     });
//   } catch (e) {
//     next(e);
//   }
// };

export const handleStoreAnswer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { det_id, question_id, answer } = req.body;
    // Ambil Subtest Id
    const subtest = await getSubtestIdbyProgressId(det_id);
    // Cek apakah sudah disubmit
    const checkIfAlreadySubmitted = await checkSubmissionStatus(det_id);
    console.log(checkIfAlreadySubmitted);
    if (checkIfAlreadySubmitted.submit_at !== null) {
      throw new ResponseError(400, "Sub Test's already submitted!");
    }

    // Cek apakah durasi sudah habis
    // Ambil waktu sekarang
    const now = moment();
    console.log("Current time:", now.format());

    // Ambil waktu selesai dari database (sudah dalam zona +07:00)
    const finishAtFromDB = await getFinishAt(subtest.subtest_id);
    console.log("Raw finishAt from DB:", finishAtFromDB);

    // Langsung parse tanpa .utc()
    const shouldBeFinishedAt = moment.utc(finishAtFromDB.should_be_finished_at).tz("Asia/Jakarta");
    console.log("Parsed shouldBeFinishedAt:", shouldBeFinishedAt.format());

    // Jika waktu sudah habis, lempar error
    if (now.isAfter(shouldBeFinishedAt)) throw new ResponseError(401, "Time's Out!");

    const questionType = await checkQuestionType(question_id);
    console.log(questionType);
    if (questionType.answer_type === "single") {
      // Ambil semua nilai jawaban (misal answer_a, answer_b, dll)
      const answerValues = Object.values(answer);
      // Hitung jumlah jawaban yang bernilai true
      const trueCount = answerValues.filter((val) => val === true).length;
      console.log("total true");
      console.log(trueCount);
      if (trueCount > 1) {
        throw new ResponseError(400, "Single choice answer");
      }
    }
    // Jika tipe soal multi choice, tidak perlu validasi khusus

    // Simpan jawaban ke database (misalnya melalui fungsi storeAnswer)
    await storeAnswer(det_id, question_id, { ...answer });

    res.status(200).json({
      message: "Jawaban berhasil disimpan.",
    });
  } catch (e) {
    next(e);
  }
};

export const handleSubmissionConfirmation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { det_id } = req.body;
    const checkSubmission = await checkSubmissionStatus(det_id);
    console.log(checkSubmission);
    if (checkSubmission.submit_at) {
      // Sebelumnya belum pernah disubmit (ngga ada submit_at)
      throw new ResponseError(400, "Subtest's already submitted");
    } else {
      const payload = {
        submit_at: new Date(),
        status: "Completed",
      };

      await countSubTest(det_id);
      await assessmentSubmission(det_id, payload);
      res.status(200).json({
        message: "Success!",
        test_id: checkSubmission.test_id,
      });
    }
  } catch (e) {
    next(e);
  }
};

export const countSubTest = async (detId: string) => {
  try {
    console.log(detId);
    const points = await getPointPerQuestion(detId);

    console.log(points);
    return points;
  } catch (err) {
    throw err;
  }
};

export const handleGetAssessmentTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token: any = await handleAssessmentToken(req.params.token);
    console.log(token);
    const progressHeadId = await getProgressHead(token.user_id, token.batch_id);

    const tests: any[] = await getAssessmentTest(progressHeadId.id);
    // tests will contain unique test entries (no duplicates based on test_id)

    const responseData = [];

    for (const test of tests) {
      const testStatus = await getTestStatus(progressHeadId.id, test.test_id);

      responseData.push({
        test_id: test.test_id,
        test_name: test.test_name,
        status: testStatus,
      });
    }

    res.status(200).send({
      message: "Success!",
      data: responseData,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetAssessmentSubTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token: any = await handleAssessmentToken(req.params.token);
    console.log(token);
    const progressHeadId = await getProgressHead(token.user_id, token.batch_id);
    console.log(progressHeadId);
    console.log(progressHeadId.id);
    console.log("keluar");
    const testId = req.params.id;
    console.log(testId);
    console.log("masuk");
    const assessmentSubtests = await getAssessmentSubTest(progressHeadId.id, testId);
    console.log(assessmentSubtests);

    res.status(200).send({
      message: "Success!",
      data: assessmentSubtests,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetAssessmentTermsPP = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("masuk");
    let data = { terms: "", pp: "" };
    let result = await getAssessmentTermsPP();
    result.forEach((row) => {
      if (row.id === TERMS_ID) {
        data.terms = row;
      }
      if (row.id === PP_ID) {
        data.pp = row;
      }
    });
    res.status(200).send({
      message: `Success!`,
      data: data,
    });
  } catch (error: any) {
    next(error);
  }
};

export const handleStoringLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenDecode: any = await handleAssessmentToken(req.params.token);
    console.log(tokenDecode);
    const subtestId = req.params.id;
    const payload = {
      id: uuid(),
      batch_id: tokenDecode.batch_id,
      subtest_id: subtestId,
      created_at: moment(),
      user_id: tokenDecode.user_id,
      log: req.body.log,
      log_code: req.body.log_code,
    };

    console.log(payload);
    await storeLog(payload);

    res.status(201).send({
      message: "Success!",
      data: payload,
    });
  } catch (e) {
    next(e);
  }
};

export const handleSubtestExampleisTaken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await getSubtestExampleisTaken(id);
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: (error as Error).message,
    });
  }
};

export const handleGetSubtestExampleData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await getSubtestExampleData(id);
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: (error as Error).message,
    });
  }
};

export const handleUpdateExampleTaken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await updateExampleTaken(id);
    if (result) {
      res.status(200).send({
        message: "Example Taken updated",
      });
    } else {
      throw new Error("Error");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const handleEntryAssesse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.params.token;
  } catch (e) {
    next(e);
  }
};
