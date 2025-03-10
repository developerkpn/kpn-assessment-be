import {NextFunction, Request, Response} from "express";
import { v4 as uuid } from "uuid";
import {
    SubTestDetailRequest,
    SubTestHeaderRequest,
    SubTestRequest,
} from "#dep/types/MasterDataTypes";
import {Validation} from "#dep/validation/Validation";
import {SeriesValidation} from "#dep/validation/SeriesValidation";
import {SubTestValidation} from "#dep/validation/SubTestValidation";
import {
    createSubTest, deleteSeriesFromSubTest,
    deleteSubTest, getAvailableSeriesForSubTest,
    getSubTest, getSubTestDetail,
    updateSubTest
} from "#dep/models/SubTestModel";
import {SeriesDetailRequest} from "#dep/types/SeriesTypes";

export const handleCreateSubTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedRequest = Validation.validate(SubTestValidation.CREATE, req.body);

        const date = new Date();
        const subtestId = uuid();
        const creator = req.userDecode!.user_id;

        const subtestHeaderRequest: SubTestHeaderRequest = {
            id: subtestId,
            subtest_name: validatedRequest.subtest_name,
            subtest_code: validatedRequest.subtest_code,
            subtest_duration: validatedRequest.subtest_duration,
            criteria_id: validatedRequest.criteria_id,
            created_by: creator,
            created_at: date
        }

        const subtestDetailRequest = validatedRequest.series.map((prev: SubTestDetailRequest) => ({
            ...prev,
            id: uuid(),
            subtest_id: subtestId,
            added_by: creator,
            added_at: date
        }));

        console.log(subtestHeaderRequest);

        const result = await createSubTest(subtestHeaderRequest, subtestDetailRequest);

        res.status(201).send({
            message: `Sub Test with code ${result} is created successfully!`,
        });
    } catch (e) {
        next(e);
    }
}

export const handleGetSubTest = async (req: Request, res: Response) => {
    try {
        const result = await getSubTest();
        res.status(200).send({
            message: `Success!`,
            data: result,
        })
    } catch (error: any) {
        res.status(500).send({
            message: error.message
        });
    }
}

export const handleUpdateSubTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updatedBy = req.userDecode!.user_id;
        const updatedAt = new Date();

        const validatedId = Validation.validate(SubTestValidation.ID, req.params.id);
        const validatedRequest = Validation.validate(SubTestValidation.UPDATE, req.body);
        console.log(validatedRequest);
        const subtestHeaderRequest: SubTestHeaderRequest = {
            subtest_name: validatedRequest.subtest_name,
            subtest_code: validatedRequest.subtest_code,
            subtest_duration: validatedRequest.subtest_duration,
            criteria_id: validatedRequest.criteria_id,
            is_active: validatedRequest.is_active,
            updated_by: updatedBy,
            updated_at: updatedAt,
        };
        console.log(subtestHeaderRequest);
        // Jika series tidak ada atau array kosong, maka detail request menjadi array kosong
        const subtestDetailRequest = (validatedRequest.series && validatedRequest.series.length > 0)
            ? validatedRequest.series.map((prev: SeriesDetailRequest) => ({
                ...prev,
                id: uuid(),
                subtest_id: validatedId,
                added_by: updatedBy,
                added_at: updatedAt,
            }))
            : [];

        const result = await updateSubTest(validatedId, subtestHeaderRequest, subtestDetailRequest);

        res.status(200).send({
            message: `Sub Test with code ${result} is updated successfully!`,
        });
    } catch (e) {
        next(e);
    }
};

export const handleDeleteSubTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedId = Validation.validate(SubTestValidation.ID, req.params.id);

        const result = await deleteSubTest(validatedId);

        res.status(200).send({
            message: `Sub Test with code ${result} is deleted successfully!`,
        });
    } catch (e) {
        next(e);
    }
}

export const handleGetSubTestDetail = async (req: Request, res: Response) => {
    try {
        const validatedId = Validation.validate(SubTestValidation.ID, req.params.id);
        const  result = await getSubTestDetail(validatedId);
        res.status(200).send({
            message: "Success!",
            data: result
        })
    } catch (error: any) {
        res.status(500).send({
            message: error.message,
        });
    }
}

export const handleGetAvailableSeriesForSubTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedId = Validation.validate(SubTestValidation.ID, req.params.id);
        const result = await getAvailableSeriesForSubTest(validatedId);

        res.status(200).send({
            message: "Success!",
            data: result,
        });
    } catch (e) {
        next(e);
    }
}

export const handleDeleteSeriesFromSubTest = async (req: Request, res: Response) => {
    try {
        const validatedSubtestId = Validation.validate(SubTestValidation.ID, req.params.id);
        const validatedDetailId = Validation.validate(SubTestValidation.ID, req.params.detailId);
        const updatedBy = req.userDecode!.user_id;
        const updatedAt = new Date();

        const updatePayload = {
            updated_by: updatedBy,
            updated_at: updatedAt,
        }

        await deleteSeriesFromSubTest(validatedSubtestId, validatedDetailId, updatePayload);

        res.status(200).send({
            message: "Success delete Series from Sub Test!",
        });
    } catch (error: any) {
        res.status(500).send({
            message: error.message
        });
    }
}