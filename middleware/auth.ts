import { Permission, TokenAssesseePayload, TokenPayload } from "@/types/AdminTypes.js";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
const { decode, verify } = jwt;
import { verifyPermission } from "@/models/AdminWebModel.js";
import AuthModel from "@/models/AuthModel.js";
import { getAssesseeExternalProfile } from "@/models/transactions/AssesseeModel.js";
import AssesseeExt from "@/models/AssesseeExtModel.js";

export const isAuth = (req: Request, res: Response, next: NextFunction): any => {
  const authHeaders = req.headers.Authorization || req.headers.authorization;
  let token = "";
  if (authHeaders) token = (authHeaders as string).split(" ")[1];
  if (!authHeaders) {
    return res.status(403).send({
      message: "Access Denied",
    });
  }

  try {
    const userDecode = verify(token, process.env.SECRETJWT as Secret);
    req.userDecode = userDecode as TokenPayload;
    return next();
  } catch (error: any) {
    console.error(error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).send({
        message: error.message,
      });
    } else {
      return res.status(500).send({
        message: error.stack,
      });
    }
  }
};

export const isAuthAssessee = (req: Request, res: Response, next: NextFunction): any => {
  const authHeaders = req.headers.Authorization || req.headers.authorization;
  let token = "";
  if (authHeaders) token = (authHeaders as string).split(" ")[1];
  if (!authHeaders) {
    return res.status(403).send({
      message: "Access Denied",
    });
  }

  try {
    const userDecode = verify(token, process.env.SECRETJWT as Secret);
    req.userDecode = userDecode as TokenAssesseePayload;
    return next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).send({
        message: error.message,
      });
    } else {
      return res.status(403).send({
        message: error.stack,
      });
    }
  }
};

export const isAuthDarwin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeaders = req.headers.authorization;
    if (!authHeaders) {
      res.status(403).send({
        message: "Forbidden",
      });
      return;
    }
    let token = authHeaders.split(" ")[1];
    if (!token) {
      res.status(403).send({
        message: "Forbidden",
      });
      return;
    }
    const decode_token = decode(token, { complete: true }) as JwtPayload;
    req.user_type = "internal";
    if (decode_token) {
      const user_extern = await getAssesseeExternalProfile(decode_token.payload.user_id);
      if (user_extern) {
        req.user_type = "external";
        req.userDecode = {
          user_id: decode_token.payload.user_id,
        };
      }
    } else {
      await AuthModel.CheckTokenDarwin(token);
    }
    next();
  } catch (error) {
    console.error(error);
    if ((error as Error).message == "Forbidden") {
      res.status(403).send({
        message: (error as Error).message,
      });
      return;
    }
    res.status(500).send({
      message: (error as Error).message,
    });
    return;
  }
};

export const checkPermission =
  (action: "fcreate" | "fread" | "fupdate" | "fdelete", menuId: number | number[]) =>
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.userDecode) {
        throw new Error("Unauthorized");
      }
      const getPermission = await verifyPermission(req.userDecode?.role_id, menuId);

      let verifiedPermission: Permission = {
        menu_id: 0,
        fcreate: false,
        fread: false,
        fupdate: false,
        fdelete: false,
      };

      for (const perm of getPermission) {
        verifiedPermission = {
          menu_id: perm.menu_id,
          fcreate: verifiedPermission.fcreate || perm.fcreate,
          fread: verifiedPermission.fread || perm.fread,
          fupdate: verifiedPermission.fupdate || perm.fupdate,
          fdelete: verifiedPermission.fdelete || perm.fdelete,
        };
      }

      if (!verifiedPermission) {
        throw new Error("Permission not provided or mismatched");
      }

      if (verifiedPermission[action]) {
        req.userDecode.role_name = getPermission[0].role_name;
        return next();
      }

      return res.status(403).send({ message: "Forbidden" });
    } catch (error: any) {
      console.error("Error in checkPermission middleware:", error.message);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  };

export const verifyTokenResetPass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeaders = req.headers.authorization;
    console.log(authHeaders);
    if (!authHeaders) {
      res.status(403).send({
        message: "Forbidden",
      });
      return;
    }
    let token = authHeaders.split(" ")[1];
    if (!token) {
      res.status(403).send({
        message: "Forbidden",
      });
      return;
    }
    const verifToken = await AssesseeExt.VerifyToken(token);
    if (!verifToken.status) {
      res.status(403).send({
        message: "Token Expired ",
      });
      return;
    }
    req.decodeResetToken = {
      user_id: verifToken.user_id,
      email: verifToken.email,
      name: verifToken.name,
    };
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: (error as Error).message,
    });
  }
};
