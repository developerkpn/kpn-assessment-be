
import { Request, Response, NextFunction} from "express";
import {getBatchDetail} from "#dep/models/BatchModel";
import {
    createAssessmentProgressDetail, getAssessmentSubTest, getAssessmentTest,
    getBatchByAssessment,
    getProgressDetail,
    getProgressHead,
    getQuestionAssessment,
    getQuestionsBySeriesId,
    getSeriesBySubtestId,
    getSubtestIdbyProgressId, getTestStatus, storeAnswer,
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


export const handleGetAsssessmentQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const progressDetailId = req.params.id;
        const subtest = await getSubtestIdbyProgressId(progressDetailId);

        console.log(progressDetailId)
        console.log(subtest)
        // Get and randomize series
        const seriesList: any[] = await getSeriesBySubtestId(subtest.subtest_id);
        const choosenSeriesId = seriesList[Math.floor(Math.random() * seriesList.length)].series_id;

        console.log(seriesList)
        console.log(choosenSeriesId)
        // Get and randomize questions
        const questionList = await getQuestionsBySeriesId(choosenSeriesId);
        const shuffledQuestions = questionList.sort(() => Math.random() - 0.5);
        console.log(questionList)
        console.log(shuffledQuestions)

        // Get detailed question information
        const questions = await getQuestionAssessment(shuffledQuestions.map(q => q.question_id));
        console.log(questions);

        // Format response
        const response = {
            det_id: progressDetailId,
            duration: subtest.duration || "01:00:00", // Default 1 hour if not specified
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
                }
            }))
        };

        // Update assessment status
        const updatePayload = {
            taken_at: new Date(),
            status: "In Progress",
        };
        await updateAssessmentStart(progressDetailId, updatePayload);

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
            });
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