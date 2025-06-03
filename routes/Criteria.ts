import {
  handleCreateCriteria,
  handleDeleteCriteria,
  handleGetCriteria,
  handleGetCriteriaColor,
  handleGetCriteriaDetail,
  handleUpdateCriteria,
} from "@/controllers/CriteriaController.js";
import { checkPermission } from "@/middleware/auth.js";
import { Router } from "express";
const Criteria = Router();

Criteria.get("/", checkPermission("fread", 5), handleGetCriteria);
Criteria.post("/", checkPermission("fcreate", 5), handleCreateCriteria);
Criteria.get("/color", checkPermission("fread", 5), handleGetCriteriaColor);
Criteria.patch("/:id", checkPermission("fupdate", 5), handleUpdateCriteria);
Criteria.delete("/:id", checkPermission("fdelete", 5), handleDeleteCriteria);

Criteria.get("/:id", checkPermission("fread", 5), handleGetCriteriaDetail);
export default Criteria;
