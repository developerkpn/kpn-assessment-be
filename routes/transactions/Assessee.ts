import { Router } from "express";
import {
  handleAssesseeEntry,
  handleCheckExternUser,
  handleExternalLogin,
  handleExternalRegistration,
  handleGetAssignedBatch,
  handleGetExternalAssesseeInformation,
  handleResetToken,
  handleUpdateExternalAssesseeInformation,
} from "#dep/controllers/transaction/AssesseeController";
import { isAuth } from "#dep/middleware/auth";

const Assessee = Router();
Assessee.post("/registration", handleExternalRegistration);
Assessee.post("/login", handleExternalLogin);
Assessee.get("/dashboard", isAuth, handleGetAssignedBatch);
Assessee.get("/profile", isAuth, handleGetExternalAssesseeInformation);
Assessee.get("/resettoken", handleResetToken);
Assessee.patch("/profile", isAuth, handleUpdateExternalAssesseeInformation);
Assessee.delete("/logout");
Assessee.get("/:token", handleAssesseeEntry);
Assessee.get("/isreg/:email", handleCheckExternUser);

export default Assessee;
