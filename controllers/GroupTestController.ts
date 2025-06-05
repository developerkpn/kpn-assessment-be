import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { GroupTestDetailRequest, GroupTestHeaderRequest } from "@/types/MasterDataTypes.js";
import { Validation } from "@/validation/Validation.js";
import { GroupTestValidation } from "@/validation/GroupTestValidation.js";
import {
  createGroupTest,
  deleteGroupTest,
  deleteTestFromGroupTest,
  getAvailableSubTestForGroupTest,
  getGroupTest,
  getGroupTestDetail,
  updateGroupTest,
} from "@/models/GroupTestModel.js";
import { SubTestValidation } from "@/validation/SubTestValidation.js";

export const handleGetAvailableSubTestForGroupTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(GroupTestValidation.ID, req.params.id);
    const result = await getAvailableSubTestForGroupTest(validatedId);

    res.status(200).send({
      message: "Success!",
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleCreateGroupTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedRequest = Validation.validate(GroupTestValidation.CREATE, req.body);
    const date = new Date();
    const grouptestId = uuidv4();
    const creator = req.userDecode!.user_id;

    const grouptestHeaderRequest: GroupTestHeaderRequest = {
      id: grouptestId,
      grouptest_name: validatedRequest.grouptest_name,
      grouptest_code: validatedRequest.grouptest_code,
      created_by: creator,
      created_at: date,
    };

    const grouptestDetailRequest = validatedRequest.tests.map((prev: GroupTestDetailRequest) => ({
      ...prev,
      id: uuidv4(),
      grouptest_id: grouptestId,
      added_by: creator,
      added_at: date,
    }));

    const result = await createGroupTest(grouptestHeaderRequest, grouptestDetailRequest);

    res.status(201).send({
      message: `Group test with code ${result} is created successfully!`,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetGroupTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getGroupTest();
    res.status(200).send({
      message: `Success!`,
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleUpdateGroupTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedBy = req.userDecode!.user_id;
    const updatedAt = new Date();

    const validatedId = Validation.validate(GroupTestValidation.ID, req.params.id);
    const validatedRequest = Validation.validate(GroupTestValidation.UPDATE, req.body);

    const grouptestUpdateRequest = {
      ...validatedRequest,
      updated_by: updatedBy,
      updated_at: updatedAt,
    };

    delete grouptestUpdateRequest.tests;

    const grouptestUpdateDetailRequest = validatedRequest.tests.map((prev: GroupTestDetailRequest) => ({
      ...prev,
      id: uuidv4(),
      grouptest_id: validatedId,
      added_by: updatedBy,
      added_at: updatedAt,
    }));

    const result = await updateGroupTest(validatedId, grouptestUpdateRequest, grouptestUpdateDetailRequest);

    res.status(200).send({
      message: `Group Test with code ${result} is updated successfully!`,
    });
  } catch (e) {
    next(e);
  }
};

export const handleDeleteGroupTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(GroupTestValidation.ID, req.params.id);
    const result = await deleteGroupTest(validatedId);

    res.status(200).send({
      message: `Group Test with code ${result} is deleted successfully!`,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetGroupTestDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(GroupTestValidation.ID, req.params.id);
    const result = await getGroupTestDetail(validatedId);
    res.status(200).send({
      message: `Success!`,
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleDeleteSubTestFromGroupTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedGroupTestId = Validation.validate(SubTestValidation.ID, req.params.id);
    const validatedDetailId = Validation.validate(SubTestValidation.ID, req.params.detailId);
    const updatedBy = req.userDecode!.user_id;
    const updatedAt = new Date();

    const updatePayload = {
      updated_by: updatedBy,
      updated_at: updatedAt,
    };

    await deleteTestFromGroupTest(validatedDetailId, validatedGroupTestId, updatePayload);

    res.status(200).send({
      message: "Success deleted Test from Group Test!",
    });
  } catch (e) {
    next(e);
  }
};
