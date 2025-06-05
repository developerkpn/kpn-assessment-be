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
} from "@/controllers/transaction/AssesseeController.js";
import { isAuth } from "@/middleware/auth.js";

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
