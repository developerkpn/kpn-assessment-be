import AuthController from "@/controllers/AuthController.js";
import { Router } from "express";
const Auth = Router();

Auth.post("/darwin", AuthController.VerifyDarwinToken);

export default Auth;
