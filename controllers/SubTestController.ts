import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {SubTestDetailRequest, SubTestHeaderRequest, SubTestRequest} from "#dep/types/MasterDataTypes";
import {Validation} from "#dep/validation/Validation";
import {SeriesValidation} from "#dep/validation/SeriesValidation";
import {SubTestValidation} from "#dep/validation/SubTestValidation";
import {
    addSeriesToSubTest,
    createSubTest, deleteSeriesFromSubTest,
    deleteSubTest,
    getSubTest,
    getSubtestDetail,
    updateSubTest
} from "#dep/models/SubTestModel";
import {SeriesDetailRequest} from "#dep/types/SeriesTypes";
import SubTest from "#dep/routes/SubTest";
import {addQuestionToSeries, deleteQuestionFromSeries} from "#dep/models/SeriesModel";

export const handleCreateSubTest = async (req: Request, res: Response) => {
    try {
        const request: SubTestRequest = req.body;
        const date = new Date();
        const subtestId = uuidv4();
        const creator = req.userDecode!.user_id;

        const validatedRequest = Validation.validate(SubTestValidation.CREATE, request);

        const subtestHeaderRequest: SubTestHeaderRequest = {
            id: subtestId,
            subtest_name: validatedRequest.subtest_name,
            subtest_code: validatedRequest.subtest_code,
            subtest_duration: validatedRequest.subtest_duration,
            category_id: validatedRequest.category_id,
            criteria_id: validatedRequest.criteria_id,
            is_active: validatedRequest.is_active,
            created_by: creator,
            created_at: date
        }

        const subtestDetailRequest = validatedRequest.series.map((prev: SubTestDetailRequest) => ({
            ...prev,
            id: uuidv4(),
            subtest_id: subtestId,
            added_by: creator,
            added_at: date
        }));

        const result = await createSubTest(subtestHeaderRequest, subtestDetailRequest);

        res.status(200).send({
            message: `Success create subtest`,
            subtest_name: result,
        });
    } catch (error: any) {
        res.status(500).send({
            message: error.message,
        })
    }
}

export const handleGetSubTest = async (req: Request, res: Response) => {
    try {
        const result = await getSubTest();
        res.status(200).send({
            message: `Success Get SubTest`,
            data: result,
        })
    } catch (error: any) {
        res.status(500).send({
            message: error.message
        });
    }
}

export const handleUpdateSubTest = async (req: Request, res: Response) => {
    try {
        const updatedBy = req.userDecode!.user_id;
        const updatedAt = new Date();

        const validatedId = Validation.validate(SubTestValidation.ID, req.params.id);
        const request: SubTestRequest = req.body;

        const validatedRequest = Validation.validate(SubTestValidation.UPDATE, request)

        const subtestUpdateRequest = {
            ...validatedRequest,
            updated_by: updatedBy,
            updated_at: updatedAt,
        }

        const result = await updateSubTest(validatedId, validatedRequest);
        res.status(200).send({
            message: `Success Update SubTest`,
        });

    } catch (error: any) {
        res.status(500).send({
            message: error.message
        });
    }
}

export const handleDeleteSubTest = async (req: Request, res: Response) => {
    try {
        const validatedId = Validation.validate(SubTestValidation.ID, req.params.id);

        const result = await deleteSubTest(validatedId);

        res.status(200).send({
            message: `Success Delete SubTest`,
        });
    } catch (error: any) {
        res.status(500).send({
            message: error.message
        });
    }
}

export const handleGetSubTestDetail = async (req: Request, res: Response) => {
    try {
        const validatedId = Validation.validate(SubTestValidation.ID, req.params.id);
        const  result = await getSubtestDetail(validatedId);
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

export const handleAddSeriesToSubTest = async (req: Request, res: Response) => {
    try {
        const validatedId = Validation.validate(SubTestValidation.ID, req.params.id);
        const validatedRequest = Validation.validate(SubTestValidation.ADDSERIES, req.body)
        const updatedBy = req.userDecode!.user_id;
        const updatedAt = new Date();
        const addedBy = updatedBy;
        const addedAt = updatedAt;

        const updatePayload = {
            updated_by: updatedBy,
            updated_at: updatedAt,
        }

        const subtestDetailRequest = validatedRequest.series.map((prev: SubTestDetailRequest) => ({
            ...prev,
            id: uuidv4(),
            subtest_id: validatedId,
            added_by: addedBy,
            added_at: addedAt,
        }));

        await addSeriesToSubTest(validatedId, updatePayload, subtestDetailRequest);

        res.status(201).send({
            message: "Success Adding Series!",
        });
    } catch (error: any) {
        res.status(500).send({
            message: error.message,
        });
    }
}

export const handleDeleteSeriesFromSubTest = async (req: Request, res: Response) => {
    try {
        const validatedSeriesId = Validation.validate(SubTestValidation.ID, req.params.id);
        const validatedDetailId = Validation.validate(SubTestValidation.ID, req.params.detailId);
        const updatedBy = req.userDecode!.user_id;
        const updatedAt = new Date();

        const updatePayload = {
            updated_by: updatedBy,
            updated_at: updatedAt,
        }

        await deleteSeriesFromSubTest(validatedDetailId, validatedSeriesId, updatePayload);

        res.status(200).send({
            message: "Success Delete Series!",
        });
    } catch (error: any) {
        res.status(500).send({
            message: error.message
        });
    }
}