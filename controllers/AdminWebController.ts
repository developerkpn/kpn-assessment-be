import { validateOTP } from "@/helper/auth/OTP.js";
import { hashPassword } from "@/helper/auth/password.js";
import {
  createAdmin,
  createRole,
  deleteAdmin,
  getAdminById,
  getAllAdmin,
  getNewToken,
  getPermission,
  getPermission2,
  getRole,
  loginAdmin,
  reqResetPassword,
  resetPassword,
  updateAdmin,
  updateRole,
} from "@/models/AdminWebModel.js";
import { getDarwinUser } from "@/models/BatchModel.js";
import { Emailer } from "@/services/mail/Emailer.js";
import { User } from "@/types/AdminTypes.js";
import { NextFunction, Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
const { sign, verify } = jwt;
import { v4 as uuidv4 } from "uuid";
import { Validation } from "@/validation/Validation.js";
import { AdminWebValidation } from "@/validation/AdminWebValidation.js";
import { ResponseError } from "@/error/response-error.js";

export const handleLoginAdmin = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const validatedRequest = Validation.validate(AdminWebValidation.LOGIN, req.body);
    const { data, accessToken } = await loginAdmin(validatedRequest.username, validatedRequest.password);

    res.status(200).send({
      message: `Success sign in, welcome ${data.fullname}`,
      data: {
        fullname: data.fullname,
        username: data.username,
        email: data.email,
        user_id: data.id,
        role_id: data.role_id,
        bu_id: data.bu_id,
        permission: data.permission,
        access_token: accessToken,
      },
    });
  } catch (e) {
    next(e);
  }
};

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const authHeaders = req.headers.Authorization || req.headers.authorization;
  if (!authHeaders) {
    res.status(403).send({
      message: "Access Denied",
    });
  }

  const payload: User = {
    username: req.body.username,
    fullname: req.body.fullname,
    email: req.body.email,
    user_id: req.body.user_id,
    role_id: req.body.role_id,
    bu_id: req.body.bu_id,
  };

  try {
    const token = await getNewToken(payload);
    res.status(200).send({
      access_token: token,
    });
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      res.status(403).send({ message: "Refresh Token Expired. Logging out." });
    } else {
      next(error);
    }
  }
};

