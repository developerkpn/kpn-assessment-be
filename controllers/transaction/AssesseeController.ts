import { Request, Response, NextFunction } from "express";
import { handleAssessmentToken } from "#dep/controllers/transaction/AssessmentController";
import {
  checkRegisteredExternalAssessee,
  getAssesseeExternalProfile,
  getExternalDashboard,
  loginExternalAssessee,
  storeExternalAssesseeAccount,
  updateExternalAssessee,
} from "#dep/models/transactions/AssesseeModel";
import { hashPassword } from "#dep/helper/auth/password";
import { v7 as uuid } from "uuid";

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
    const hashedPassword = await hashPassword(req.body.password);
    const payload = {
      id: uuid(),
      email: req.body.email,
      name: req.body.name,
      password: hashedPassword,
      age: req.body.age,
      gender: req.body.gender,
      phone: req.body.phone,
      education: req.body.education,
      institution: req.body.institution,
    };
    console.log(payload);
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

export const handleGetExternalAssesseeInformation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.userDecode?.user_id);
    const profile = await getAssesseeExternalProfile(id);

    res.status(200).send({
      message: "Success!",
      data: profile,
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
      age: req.body.age,
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

export const handleExternalAssesseeLogout = async (req: Request, res: Response, next: NextFunction) => {
  try {
  } catch (e) {
    next(e);
  }
};
