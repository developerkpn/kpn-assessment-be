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
        })
    } catch (e) {
        next(e);
    }
}

export const handleGenerateEmail = async (emailTemplateId: string, batchDetailId: string) => {
    try {
        console.log("email id");
        console.log(emailTemplateId);
        console.log("batch id");
        console.log(batchDetailId);
        const emailTemplate: any = await getEmailTemplateDetail(emailTemplateId);
        console.log("email template");
        console.log(emailTemplate)
        const batchDetail = await getBatchDetail(batchDetailId)
        const payload: any = {
            title: emailTemplate.title,
            header: emailTemplate.header,
            footer: emailTemplate.footer,
            batch_name: batchDetail.batch_name,
            start_period: batchDetail.start_period,
            end_period: batchDetail.end_period,
            link: batchDetail.link || `www.google.com`
        }
        const assessee = await getBatchAssesses(batchDetailId);

        const template = fs.readFileSync(`./helper/email/emailnotifmgrprc.html`, "utf8");

        const email = mustache.render(template, payload);

        const recipients = [...new Set(assessee.map((r) => r.assessee_email))].join(", ")

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
            to: recipients,
            subject: emailTemplate.subject,
            html: email
        }

        await transporter.sendMail(mailOptions);
    } catch (e) {
        throw e;
    }
}