export const handleGetAllAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAllAdmin();
    res.status(200).send({
      message: `Success get admin accounts`,
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getRole();
    res.status(200).send({
      message: `Success get role`,
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetRoleById = async (req: Request, res: Response, next: NextFunction) => {
  const validatedId = Validation.validate(AdminWebValidation.ID, req.params.id);
  try {
    let result = await getPermission2(validatedId);

    const formattedResult = result.reduce((acc: any, role: any) => {
      const { role_name, fcreate, fread, fupdate, fdelete, menu_id, menu_name, role_id, ...rest } = role;

      const existingRole = acc.find((r: any) => r.role_id == role_id);
      if (existingRole) {
        existingRole.permission.push({ menu_name, menu_id, fcreate, fread, fupdate, fdelete, role_id });
      } else {
        acc.push({
          ...rest,
          role_name,
          role_id,
          permission: [{ menu_name, menu_id, fcreate, fread, fupdate, fdelete }],
        });
      }
      return acc;
    }, []);

    res.status(200).send({
      message: `Success get role ${result[0].role_name}`,
      data: formattedResult[0],
    });
  } catch (e) {
    next(e);
  }
};

export const handleCreateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    const data = req.body;

    const validatedRequest = Validation.validate(AdminWebValidation.CREATEADMIN, req.body);

    const hashed = await hashPassword(validatedRequest.password);
    const requestPayload = {
      id: uuidv4(),
      nik: validatedRequest.nik,
      fullname: validatedRequest.fullname,
      username: validatedRequest.username,
      email: validatedRequest.email,
      password: hashed,
      role_id: validatedRequest.role_id,
      bu_id: validatedRequest.bu_id,
      from_darwin: validatedRequest.from_darwin,
      is_active: validatedRequest.is_active,
      created_by: req.userDecode?.user_id,
      created_date: today,
    };

    let result = await createAdmin(requestPayload);

    const emailData = {
      fullname: data.fullname,
      username: data.username,
      password: validatedRequest.password,
      role: result.role,
    };

    const Email = new Emailer();
    await Email.newAccount(emailData, data.email);

    res.status(200).send({
      message: `Success create admin`,
      id: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleReqResetPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const validatedEmail = Validation.validate(AdminWebValidation.EMAIL, req.body.email);

    if (!validatedEmail) {
      throw new ResponseError(400, "Email is required");
    }

    await reqResetPassword(validatedEmail);

    res.status(200).send({
      message: "OTP sent, please check your email address",
    });
  } catch (e) {
    next(e);
  }
};

export const handleVerifyResetPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const email = req.body.email;
  const otpInput = req.body.otpInput;
  if (!email || !otpInput) {
    return res.status(400).send({
      message: "Bad Request",
    });
  }

  try {
    await validateOTP(otpInput, email);
    const sessionToken = sign({ email: email }, process.env.SECRETJWT as Secret, {
      expiresIn: "5m",
    });
    res.cookie("resetpwdSess", sessionToken, {
      httpOnly: true,
      sameSite: false,
      secure: true,
    });

    return res.status(200).send({
      message: "OTP Verified",
    });
  } catch (e) {
    next(e);
  }
};

export const handleResetPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const session = req.cookies.resetpwdSess;
    const newPass = req.body.newPass;
    const email = req.body.email;
    verify(session, process.env.SECRETJWT as Secret);
    await resetPassword(newPass, email);

    return res.status(200).send({
      message: "Password has reset",
    });
  } catch (error: any) {
    if (error?.name == "TokenExpiredError") {
      return res.status(403).send("Session Expired");
    } else if (error?.name == "JsonWebTokenError") {
      return res.status(403).send("Invalid Session");
    } else {
      return res.status(500).send(error.message);
    }
  }
};

export const handleGetAdminById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(AdminWebValidation.ID, req.params.id);
    const result = await getAdminById(validatedId);
    res.status(200).send({
      message: `Success get admin`,
      data: result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleGetPermission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let result = await getPermission();

    const formattedResult = result.reduce((acc: any, role: any) => {
      const { role_name, fcreate, fread, fupdate, fdelete, menu_id, menu_name, role_id, ...rest } = role;

      const existingRole = acc.find((r: any) => r.role_name === role_name);
      if (existingRole) {
        existingRole.permission.push({ menu_name, role_id, menu_id, fcreate, fread, fupdate, fdelete });
      } else {
        acc.push({
          ...rest,
          role_id,
          role_name,
          permission: [{ menu_name, menu_id, fcreate, fread, fupdate, fdelete }],
        });
      }
      return acc;
    }, []);

    res.status(200).send({
      message: `Success get role permission`,
      data: formattedResult,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleCreateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = uuidv4();
    const validatedRequest = Validation.validate(AdminWebValidation.CREATEROLE, req.body);

    const headerPayload = {
      id: id,
      role_name: validatedRequest.role_name,
      is_active: validatedRequest.is_active,
      created_by: req.userDecode?.user_id,
      created_date: new Date(),
    };

    const accessPayload = validatedRequest.permission.map((perm: any) => ({
      ...perm,
      role_id: id,
    }));

    const result = await createRole(headerPayload, accessPayload);

    res.status(200).send({
      message: `Success create role`,
      id: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleUpdateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(AdminWebValidation.ID, req.params.id);
    const validatedRequest = Validation.validate(AdminWebValidation.UPDATEROLE, req.body);
    const today = new Date();
    const updatedBy = req.userDecode!.user_id;

    const payload = {
      role_name: validatedRequest.role_name,
      updated_date: today,
      updated_by: updatedBy,
      is_active: validatedRequest.is_active,
    };

    const permPayload = validatedRequest.permission.map(({ menu_name, ...perm }: { menu_name: any }) => ({
      ...perm,
      role_id: validatedId,
      updated_date: today,
      updated_by: updatedBy,
    }));

    const result = await updateRole(validatedId, payload, permPayload);
    res.status(200).send({
      message: `Success update role`,
      id: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleUpdateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = req.params.id;
    const payload: any = {
      fullname: req.body.fullname,
      role_id: req.body.role_id,
      bu_id: req.body.bu_id,
    };
    if (req.body.password) {
      const hashed = await hashPassword(req.body.password);
      payload.password = hashed;
    }
    await updateAdmin(adminId, payload);
    res.status(200).send({
      message: "Success!",
    });
  } catch (e) {
    next(e);
  }
};

export const handleDeleteAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = req.params.id;

    await deleteAdmin(adminId);

    res.status(200).send({
      message: `Success!`,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetDataAdminFromDarwin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const result = await getDarwinUser(id);
    const response = {
      fullname: result?.full_name,
      email: result?.company_email_id,
      bu_id: result?.group_company,
      username: result?.company_email_id.split("@")[0],
    };
    res.status(200).send({
      data: response,
    });
  } catch (error) {
    next(error);
  }
};
