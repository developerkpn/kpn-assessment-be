import {NextFunction, Request, Response} from "express";
import { v7 as uuid } from "uuid";
import {Validation} from "#dep/validation/Validation";
import {BatchValidation} from "#dep/validation/BatchValidation";
import * as XLSX from 'xlsx';
import {
    addAssessee,
    createBatch,
    deleteBatch, deleteBatchAssessee,
    getBatch, getBatchAssesses,
    getBatchDetail,
    updateBatch
} from "#dep/models/BatchModel";
import {AdminWebValidation} from "#dep/validation/AdminWebValidation";
import {BatchAssessee, BatchHeader, BatchHeadUpdate} from "#dep/types/BatchTypes";

export const handleCreateBatch = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedRequest = Validation.validate(BatchValidation.CREATE, req.body);

        const batch: BatchHeader = {
            id:  uuid(),
            created_by: req.userDecode!.user_id,
            created_at: new Date(),
            ...validatedRequest
        }

        const result = await createBatch(batch);

        res.status(201).send({
            message: `Batch with code ${result} is created successfully!`,
        });
    } catch (e) {
        next(e);
    }
}

export const handleGetBatch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await getBatch();

        res.status(200).send({
            message: "Success!",
            data: result
        });
    } catch (e) {
        next(e);
    }
}

export const handleUpdateBatch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedId = Validation.validate(BatchValidation.ID, req.params.id);
        const validatedRequest = Validation.validate(BatchValidation.UPDATE, req.body);
        const batchUpdate: BatchHeadUpdate = {
            id: validatedId,
            updated_by: req.userDecode?.user_id,
            updated_at: new Date(),
            ...validatedRequest
        }
        const result = await updateBatch(validatedId, batchUpdate);

        res.status(201).send({
            message: `Batch with code ${result} is updated successfully!`,
        })
    } catch (e) {
        next(e);
    }
}

export const handleDeleteBatch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedId = Validation.validate(BatchValidation.ID, req.params.id);

        const result = await deleteBatch(validatedId);

        res.status(200).send({
            message: `Batch with code ${result} is deleted successfully`,
        });
    } catch (e) {
        next(e);
    }
}

export const handleAddAssesseeManually = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedId = Validation.validate(BatchValidation.ID, req.params.id);
        const validatedRequest = Validation.validate(BatchValidation.ADDASSESSEEMANUALLY, req.body);

        const assessee: BatchAssessee = {
            id: uuid(),
            batch_id: validatedId,
            ...validatedRequest
        }

        await addAssessee(assessee);

        res.status(201).send({
            message: "Assessee is successfully added!",
        })
    } catch (e) {
        next(e);
    }
}

export const handleGetBatchDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedId = Validation.validate(BatchValidation.ID, req.params.id);

        const result = await getBatchDetail(validatedId);

        res.status(200).send({
            message: `Success!`,
            data: result
        })
    } catch (e) {
        next(e);
    }
}

export const handleGetBatchAssessees = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedId = Validation.validate(BatchValidation.ID, req.params.id);

        const result = await getBatchAssesses(validatedId)

        res.status(200).send({
            message: "Success!",
            data: result
        });
    } catch (e) {
        next(e);
    }
}

export const handleDeleteBatchAssessee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedBatchId = Validation.validate(BatchValidation.ID, req.params.id);
        const validateAssesseeId = Validation.validate(BatchValidation.ID, req.params.assesseeId);
        console.log("halo")
        await deleteBatchAssessee(validatedBatchId, validateAssesseeId);
        console.log("halo 2")
        res.status(200).send({
            message: "Success!"
        })
    } catch (e) {
        next(e);
    }
}

export const handleAddAssesseeByFile = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        res.status(400).send('File tidak ditemukan.');
        return;
    }

    try {
        const validatedId = Validation.validate(BatchValidation.ID, req.params.id);
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            defval: null,
            raw: false
        });

        const filteredData = jsonData.map((row: any) => {
            const result = {
                id: uuid(),
                batch_id: validatedId,
                assessee_nik: row.assessee_nik,
                assessee_name: row.assessee_name,
                assessee_email: row.assessee_email,
            };
            return result;
        });

        console.log(filteredData);
        const validatedAssessee = Validation.validate(BatchValidation.ASSESSEE, filteredData);

        await addAssessee(validatedAssessee);

        res.status(200).send({
            message: "Success!"
        });

    } catch (e) {
        next(e);
    }
}
