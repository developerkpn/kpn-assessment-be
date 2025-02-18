import {Request, Response, NextFunction} from 'express';
import {Validation} from "#dep/validation/Validation";
import {EmailTemplateValidation} from "#dep/validation/EmailTemplateValidation";
import {
    createEmailTemplate,
    deleteEmailTemplate,
    getEmailTemplate,
    updateEmailTemplate
} from "#dep/models/EmailTemplate";
import { v7 as uuid } from "uuid";

export const handleCreateEmailTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedRequest = Validation.validate(EmailTemplateValidation.CREATE, req.body);

        const payload: any = {
            id: uuid(),
            created_by: req.userDecode!.user_id,
            created_at: new Date(),
            ...validatedRequest
        }

        const result = await createEmailTemplate(payload);

        res.status(201).send({
            message: `Email's template is created successfully!`,
        });
    } catch (e) {
        next(e);
    }
}

export const handleUpdateEmailTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedId = Validation.validate(EmailTemplateValidation.ID, req.params.id);
        const validatedRequest = Validation.validate(EmailTemplateValidation.UPDATE, req.body);

        const payload: any = {
            updated_by: req.userDecode!.user_id,
            updated_at: new Date(),
            ...validatedRequest
        }

        const result = await updateEmailTemplate(validatedId, payload);

        res.status(201).send({
            message: `Email with subject ${result} is updated successfully!`,
        })
    } catch (e) {
        next(e);
    }
}

export const handleDeleteEmailTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedId = Validation.validate(EmailTemplateValidation.ID, req.params.id);

        await deleteEmailTemplate(validatedId);

        res.status(201).send({
            message: `Email's deleted successfully!`,
        })
    } catch (e) {
        next(e);
    }
}

export const handleGetEmailTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await getEmailTemplate();

        res.status(200).send({
            message: `Success!`,
            data: result
        });
    } catch (e) {
        next(e);
    }
}