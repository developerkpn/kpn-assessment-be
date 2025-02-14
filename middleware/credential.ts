import allowedOrigin from "#dep/config/allowedOrigins";
import { Request, Response, NextFunction } from "express";

export default function credentials(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const origin = req.headers.origin;
  if (origin && allowedOrigin.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", "true");
  }
  next();
}
