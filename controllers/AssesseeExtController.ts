import AssesseeExt from "@/models/AssesseeExtModel.js";
import { NextFunction, Request, Response } from "express";

const AssesseeExtController = {
  getAllDataAssessee: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id } = req.query;
      const result = await AssesseeExt.GetAllDataAssesseeExt(user_id as string);
      res.status(200).send({
        data: result,
      });
      return;
    } catch (error) {
      next(error);
    }
  },
  getUserById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await AssesseeExt.GetAssesseeExtbyID(id);
      res.status(200).send({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  updateNIKAssessee: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nik, user_id } = req.body;
      const result = await AssesseeExt.UpdateNIKAssesseeExt(user_id, nik);
      res.status(200).send({
        message: `Data assessee successfully updated`,
      });
    } catch (error) {
      next(error);
    }
  },
  sendEmailResetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = req.userDecode;
      const { user_id } = req.body;
      const result = await AssesseeExt.EmailResetPassword(user_id, session?.user_id ?? "");
      res.status(200).send({
        message: `Email reset password external assessee ${result} has successfully sent`,
      });
      return;
    } catch (error) {
      next(error);
    }
  },
  verifyTokenReset: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const decodedToken = req?.decodeResetToken;
      res.status(200).send({
        data: decodedToken,
      });
    } catch (error) {
      next(error);
    }
  },
  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const decodedtoken = req?.decodeResetToken;
      if (!decodedtoken || !decodedtoken?.user_id) {
        throw new Error("Forbidden");
      }
      const payload = req.body as { password: string };
      const result = await AssesseeExt.SetNewPassword(payload.password, decodedtoken?.user_id);
      res.status(200).send({
        message: "Successfully reset password",
      });
      return;
    } catch (error) {
      next(error);
    }
  },
};

export default AssesseeExtController;
