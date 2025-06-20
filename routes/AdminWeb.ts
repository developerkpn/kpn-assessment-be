import {
  handleCreateAdmin,
  handleCreateRole,
  handleDeleteAdmin,
  handleGetAdminById,
  handleGetAllAdmin,
  handleGetPermission,
  handleGetRole,
  handleGetRoleById,
  handleLoginAdmin,
  handleReqResetPassword,
  handleResetPassword,
  handleUpdateAdmin,
  handleUpdateRole,
  handleVerifyResetPassword,
  refreshAccessToken,
} from "@/controllers/AdminWebController.js";
import { checkPermission, isAuth } from "@/middleware/auth.js";
import { Router } from "express";
const AdminWeb = Router();

AdminWeb.post("/login", handleLoginAdmin);

AdminWeb.post("/get-token", refreshAccessToken);
AdminWeb.post("/reset-pass/req", handleReqResetPassword);
AdminWeb.post("/reset-pass/verify", handleVerifyResetPassword);
AdminWeb.patch("/reset-pass/reset", handleResetPassword);

AdminWeb.get("/permission", handleGetPermission);

AdminWeb.post("/", isAuth, checkPermission("fcreate", 8), handleCreateAdmin);
AdminWeb.get("/role", isAuth, checkPermission("fread", 8), handleGetRole);
AdminWeb.get("/", isAuth, checkPermission("fread", 8), handleGetAllAdmin);
AdminWeb.get("/:id", isAuth, checkPermission("fread", 8), handleGetAdminById);
AdminWeb.patch("/:id", isAuth, checkPermission("fupdate", 8), handleUpdateAdmin);
AdminWeb.delete("/:id", isAuth, checkPermission("fdelete", 8), handleDeleteAdmin);

AdminWeb.post("/role", isAuth, checkPermission("fcreate", 10), handleCreateRole);
AdminWeb.get("/role/:id", isAuth, checkPermission("fread", 8), handleGetRoleById);
AdminWeb.patch("/role/:id", isAuth, checkPermission("fupdate", 8), handleUpdateRole);

export default AdminWeb;
