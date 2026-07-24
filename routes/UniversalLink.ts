import {
  handleCreateUniversalLink,
  handleDeleteUniversalLink,
  handleGetUniversalLinks,
  handleUpdateUniversalLink,
} from "@/controllers/UniversalLinkController.js";
import { checkPermission } from "@/middleware/auth.js";
import { Router } from "express";

const UniversalLink = Router();

// Universal Link menu (menu id 22)
UniversalLink.get("/", checkPermission("fread", 22), handleGetUniversalLinks);
UniversalLink.post("/", checkPermission("fcreate", 22), handleCreateUniversalLink);
UniversalLink.patch("/:id", checkPermission("fupdate", 22), handleUpdateUniversalLink);
UniversalLink.delete("/:id", checkPermission("fdelete", 22), handleDeleteUniversalLink);

export default UniversalLink;
