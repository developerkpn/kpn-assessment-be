import {
  handleGetBrief,
  handleGetTermsPP,
  handleUpdateBrief,
  handleUpdatePP,
  handleUpdateTerms,
} from "#dep/controllers/TermsPPController";
import { checkPermission } from "#dep/middleware/auth";
import { Router } from "express";
const TermsPP = Router();
export const ShortBrief = Router();

TermsPP.get("/", checkPermission("fread", 2), handleGetTermsPP);
TermsPP.patch("/terms", checkPermission("fupdate", 2), handleUpdateTerms);
TermsPP.patch("/pp", checkPermission("fupdate", 2), handleUpdatePP);
ShortBrief.get("/", checkPermission("fread", 3), handleGetBrief);
ShortBrief.patch("/", checkPermission("fupdate", 3), handleUpdateBrief);

export default TermsPP;
