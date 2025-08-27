import { Router } from "express";
import { checkPermission } from "@/middleware/auth.js";
import {
  handleCreateTest,
  handleDeleteSubTestFromTest,
  handleDeleteTest,
  handleGetAvailableSubTestForTest,
  handleGetTest,
  handleGetTestDetail,
  handleUpdateTest,
} from "@/controllers/TestController.js";
const Test = Router();

Test.post("/", checkPermission("fcreate", 14), handleCreateTest);
Test.get("/", checkPermission("fread", [14]), handleGetTest);
Test.delete("/:id", checkPermission("fdelete", 14), handleDeleteTest);
Test.patch("/:id", checkPermission("fupdate", 14), handleUpdateTest);
Test.get("/:id", checkPermission("fupdate", [14, 15]), handleGetTestDetail);
Test.get("/:id/subtest-available", checkPermission("fupdate", 14), handleGetAvailableSubTestForTest);
Test.delete("/:id/subtest/:detailId", checkPermission("fdelete", 14), handleDeleteSubTestFromTest);

export default Test;
