import {
  handleCreateCriteria,
  handleDeleteCriteria,
  handleGetCriteria,
  handleGetCriteriaDetail,
  handleUpdateCriteria,
} from "#dep/controllers/CriteriaController";
import { checkPermission } from "#dep/middleware/auth";
import { Router } from "express";
const Criteria = Router();

Criteria.get("/", checkPermission("fread", 5), handleGetCriteria);
Criteria.post("/", checkPermission("fcreate", 5), handleCreateCriteria);
Criteria.patch("/:id", checkPermission("fupdate", 5), handleUpdateCriteria);
Criteria.delete("/:id", checkPermission("fdelete", 5), handleDeleteCriteria);

Criteria.get("/:id", checkPermission("fread", 5), handleGetCriteriaDetail);
export default Criteria;
