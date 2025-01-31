import { validateOTP } from "#dep/helper/auth/OTP";
import { hashPassword } from "#dep/helper/auth/password";
import {
  createAdmin,
  createRole,
  getAdminById,
  getAllAdmin,
  getNewToken,
  getPermission,
  getRole,
  loginAdmin,
  reqResetPassword,
  resetPassword,
  updateRole,
} from "#dep/models/AdminWebModel";
import { Emailer } from "#dep/services/mail/Emailer";
import { User } from "#dep/types/AdminTypes";
import {NextFunction, Request, Response} from "express";
import { Secret, sign, verify } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import {Validation} from "#dep/validation/Validation";
import {AdminWebValidation} from "#dep/validation/AdminWebValidation";

export const handleLoginAdmin = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const payload = {
      emailOrUname: req.body.username,
      password: req.body.password
    }
    const validatedRequest = Validation.validate(AdminWebValidation.LOGIN, payload);
    const { data, accessToken } = await loginAdmin(validatedRequest.emailOrUname, validatedRequest.password);
    return res.status(200).send({
      message: `Success sign in, welcome ${data.fullname}`,
      data: {
        fullname: data.fullname,
        username: data.username,
        email: data.email,
        user_id: data.id,
        role_id: data.role_id,
        permission: data.permission,
        access_token: accessToken,
      },
    });
  } catch (e) {
    next(e);
  }
};

export const refreshAccessToken = async (req: Request, res: Response): Promise<any> => {
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
  };

  try {
    const token = await getNewToken(payload);
    return res.status(200).send({
      access_token: token,
    });
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(403).send({ message: "Refresh Token Expired. Logging out." });
    }
    return res.status(500).send({
      message: error.message,
    });
  }
};

export const handleGetAllAdmin = async (_req: Request, res: Response) => {
  try {
    const result = await getAllAdmin();
    res.status(200).send({
      message: `Success get admin accounts`,
      data: result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleGetRole = async (_req: Request, res: Response) => {
  try {
    const result = await getRole();
    res.status(200).send({
      message: `Success get role`,
      data: result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleGetRoleById = async (req: Request, res: Response) => {
  const validatedId = Validation.validate(AdminWebValidation.ID, req.params.id);
  try {
    let result = await getPermission(validatedId);

    const formattedResult = result.reduce((acc, role) => {
      const { role_name, fcreate, fread, fupdate, fdelete, menu_id, menu_name, ...rest } = role;

      const existingRole = acc.find((r: any) => r.role_name === role_name);
      if (existingRole) {
        existingRole.permission.push({ menu_name, menu_id, fcreate, fread, fupdate, fdelete });
      } else {
        acc.push({
          ...rest,
          role_name,
          permission: [{ menu_name, menu_id, fcreate, fread, fupdate, fdelete }],
        });
      }
      return acc;
    }, []);

    res.status(200).send({
      message: `Success get role ${result[0].role_name}`,
      data: formattedResult[0],
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleCreateAdmin = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const data = req.body;
    const password =
        (process.env.DEFAULT_PASS as string) + Math.floor(1000 + Math.random() * 9000).toString();
    const hashed = await hashPassword(password);

    const validatedRequest = Validation.validate(AdminWebValidation.CREATEADMIN, req.body);

    const requestPayload = {
      id: uuidv4(),
      fullname: validatedRequest.fullname,
      username: validatedRequest.username,
      email: validatedRequest.email,
      password: hashed,
      role_id: validatedRequest.role_id,
      is_active: validatedRequest.is_active,
      created_by: req.userDecode?.user_id,
      created_date: today,
    };

    let result = await createAdmin(requestPayload);

    const emailData = {
      fullname: data.fullname,
      username: data.username,
      password: password,
      role: result.role,
    };

    const Email = new Emailer();
    await Email.newAccount(emailData, data.email);

    res.status(200).send({
      message: `Success create admin`,
      id: result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleReqResetPassword = async (req: Request, res: Response): Promise<any> => {
  const validatedEmail = Validation.validate(AdminWebValidation.EMAIL, req.body.email);
  if (!validatedEmail) {
    return res.status(400).send({
      message: "Email is required",
    });
  }

  try {
    await reqResetPassword(validatedEmail);

    return res.status(200).send({
      message: "OTP sent, please check your email address",
    });

  } catch (error: any) {
    console.log(error);
    return res.status(500).send({
      message: error.message,
    });
  }
};

export const handleVerifyResetPassword = async (req: Request, res: Response): Promise<any> => {
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
  } catch (error: any) {
    console.error(error);
    return res.status(500).send({
      message: error.message,
    });
  }
};

export const handleResetPassword = async (req: Request, res: Response): Promise<any> => {
  const session = req.cookies.resetpwdSess;
  const newPass = req.body.newPass;
  const email = req.body.email;

  try {
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

export const handleGetAdminById = async (req: Request, res: Response) => {
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

export const handleGetPermission = async (_req: Request, res: Response) => {
  try {
    let result = await getPermission();

    const formattedResult = result.reduce((acc, role) => {
      const { role_name, fcreate, fread, fupdate, fdelete, menu_id, menu_name, ...rest } = role;

      const existingRole = acc.find((r: any) => r.role_name === role_name);
      if (existingRole) {
        existingRole.permission.push({ menu_name, menu_id, fcreate, fread, fupdate, fdelete });
      } else {
        acc.push({
          ...rest,
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

export const handleCreateRole = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleUpdateRole = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};
