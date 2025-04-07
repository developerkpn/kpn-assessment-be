import { Router } from "express";
import {
  handleGetAssesseeProfile,
  handleGetAssessmentsByUserId,
  handleGetAssessmentSubTest,
  handleGetAssessmentTermsPP,
  handleGetAssessmentTest,
  handleGetAsssessmentQuestion,
  handleGetBatchDetail,
  handleStoreAnswer,
  handleStoringLog,
  handleSubmissionConfirmation,
} from "#dep/controllers/transaction/AssessmentController";

const Assessment = Router();
Assessment.get("/assessee/:nik", handleGetAssessmentsByUserId);
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
Assessment.post("/:token/subtest/:id", handleStoringLog);
// Assessment.post("/video", handleVideoProctoring);
// Assessment.get("/")
// Assessment.get("/", );

// Assessment.get("/batch/:token", handleGetBatchDetail);
// Assessment.get("/test/:token", handleGetAssessmentTest);
// Assessment.get("/test/:token/:testId", handleGetAssessmentSubTest);
// Assessment.get("/test/subtest/:token/:testId, ", handleGetAsssessmentQuestion);
export default Assessment;
