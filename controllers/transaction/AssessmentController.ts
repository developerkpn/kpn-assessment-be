
import { Request, Response, NextFunction} from "express";
import {getBatchDetail} from "#dep/models/BatchModel";
import {
    checkSubTestIsTaken,
    createAssessmentProgressDetail, getAssessmentSubTest, getAssessmentTest,
    getBatchByAssessment,
    getProgressDetail,
    getProgressHead,
    getQuestionAssessment,
    getQuestionsBySeriesId,
    getSeriesBySubtestId,
    getSubtestIdbyProgressId, getTakenQuestions, getTestStatus, storeAnswer, storeTakenQuestions,
    updateAssessmentStart
} from "#dep/models/transactions/AssessmentModel";
import {Validation} from "#dep/validation/Validation";
import {getQuestion} from "#dep/models/QuestionModel";
import {v7 as uuid} from "uuid";
import {ResponseError} from "#dep/error/response-error";
import {getTestIdByGroupTestId} from "#dep/models/GroupTestModel";
import {Secret, verify} from "jsonwebtoken";
import {AssessmentToken} from "#dep/types/Transaction";
import {getSubTestIdByTestId, getTest} from "#dep/models/TestModel";
import {getSeriesDetail} from "#dep/models/SeriesModel";
import fs from "fs";
import path from "path";

const handleAssessmentToken = async (token: string) => {
    try {
        const tokenDecode = verify(token, process.env.SECRETJWT as Secret);
        return tokenDecode;
    } catch (e) {
        throw e;
    }
}
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
        console.log("test")
        console.log(progressDet)
        if (progressDet) {
            res.status(200).send({
                message: "Assessment progress already exists!",
                data: batch
            });
        } else {
            // Get all tests from group test
            const tests = await getTestIdByGroupTestId(batch.grouptest_id);
            console.log(batch.grouptest_id)
            console.log(tests)
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
                data: batch
            });
        }
    } catch (e) {
        next(e);
    }
};

const handleUntakenQuestions = async () => {

}

const handleTakenQuestions = async (req: Request, res: Response, next: NextFunction) => {

}

export const handleGetAsssessmentQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const progressDetailId = req.params.id;
        const subtest = await getSubtestIdbyProgressId(progressDetailId);


        console.log("Masuk hey")
        console.log(progressDetailId)
        console.log(subtest)

        // Cek apakah ada det_id pada t_store_answer
        const checkQuestionIsAlreadyTaken = await checkSubTestIsTaken(progressDetailId);
        console.log(checkQuestionIsAlreadyTaken)
        let response;
        // Kalo ada dia berarti udah pernah diambil
        if (checkQuestionIsAlreadyTaken) {
            console.log("Masuk hey 1")
            const takenQuestion: any = await getTakenQuestions(progressDetailId);
            console.log(takenQuestion);
            // [
            //     {
            //         id: '01958973-8ec1-7886-8816-f95c748fef68',
            //         det_id: '01953628-4eb9-7330-84cf-a02261b913ce',
            //         question_id: '3c8388e3-de9c-47f5-b371-e0f19a42fb6a',
            //         answer_a: false,
            //         answer_b: false,
            //         answer_c: false,
            //         answer_d: false,
            //         answer_e: false
            //     },
            //     {
            //         id: '01958973-8ec1-7886-8817-069627f9c1fe',
            //         det_id: '01953628-4eb9-7330-84cf-a02261b913ce',
            //         question_id: '3c8388e3-de9c-47f5-b371-e0f19a42fb6a',
            //         answer_a: false,
            //         answer_b: false,
            //         answer_c: false,
            //         answer_d: false,
            //         answer_e: false
            //     }
            // ]
            const questionIds = takenQuestion.map((q: any) => q.question_id);
            console.log(questionIds);
            const questions = await getQuestionAssessment(questionIds);
            console.log(questions);
            console.log(subtest)
            // Format response
            response = {
                det_id: progressDetailId,
                duration: subtest.subtest_duration? subtest.subtest_duration : "00:00:60",
                questions: questions.map((q: any) => {
                    // Cari taken question yang sesuai berdasarkan question_id
                    const taken = takenQuestion.find((t: any) => t.question_id === q.id);

                    return {
                        question_id: q.id,
                        input: {
                            text: q.q_input_text,
                            image_url: q.q_input_image_url
                        },
                        answer_type: q.answer_type,
                        choices: {
                            a: { text: q.answer_choice_a_text, image_url: q.answer_choice_a_image_url },
                            b: { text: q.answer_choice_b_text, image_url: q.answer_choice_b_image_url },
                            c: { text: q.answer_choice_c_text, image_url: q.answer_choice_c_image_url },
                            d: { text: q.answer_choice_d_text, image_url: q.answer_choice_d_image_url },
                            e: { text: q.answer_choice_e_text, image_url: q.answer_choice_e_image_url }
                        },
                        choosen_answer:
                            {
                                a: taken.answer_a,
                                b: taken.answer_b,
                                c: taken.answer_c,
                                d: taken.answer_d,
                                e: taken.answer_e
                            }
                    };
                })
            };
        } else {
            console.log("Masuk hey 2")
            // Get and randomize series
            const seriesList: any[] = await getSeriesBySubtestId(subtest.subtest_id);
            const choosenSeriesId = seriesList[Math.floor(Math.random() * seriesList.length)].series_id;

            console.log(seriesList)
            console.log(choosenSeriesId)
            // Get and randomize questions
            const questionList = await getQuestionsBySeriesId(choosenSeriesId);
            const shuffledQuestions = questionList.sort(() => Math.random() - 0.5);
            console.log(questionList)
            // [
            //     { question_id: 'bf58979f-e72e-47eb-adb7-cbecf1668792' },
            //     { question_id: 'bf58979f-e72e-47eb-adb7-cbecf1668792' },
            //     { question_id: 'bf58979f-e72e-47eb-adb7-cbecf1668792' },
            //     { question_id: '032bd1b3-f1b6-4136-ba3e-1676478580b8' },
            //     { question_id: 'a83e564e-fae2-47c5-96d4-b01ee40eb647' }
            // ]
            console.log(shuffledQuestions)

            // Get detailed question information
            const questions = await getQuestionAssessment(shuffledQuestions.map(q => q.question_id));
            console.log(questions);

            const storeQuestion = questionList.map((question: any) => ({
                ...question,
                id: uuid(), // id baru dengan UUID
                det_id: progressDetailId
            }));
            console.log(questionList)
            console.log("store the question");
            console.log(storeQuestion);
            await storeTakenQuestions(storeQuestion);

            // Format response
            response = {
                det_id: progressDetailId,
                duration: subtest.duration, // Default 1 hour if not specified
                questions: questions.map((q: any) => ({
                    question_id: q.id,
                    input: {
                        text: q.q_input_text,
                        image_url: q.q_input_image_url
                    },
                    answer_type: q.answer_type,
                    choices: {
                        a: { text: q.answer_choice_a_text, image_url: q.answer_choice_a_image_url },
                        b: { text: q.answer_choice_b_text, image_url: q.answer_choice_b_image_url },
                        c: { text: q.answer_choice_c_text, image_url: q.answer_choice_c_image_url },
                        d: { text: q.answer_choice_d_text, image_url: q.answer_choice_d_image_url },
                        e: { text: q.answer_choice_e_text, image_url: q.answer_choice_e_image_url }
                    },
                    choosen_answer: {
                        a: false,
                        b: false,
                        c: false,
                        d: false,
                        e: false
                    }
                }))
            };

            // Update assessment status
            const updatePayload = {
                taken_at: new Date(),
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
            data: response
        });
    } catch (e) {
        next(e);
    }
};

