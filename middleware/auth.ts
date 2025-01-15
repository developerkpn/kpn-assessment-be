import {Permission, TokenPayload} from "#dep/types/AdminTypes";
import { NextFunction, Request, Response } from "express";
import { Secret, verify } from "jsonwebtoken";
import {verifyPermission} from "#dep/models/AdminWebModel";

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
