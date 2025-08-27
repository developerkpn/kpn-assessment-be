import { Router } from "express";
import { checkPermission } from "@/middleware/auth.js";
import {
  handleCreateGroupTest,
  handleDeleteGroupTest,
  handleDeleteSubTestFromGroupTest,
  handleGetAvailableSubTestForGroupTest,
  handleGetGroupTest,
  handleGetGroupTestDetail,
  handleUpdateGroupTest,
} from "@/controllers/GroupTestController.js";

const GroupTest = Router();

GroupTest.post("/", checkPermission("fcreate", 13), handleCreateGroupTest);
GroupTest.get("/", checkPermission("fread", [13, 15]), handleGetGroupTest);
GroupTest.delete("/:id", checkPermission("fread", 13), handleDeleteGroupTest);
GroupTest.patch("/:id", checkPermission("fupdate", 13), handleUpdateGroupTest);

GroupTest.get("/:id", checkPermission("fupdate", [13, 15]), handleGetGroupTestDetail);
GroupTest.get("/:id/tests-available", checkPermission("fread", [13, 15]), handleGetAvailableSubTestForGroupTest);
GroupTest.delete("/:id/tests/:detailId", checkPermission("fdelete", [13, 15]), handleDeleteSubTestFromGroupTest);

export default GroupTest;
