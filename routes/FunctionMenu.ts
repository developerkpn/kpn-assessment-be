import {
  handleCreateFunctionMenu,
  handleDeleteFunctionMenu,
  handleGetFunctionMenu,
  handleGetFunctionMenuFinal,
  handleUpdateFunctionMenu,
} from "@/controllers/FunctionMenuController.js";
import { checkPermission } from "@/middleware/auth.js";
import { Router } from "express";
const FunctionMenu = Router();

FunctionMenu.get("/", checkPermission("fread", [6, 15]), handleGetFunctionMenuFinal);
FunctionMenu.get("/master", checkPermission("fread", [6, 15]), handleGetFunctionMenu);
FunctionMenu.post("/", checkPermission("fcreate", 6), handleCreateFunctionMenu);
FunctionMenu.delete("/:id", checkPermission("fdelete", 6), handleDeleteFunctionMenu);
FunctionMenu.patch("/:id", checkPermission("fupdate", 6), handleUpdateFunctionMenu);

export default FunctionMenu;
