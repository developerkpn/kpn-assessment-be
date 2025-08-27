import {
  handleCreateBusinessUnit,
  handleDeleteBusinessUnit,
  handleGetBusinessUnit,
  handleUpdateBusinessUnit,
} from "@/controllers/BusinessUnitController.js";
import { checkPermission } from "@/middleware/auth.js";
import { Router } from "express";
const BusinessUnit = Router();

BusinessUnit.get("/", checkPermission("fread", [1, 15]), handleGetBusinessUnit);
BusinessUnit.post("/", checkPermission("fcreate", 1), handleCreateBusinessUnit);
BusinessUnit.patch("/:id", checkPermission("fupdate", 1), handleUpdateBusinessUnit);
BusinessUnit.delete("/:id", checkPermission("fdelete", 1), handleDeleteBusinessUnit);

export default BusinessUnit;
