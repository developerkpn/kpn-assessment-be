import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
    GroupTestDetailRequest,
    GroupTestHeaderRequest,
    GroupTestRequest,
    SubTestDetailRequest,
    SubTestHeaderRequest
} from "#dep/types/MasterDataTypes";
import {Validation} from "#dep/validation/Validation";
import {createSubTest, deleteSeriesFromSubTest} from "#dep/models/SubTestModel";
import {GroupTestValidation} from "#dep/validation/GroupTestValidation";
import {
    addSubTestToGroupTest,
    createGroupTest,
    deleteGroupTest, deleteSubTestFromGroupTest,
    getGroupTest,
    getGroupTestDetail,
    updateGroupTest
} from "#dep/models/GroupTestModel";
import {error} from "winston";
import {deleteFunctionMenu} from "#dep/models/FunctionMenuModel";
import {SubTestValidation} from "#dep/validation/SubTestValidation";


export const handleCreateGroupTest = async (req: Request, res: Response) => {
    try {
        const request: GroupTestRequest = req.body;
        const date = new Date();
        const grouptestId = uuidv4();
        const creator = req.userDecode!.user_id;

        const validatedRequest = Validation.validate(GroupTestValidation.CREATE, request);

        const grouptestHeaderRequest: GroupTestHeaderRequest = {
            id: grouptestId,
            grouptest_name: validatedRequest.grouptest_name,
            grouptest_code: validatedRequest.grouptest_code,
            is_active: validatedRequest.is_active,
            created_by: creator,
            created_at: date
        }

        const grouptestDetailRequest = validatedRequest.subtests.map((prev: GroupTestDetailRequest) => ({
            ...prev,
            id: uuidv4(),
            grouptest_id: grouptestId,
            added_by: creator,
            added_at: date
        }));

        const result = await createGroupTest(grouptestHeaderRequest, grouptestDetailRequest);

        res.status(200).send({
            message: `Success create grouptest`,
            subtest_name: result,
        });
    } catch (error: any) {
        res.status(500).send({
            message: error.message,
        })
    }
}

export const handleGetGroupTest = async (req: Request, res: Response) => {
    try {
        const result = await getGroupTest();
        res.status(200).send({
            message: `Success update grouptest`,
            data: result,
        });
    } catch (error: any) {
        res.status(500).send({
            message: error.message,
        });
    }
}

export const handleUpdateGroupTest = async (req: Request, res: Response) => {
    try {
        const updatedBy = req.userDecode!.user_id;
        const updatedAt = new Date();

        const validatedId = Validation.validate(GroupTestValidation.ID, req.params.id);
        const request = req.body;

        const validatedRequest = Validation.validate(GroupTestValidation.UPDATE, req.body);

        const grouptestUpdateRequest = {
            ...validatedRequest,
            updated_by: updatedBy,
            updated_at: updatedAt
        }

        const result = await updateGroupTest(validatedId, grouptestUpdateRequest);

        res.status(200).send({
           message: `Success update Group Test`,
        });
    } catch (error: any) {
        res.status(500).send({
            message: error.message
        });
    }
}

export const handleDeleteGroupTest = async (req: Request, res: Response) => {
    try {
        const validatedId = Validation.validate(GroupTestValidation.ID, req.params.id);

        const result = await deleteGroupTest(validatedId);

        res.status(200).send({
            message: `Success Delete Group Test`,
        });
    } catch (error: any) {
        res.status(500).send({
            message: error.message
        });
    }
}

export const handleGetGroupTestDetail = async (req: Request, res: Response) => {
    try {
        const validatedId = Validation.validate(GroupTestValidation.ID, req.params.id);
        const result = await getGroupTestDetail(validatedId);
        res.status(200).send({
            message: `Success!`,
            data: result,
        })
    } catch (error: any) {
        res.status(500).send({
            message: error.message,
        });
    }
}

export const handleAddSubTestToGroupTest = async (req: Request, res: Response) => {
    try {
        const validatedId = Validation.validate(GroupTestValidation.ID, req.params.id);
        const validatedRequest = Validation.validate(GroupTestValidation.ADDSUBTEST, req.body);
        const updatedBy = req.userDecode!.user_id;
        const updatedAt = new Date();
        const addedBy = updatedBy;
        const addedAt = updatedAt;

        const updatePayload = {
            updated_by: updatedBy,
            updated_at: updatedAt,
        }

        const grouptestDetailRequest = validatedRequest.subtests.map((prev: GroupTestDetailRequest) => ({
            ...prev,
            id: uuidv4(),
            grouptest_id: validatedId,
            added_by: addedBy,
            added_at: addedAt,
        }));

        await addSubTestToGroupTest(validatedId, updatePayload, grouptestDetailRequest);

        res.status(201).send({
            message: "Success Adding Sub Test",
        })
    } catch (error: any) {
        res.status(500).send({
            message: error.message
        });
    }
}

export const handleDeleteSubTestFromGroupTest = async (req: Request, res: Response) => {
    try {
        const validatedSeriesId = Validation.validate(SubTestValidation.ID, req.params.id);
        const validatedDetailId = Validation.validate(SubTestValidation.ID, req.params.detailId);
        const updatedBy = req.userDecode!.user_id;
        const updatedAt = new Date();

        const updatePayload = {
            updated_by: updatedBy,
            updated_at: updatedAt,
        }

        await deleteSubTestFromGroupTest(validatedDetailId, validatedSeriesId, updatePayload);

        res.status(200).send({
            message: "Success Delete Series!",
        });
    } catch (error: any) {
        res.status(500).send({
            message: error.message
        });
    }
}