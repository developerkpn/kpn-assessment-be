import { Router } from "express";
import {checkPermission} from "#dep/middleware/auth";
import {
    handleCreateGroupTest,
    handleDeleteGroupTest, handleDeleteSubTestFromGroupTest, handleGetAvailableSubTestForGroupTest,
    handleGetGroupTest, handleGetGroupTestDetail,
    handleUpdateGroupTest
} from "#dep/controllers/GroupTestController";

const GroupTest = Router();

GroupTest.post("/", checkPermission("fcreate", 13), handleCreateGroupTest);
GroupTest.get("/", checkPermission("fread", 13), handleGetGroupTest);
GroupTest.delete("/:id", checkPermission("fread", 13), handleDeleteGroupTest);
GroupTest.patch("/:id", checkPermission("fupdate", 13), handleUpdateGroupTest);

GroupTest.get("/:id", checkPermission("fupdate", 13), handleGetGroupTestDetail);
GroupTest.get("/:id/tests-available", checkPermission("fcreate", 13), handleGetAvailableSubTestForGroupTest);
GroupTest.delete("/:id/tests/:detailId", checkPermission("fdelete", 13), handleDeleteSubTestFromGroupTest);

export default GroupTest;