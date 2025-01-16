import { checkPermission } from "#dep/middleware/auth";
import { Router } from "express";
import {
    handleCreateCategory,
    handleDeleteCategory,
    handleGetCategory,
    handleUpdateCategory
} from "#dep/controllers/CategoryController";
export const Category = Router();

Category.post("/", checkPermission("fcreate", 8), handleCreateCategory);
Category.get("/", checkPermission("fread", 8), handleGetCategory);
Category.patch("/:id", checkPermission("fupdate", 8), handleUpdateCategory);
Category.delete("/:id", checkPermission("fdelete", 8), handleDeleteCategory);
