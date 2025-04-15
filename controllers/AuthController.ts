import { axiosDarwin, darwinAuth } from "#dep/config/axiosDarwin";
import { decoderDarwin } from "#dep/helper/auth/DarwinDecoder";
import { getDarwinUser } from "#dep/models/BatchModel";
import { isAxiosError } from "axios";
import { Request, Response } from "express";

const AuthController = {
  VerifyDarwinToken: async (req: Request<{ payload: string }>, res: Response) => {
    const { encoded_payload, token_client, emp_id } = req.body;
    let token_auth = token_client;
    let firstname, email, rest_var, decoded;

    try {
      if (encoded_payload) {
        const result = await decoderDarwin(encoded_payload);
        if (result !== null) {
          const { firstname: fname, email: em, token, ...rest } = result;
          firstname = fname;
          email = em;
          token_auth = token;
          decoded = rest;
        } else {
          throw new Error("token encoded invalid");
        }
      }
      const { data } = await darwinAuth.post(`/checkToken`, {
        api_key: process.env.APICHCKTOK,
        token: token_auth,
      });
      const data_user = await getDarwinUser(emp_id ?? (decoded ? decoded.employee_no : ""));
      rest_var = data_user;
      res.status(200).send({
        ...data,
        token: token_auth,
        firstname,
        email,
        ...rest_var,
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
