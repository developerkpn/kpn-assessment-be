import { Permission, TokenAssesseePayload, TokenPayload } from "@/types/AdminTypes.js";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
const { decode, verify } = jwt;
import { verifyPermission } from "@/models/AdminWebModel.js";
import AuthModel from "@/models/AuthModel.js";
import { getAssesseeExternalProfile } from "@/models/transactions/AssesseeModel.js";

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
  (action: "fcreate" | "fread" | "fupdate" | "fdelete", menuId: number) =>
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const getPermission = await verifyPermission(req.userDecode?.role_id, menuId);

      const verifiedPermission: Permission = {
        menu_id: getPermission.menu_id,
        fcreate: getPermission.fcreate,
        fread: getPermission.fread,
        fupdate: getPermission.fupdate,
        fdelete: getPermission.fdelete,
      };

      if (!verifiedPermission) {
        throw new Error("Permission not provided or mismatched");
      }

      if (verifiedPermission[action]) {
        return next();
      }

      return res.status(403).send({ message: "Forbidden" });
    } catch (error: any) {
      console.error("Error in checkPermission middleware:", error.message);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  };
