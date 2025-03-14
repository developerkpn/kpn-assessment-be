import { axiosDarwin } from "#dep/config/axiosDarwin";
import { decoderDarwin } from "#dep/helper/auth/DarwinDecoder";
import { isAxiosError } from "axios";
import { Request, Response } from "express";

const AuthController = {
  VerifyDarwinToken: async (req: Request<{ payload: string }>, res: Response) => {
    const { encoded_payload, token_client } = req.body;
    let token_auth = token_client;
    let firstname, email;
    if (encoded_payload) {
      const { firstname: fname, email: em, token } = decoderDarwin(encoded_payload);
      firstname = fname;
      email = em;
      token_auth = token;
    }

    try {
      console.log(token_auth);
      const { data } = await axiosDarwin.post(
        `/checkToken`,
        {
          api_key: process.env.APICHCKTOK,
          token: token_auth,
        },
        {
          auth: {
            username: process.env.DARWINUSER ?? "",
            password: process.env.DARWINPASS ?? "",
          },
        }
      );
      res.status(200).send({
        ...data,
        token: token_auth,
        firstname,
        email,
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
