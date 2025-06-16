import { axiosDarwin, darwinAuth } from "@/config/axiosDarwin.js";
import { decoderDarwin } from "@/helper/auth/DarwinDecoder.js";
import { getDarwinUser } from "@/models/BatchModel.js";
import { isAxiosError } from "axios";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { refreshExpiry } from "@/constant";

const AuthController = {
  VerifyDarwinToken: async (req: Request<{ payload: string }>, res: Response) => {
    const { encoded_payload } = req.body;
    try {
      let firstname, email, decoded;
      const result = await decoderDarwin(encoded_payload);
      if (result !== null) {
        const { firstname: fname, email: em, token, ...rest } = result;
        firstname = fname;
        email = em;
        decoded = rest;
      } else {
        res.status(200).send({
          status: "failed",
        });
        return;
      }
      const data_user = await getDarwinUser(result.employee_no);
      let token_auth = jwt.sign(
        {
          user_id: result.employee_no,
          type: "internal",
        },
        process.env.SECRETJWT ?? "",
        {
          expiresIn: refreshExpiry,
        }
      );
      res.status(200).send({
        status: "success",
        token: token_auth,
        firstname,
        email,
        data_user: data_user,
      });
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error.response?.data.message);
        if (error.status === 401) {
          res.status(400).send({
            message: error.response?.data.message,
          });
        } else {
          res.status(500).send({
            message: error.response?.data.message,
          });
        }
      } else if (error instanceof Error) {
        console.error(error);
        res.status(500).send({
          message: error.message,
        });
      }
    }
  },
};

export default AuthController;
