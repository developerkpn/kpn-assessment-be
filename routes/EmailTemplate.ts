import { Router } from "express";
import {checkPermission} from "#dep/middleware/auth";
import {
    handleCreateEmailTemplate,
    handleDeleteEmailTemplate, handleGetEmailTemplate, handleGetEmailTemplatePreview,
    handleUpdateEmailTemplate
} from "#dep/controllers/EmailTemplateController";

const EmailTemplate = Router();

EmailTemplate.post("/", checkPermission("fcreate", 16), handleCreateEmailTemplate);
EmailTemplate.get("/", checkPermission("fread", 16), handleGetEmailTemplate);
EmailTemplate.patch("/:id", checkPermission("fupdate", 16), handleUpdateEmailTemplate);
EmailTemplate.delete("/:id", checkPermission("fdelete", 16), handleDeleteEmailTemplate);
EmailTemplate.get("/:id", checkPermission("fread", 16), handleGetEmailTemplatePreview);
export default EmailTemplate;