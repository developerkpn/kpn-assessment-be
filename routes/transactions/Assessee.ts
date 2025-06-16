import { Router } from "express";
import {
  handleAssesseeEntry,
  handleCheckExternUser,
  handleExternalLogin,
  handleExternalRegistration,
  handleGetAssignedBatch,
  handleGetAssesseeInformation,
  handleResetToken,
  handleUpdateExternalAssesseeInformation,
} from "@/controllers/transaction/AssesseeController.js";
import { isAuthAssessee } from "@/middleware/auth.js";

const Assessee = Router();
Assessee.post("/registration", handleExternalRegistration);
Assessee.post("/login", handleExternalLogin);
Assessee.get("/dashboard", isAuthAssessee, handleGetAssignedBatch);
Assessee.get("/profile", isAuthAssessee, handleGetAssesseeInformation);
Assessee.get("/resettoken", handleResetToken);
Assessee.patch("/profile", isAuthAssessee, handleUpdateExternalAssesseeInformation);
Assessee.delete("/logout");
Assessee.get("/:token", handleAssesseeEntry);
Assessee.get("/isreg/:email", handleCheckExternUser);

export default Assessee;
