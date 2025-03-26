import { Router } from "express";
import {
  handleGetAssesseeProfile,
  handleGetAssessmentSubTest,
  handleGetAssessmentTermsPP,
  handleGetAssessmentTest,
  handleGetAsssessmentQuestion,
  handleGetBatchDetail,
  handleStoreAnswer,
  handleSubmissionConfirmation,
} from "#dep/controllers/transaction/AssessmentController";
import { handleGetQuestion } from "#dep/controllers/QuestionController";

const Assessment = Router();

Assessment.put("/subtest/submission", handleSubmissionConfirmation);
Assessment.get("/:token/profile", handleGetAssesseeProfile);
Assessment.get("/:token/termspp", handleGetAssessmentTermsPP);
Assessment.get("/:token/batch", handleGetBatchDetail);
// Assessment.get("/:token", handleStartProgress);
Assessment.get("/:token/test", handleGetAssessmentTest);
// Assessment.get("/test/:testId/subtest");
Assessment.get("/:token/test/subtest/:id", handleGetAsssessmentQuestion);
Assessment.get("/:token/test/:id", handleGetAssessmentSubTest);
// Assessment.post("/test/:testId/subtest/:subtestId/start");
Assessment.post("/:token/subtest/submission", handleStoreAnswer);
// Assessment.post("/video", handleVideoProctoring);
// Assessment.get("/")
// Assessment.get("/", );

// Assessment.get("/batch/:token", handleGetBatchDetail);
// Assessment.get("/test/:token", handleGetAssessmentTest);
// Assessment.get("/test/:token/:testId", handleGetAssessmentSubTest);
// Assessment.get("/test/subtest/:token/:testId, ", handleGetAsssessmentQuestion);
export default Assessment;
