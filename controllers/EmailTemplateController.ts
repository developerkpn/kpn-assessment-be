import {Request, Response, NextFunction} from 'express';
import {Validation} from "#dep/validation/Validation";
import {EmailTemplateValidation} from "#dep/validation/EmailTemplateValidation";
import {
    createEmailTemplate,
    deleteEmailTemplate,
    getEmailTemplate, getEmailTemplateDetail,
    updateEmailTemplate
} from "#dep/models/EmailTemplateModel";
import { v7 as uuid } from "uuid";
import {getBatchAssesses, getBatchDetail} from "#dep/models/BatchModel";
import fs from "fs";
const mustache = require("mustache");
import {createTransport} from "nodemailer";
import {Emailer} from "#dep/services/mail/Emailer";
import {getFunctionMenuDetail} from "#dep/models/FunctionMenuModel";
import {getBusinessUnitDetail} from "#dep/models/BusinessUnitModel";
import dotenv from "dotenv";
import {emailTemplateHTML} from "#dep/helper/email/emailnotifmgrprc";
dotenv.config();

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
            message: "Success!",
            data: result
        });
    } catch (e) {
        next(e);
    }
}

export const handleGetEmailTemplatePreview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const emailTemplateId = req.params.id as string;
        const result = await handleGenerateEmailTemplate(undefined, undefined, emailTemplateId);

        res.status(200).send({
            message:"Success!",
            data: result
        });
    } catch (e) {
        next(e);
    }
}

export const handleGenerateEmailTemplate = async (batchDetailId?: string, token?: string, emailTemplateId?: string) => {
    try {
        let email;
        if (batchDetailId && token) {
            console.log("masuk batch")
            const batchDetail = await getBatchDetail(batchDetailId!)
            console.log("masuk email template")
            console.log(batchDetail.template_email_id)
            const emailTemplate = await getEmailTemplateDetail(batchDetail.template_email_id);
            console.log(emailTemplate)
            console.log("function menu")
            const functionMenuDetail = await getFunctionMenuDetail(batchDetail.function_id);
            console.log("masuk bu")
            const businessUnitDetail = await getBusinessUnitDetail(batchDetail.bu_id!);
            console.log("masuk template")

            console.log(functionMenuDetail)
            const template = emailTemplateHTML;

            const payload: any = {
                title: emailTemplate.title,
                header: emailTemplate.header,
                footer: emailTemplate.footer,
                batch_name: batchDetail.batch_name? batchDetail.batch_name : `Filling in Batch Section`,
                batch_code: batchDetail.batch_code? batchDetail.batch_code : `Filling in Batch Section`,
                bu_name: businessUnitDetail.bu_name? businessUnitDetail.bu_name : `Filling in Batch Section`,
                fm_name: functionMenuDetail.fm_name? functionMenuDetail.fm_name : `Filling in Batch Section`,
                start_period: batchDetail.start_period? batchDetail.start_period : `Filling in Batch Section`,
                end_period: batchDetail.end_period? batchDetail.end_period : `Filling in Batch Section`,
                batch_link: `${process.env.API_URL}/batch/${token ? token : 'token'}`
            }

            email = {
                subject: emailTemplate.subject,
                template: mustache.render(template, payload)
            }
        } else {
            const emailTemplate = await getEmailTemplateDetail(emailTemplateId!);

            const template = emailTemplateHTML;

            const payload: any = {
                title: emailTemplate.title,
                header: emailTemplate.header,
                footer: emailTemplate.footer,
                batch_name: `Filling in Batch Section`,
                batch_code: `Filling in Batch Section`,
                bu_name: `Filling in Batch Section`,
                fm_name: `Filling in Batch Section`,
                start_period: `Filling in Batch Section`,
                end_period: `Filling in Batch Section`,
                batch_link: `${process.env.API_URL}/batch/${token ? token : 'token'}`
            }

            email = {
                subject: emailTemplate.subject,
                template: mustache.render(template, payload)
            }
        }

        return email;
    } catch (e) {
        throw e;
    }
}

export const handleSendEmail = async (batchDetailId: string, token: string, assessee_email: string) => {
    try {
        console.log("masuk send email 2")
        const email = await handleGenerateEmailTemplate(batchDetailId, token);
        console.log("masuk send email 3")
        const transporter = createTransport({
            name: "kpndomain.com",
            host: process.env.SMTP_HOST,
            secure: true,
            port: Number(process.env.SMPT_PORT) || 0,
            tls: {
                ciphers: "SSLv3",
                rejectUnauthorized: false,
            },
            auth: {
                user: `${process.env.SMTP_USERNAME}`,
                pass: `${process.env.SMTP_PASSWORD}`,
            },
            pool: true,
        });

        const mailOptions = {
            from: process.env.SMTP_USERNAME,
            to: assessee_email,
            subject: email.subject,
            html: email.template
        }

        await transporter.sendMail(mailOptions);
    } catch (e) {
        throw e;
    }
}