export const handleStoreAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, questions } = req.body; // Get questions array from request body

        // Array to store all answer records to be inserted
        const answerRecords: any = [];

        // Process each question's answers
        questions.forEach((questionItem: any) => {
            const { question_id, answers } = questionItem;

            // Handle each answer for this question
            answers.forEach((answerItem: any) => {
                answerRecords.push({
                    id: uuid(), // Generate unique ID for each answer record
                    det_id: id, // Use the ID from request params
                    question_id: question_id,
                    answer: answerItem.answer
                });
           0 });
        });

        // Store each answer record separately
        for (const payload of answerRecords) {
            console.log(payload)
            await storeAnswer(payload);
        }

        res.status(200).send({
            message: "Answers stored successfully!"
        });
    } catch (e) {
        next(e);
    }
};

export const handleStoringAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const answer = req.body;

        // Cek tipenya apa
        //
    } catch (e) {
        next(e);
    }
}

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
                status: testStatus
            });
        }

        res.status(200).send({
            message: "Success!",
            data: responseData
        });
    } catch (e) {
        next(e);
    }
}

export const handleGetAssessmentSubTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token: any = await handleAssessmentToken(req.params.token);
        console.log(token);
        const progressHeadId = await getProgressHead(token.user_id, token.batch_id);
        console.log(progressHeadId);
        console.log(progressHeadId.id);
        console.log("keluar")
        const testId = req.params.id;
        console.log(testId);
        console.log("masuk")
        const assessmentSubtests = await getAssessmentSubTest(progressHeadId.id, testId);
        console.log(assessmentSubtests);

        res.status(200).send({
            message: "Success!",
            data: assessmentSubtests
        })
    } catch (e) {
        next(e);
    }
}

export const handleVideoProctoring = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Pastikan direktori uploads ada
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate nama file unik
        const fileName = `${Date.now()}.mp4`;
        const filePath = path.join(uploadDir, fileName);
        const writeStream = fs.createWriteStream(filePath);

        // Tangani upload
        req.pipe(writeStream);

        // Tangani selesainya upload
        writeStream.on('finish', () => {
            res.status(200).json({
                message: 'Video uploaded successfully',
                path: `/uploads/${fileName}` // Path relatif untuk akses file
            });
        });

        // Tangani error pada stream
        writeStream.on('error', (err) => {
            fs.unlinkSync(filePath); // Hapus file gagal
            next(err);
        });

        // Tangani error pada request
        req.on('error', (err) => {
            fs.unlinkSync(filePath); // Hapus file gagal
            next(err);
        });

    } catch (error) {
        next(error);
    }
}