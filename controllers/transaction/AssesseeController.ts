import { Request, Response, NextFunction } from "express";
import { handleAssessmentToken } from "@/controllers/transaction/AssessmentController.js";
import {
  checkRegisteredExternalAssessee,
  getAssesseeExternalbyEmail,
  getAssesseeExternalProfile,
  getAssesseeInternal,
  getExternalDashboard,
  loginExternalAssessee,
  storeExternalAssesseeAccount,
  updateExternalAssessee,
} from "@/models/transactions/AssesseeModel.js";
import { hashPassword } from "@/helper/auth/password.js";
import { v7 as uuid } from "uuid";
import { ClientAction } from "@/helper/queryBuilder.js";
import { ResponseError } from "@/error/response-error.js";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
const { verify, sign, decode } = jwt;
import { accessExpiry } from "@/constant.js";

export const handleAssesseeEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("assessee");
    const tokenInformation: any = await handleAssessmentToken(req.params.token);

    console.log("keluar");
    console.log(tokenInformation);
    if (tokenInformation.type === "Internal" || tokenInformation.type === "internal") {
      res.status(200).send({
        message: "Success!",
        type: "internal",
      });
    } else {
      const externalAssesseeInformation = await checkRegisteredExternalAssessee(tokenInformation.email);
      console.log("halo 1");
      console.log(externalAssesseeInformation);
      const isRegistered = externalAssesseeInformation.length > 0 ? true : false;
      console.log(isRegistered);
      res.status(200).send({
        message: "Success!",
        type: "external",
        email: tokenInformation.email,
        is_registered: isRegistered,
      });
    }
  } catch (e) {
    throw e;
  }
};

export const handleExternalRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const registration = req.body;
    const hashedPassword = await hashPassword(req.body.new_password);
    const payload = {
      email: req.body.email,
      name: req.body.name,
      password: hashedPassword,
      age: req.body.age ?? null,
      gender: req.body.gender ?? null,
      phone: req.body.phone ?? null,
      education: req.body.education ?? null,
      institution: req.body.institution ?? null,
    };

    const result = await storeExternalAssesseeAccount(payload);
    res.status(201).send({
      message: "Success!",
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleExternalLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const { accessToken } = await loginExternalAssessee(email, password);

    res.status(200).send({
      message: "Success!",
      data: {
        access_token: accessToken,
      },
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetAssesseeInformation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.userDecode?.user_id as string;
    const type = req.userDecode?.type as string;
    let profile: any;

    if (type == "external") {
      profile = await getAssesseeExternalProfile(id);
    } else {
      profile = await getAssesseeInternal(id);
    }

    res.status(200).send({
      message: "Success!",
      data: { ...profile, user_id: id },
      type: type,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetAssignedBatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = String(req.userDecode?.email);
    const dashboard = await getExternalDashboard(email);
    console.log(dashboard);
    res.status(200).send({
      message: "Success!",
      data: dashboard,
    });
  } catch (e) {
    next(e);
  }
};

export const handleUpdateExternalAssesseeInformation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.userDecode?.user_id);
    const payload = {
      name: req.body.name,
      date_of_birth: req.body.date_of_birth,
      gender: req.body.gender,
      phone: req.body.phone,
      education: req.body.education,
      institution: req.body.institution,
    };
    console.log(payload);
    await updateExternalAssessee(id, payload);

    res.status(200).send({
      message: "Success!",
    });
  } catch (e) {
    next(e);
  }
};

export const handleCheckExternUser = async (
  req: Request<{ email: string }, {}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.params;
    const result = await getAssesseeExternalbyEmail(email);
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const handleResetToken = async (req: Request, res: Response, next: NextFunction) => {
  return await ClientAction(async (client) => {
    if (!req.headers.authorization) {
      throw new ResponseError(403, "Forbidden");
    }
    const token_auth = req.headers.authorization.split(" ")[2];
    const decoded_token = decode(token_auth, { complete: true });
    const user_data = decoded_token?.payload as JwtPayload;
    const user_id = user_data?.user_id;
    if (!user_id) {
      throw new ResponseError(403, "Forbidden");
    }

    try {
      const { rows: check_res_token } = await client.query(
        `select refresh_token, user_id, email from mst_user_extern where user_id = $1`,
        [user_id]
      );
      const ref_token = check_res_token[0].refresh_token;
      if (!ref_token) {
        throw new ResponseError(403, "Forbidden");
      }
      const verif_token = verify(ref_token, process.env.SECRETJWT as Secret);
      const new_access_tok = sign(
        {
          user_id: check_res_token[0].user_id,
          email: check_res_token[0].email,
        },
        process.env.SECRETJWT as Secret,
        {
          expiresIn: accessExpiry,
        }
      );
      res.status(200).send({
        access_token: new_access_tok,
      });
    } catch (error) {
      next(error);
    }
  });
};

export const handleExternalAssesseeLogout = async (req: Request, res: Response, next: NextFunction) => {
  try {
  } catch (e) {
    next(e);
  }
};
