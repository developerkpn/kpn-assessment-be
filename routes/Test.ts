import { Router } from "express";
import {checkPermission} from "#dep/middleware/auth";
import {
    handleCreateTest, handleDeleteSubTestFromTest,
    handleDeleteTest, handleGetAvailableSubTestForTest,
    handleGetTest,
    handleGetTestDetail,
    handleUpdateTest
} from "#dep/controllers/Test";
const Test = Router();

Test.post("/", checkPermission("fcreate", 14), handleCreateTest);
Test.get("/", checkPermission("fread", 14), handleGetTest);
Test.delete("/:id", checkPermission("fread", 14), handleDeleteTest);
Test.patch("/:id", checkPermission("fupdate", 14), handleUpdateTest);
Test.get("/:id", checkPermission("fupdate", 14), handleGetTestDetail);
Test.get("/:id/subtest-available", checkPermission("fupdate", 14), handleGetAvailableSubTestForTest);
Test.delete("/:id/subtest/:detailId", checkPermission("fdelete", 14), handleDeleteSubTestFromTest);

export default Test;
