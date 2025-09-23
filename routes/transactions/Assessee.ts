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
  handleUploadProfilePhoto,
  handleGetProfilePhoto,
} from "@/controllers/transaction/AssesseeController.js";
import { isAuthAssessee } from "@/middleware/auth.js";
import { errorMiddleware } from "@/middleware/errorMiddleware.js";
import { uploadSingleImage } from "@/middleware/imageMiddleware.js";

const Assessee = Router();
Assessee.post("/registration", handleExternalRegistration);
Assessee.post("/login", handleExternalLogin);
Assessee.get("/dashboard", isAuthAssessee, handleGetAssignedBatch);
Assessee.get("/profile", isAuthAssessee, handleGetAssesseeInformation, errorMiddleware);
Assessee.get("/resettoken", handleResetToken);
Assessee.patch("/profile", isAuthAssessee, handleUpdateExternalAssesseeInformation);
Assessee.post("/upload-profile-photo", isAuthAssessee, uploadSingleImage, handleUploadProfilePhoto);
Assessee.get("/profile-photo/:userId", handleGetProfilePhoto);
Assessee.delete("/logout");
Assessee.get("/:token", handleAssesseeEntry);
Assessee.get("/isreg/:email", handleCheckExternUser);

export default Assessee;
