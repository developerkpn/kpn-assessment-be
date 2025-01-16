import { checkPermission } from "#dep/middleware/auth";
import { Router } from "express";
import {
    handleCreateCategory,
    handleDeleteCategory,
    handleGetCategory,
    handleUpdateCategory
} from "#dep/controllers/CategoryController";
export const Category = Router();

Category.post("/", checkPermission("fcreate", 11), handleCreateCategory);
Category.get("/", checkPermission("fread", 11), handleGetCategory);
Category.patch("/:id", checkPermission("fupdate", 11), handleUpdateCategory);
Category.delete("/:id", checkPermission("fdelete", 11), handleDeleteCategory);
