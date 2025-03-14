import { Router } from "express";
import {
  handleGetAssessmentSubTest,
  handleGetAssessmentTest,
  handleGetAsssessmentQuestion,
  handleGetBatchDetail,
  handleStoreAnswer,
  handleVideoProctoring,
} from "#dep/controllers/transaction/AssessmentController";
import { handleGetQuestion } from "#dep/controllers/QuestionController";

const Assessment = Router();

Assessment.get("/:token/batch", handleGetBatchDetail);
// Assessment.get("/:token", handleStartProgress);
Assessment.get("/:token/test", handleGetAssessmentTest);
// Assessment.get("/test/:testId/subtest");
Assessment.get("/:token/test/subtest/:id", handleGetAsssessmentQuestion);
Assessment.get("/:token/test/:id", handleGetAssessmentSubTest);
// Assessment.post("/test/:testId/subtest/:subtestId/start");
Assessment.post("/:token/subtest/submission", handleStoreAnswer);
Assessment.post("/video", handleVideoProctoring);
// Assessment.get("/")
// Assessment.get("/", );

export default Assessment;
