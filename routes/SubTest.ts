import { Router } from "express";
import {checkPermission} from "#dep/middleware/auth";
import {
    handleAddSeriesToSubTest,
    handleCreateSubTest, handleDeleteSeriesFromSubTest,
    handleDeleteSubTest,
    handleGetSubTest, handleGetSubTestDetail,
    handleUpdateSubTest
} from "#dep/controllers/SubTestController";
const SubTest = Router();

SubTest.post("/", checkPermission("fcreate", 12), handleCreateSubTest);
SubTest.get("/", checkPermission("fread", 12), handleGetSubTest);
SubTest.delete("/:id", checkPermission("fread", 12), handleDeleteSubTest);
SubTest.patch("/:id", checkPermission("fupdate", 12), handleUpdateSubTest);
SubTest.get("/:id", checkPermission("fupdate", 12), handleGetSubTestDetail);
SubTest.post("/:id/series", checkPermission("fcreate", 12), handleAddSeriesToSubTest);
SubTest.delete("/:id/series/:detailId", checkPermission("fdelete", 12), handleDeleteSeriesFromSubTest);

export default SubTest;

