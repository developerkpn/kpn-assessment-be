import { NextFunction, Request, Response } from "express";
import { Validation } from "#dep/validation/Validation";
import { TestValidation } from "#dep/validation/TestValidation";
import { v4 as uuid } from "uuid";
import { TestDetailRequest, TestHeaderRequest } from "#dep/types/MasterDataTypes";
import {
  createTest,
  deleteSubTestFromTest,
  deleteTest,
  getAvailableSubTestForTest,
  getTest,
  getTestDetail,
  updateTest,
} from "#dep/models/TestModel";

export const handleCreateTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedRequest = Validation.validate(TestValidation.CREATE, req.body);

    const date = new Date();
    const testId = uuid();
    const creator = req.userDecode!.user_id;

    const testHeaderRequest: TestHeaderRequest = {
      id: testId,
      test_name: validatedRequest.test_name,
      test_code: validatedRequest.test_code,
      description: validatedRequest.description,
      created_by: creator,
      created_at: date,
    };

    const testDetailRequest = validatedRequest.subtests.map((prev: TestDetailRequest) => ({
      ...prev,
      id: uuid(),
      test_id: testId,
      added_by: creator,
      added_at: date,
    }));

    console.log(testHeaderRequest);

    console.log(testDetailRequest);

    const result = await createTest(testHeaderRequest, testDetailRequest);

    res.status(201).send({
      message: `Test with code ${result} is created successfully!`,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetTest = async (req: Request, res: Response) => {
  try {
    const result = await getTest();
    res.status(200).send({
      message: `Success!`,
      data: result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleUpdateTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedBy = req.userDecode!.user_id;
    const updatedAt = new Date();

    const validatedId = Validation.validate(TestValidation.ID, req.params.id);
    const validatedRequest = Validation.validate(TestValidation.UPDATE, req.body);

    const testHeaderUpdateRequest: TestHeaderRequest = {
      ...validatedRequest,
      updated_by: updatedBy,
      updated_at: updatedAt,
    };

    delete testHeaderUpdateRequest.subtests;
    console.log(testHeaderUpdateRequest);

    let testDetailRequest;
    console.log(validatedRequest.subtests);
    if (validatedRequest.subtests.length > 0) {
      console.log("masuk sini oy");
      testDetailRequest = validatedRequest.subtests.map((prev: TestDetailRequest) => ({
        ...prev,
        id: uuid(),
        test_id: validatedId,
        added_by: updatedBy,
        added_at: updatedAt,
      }));
    }

    const result = await updateTest(validatedId, testHeaderUpdateRequest, testDetailRequest);

    res.status(200).send({
      message: `Test with code ${result} is updated successfully!`,
    });
  } catch (e) {
    next(e);
  }
};

export const handleDeleteTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(TestValidation.ID, req.params.id);

    const result = await deleteTest(validatedId);
    console.log(result);
    res.status(200).send({
      message: `Test with code ${result} is deleted successfully!`,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetTestDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(TestValidation.ID, req.params.id);
    const result = await getTestDetail(validatedId);
    res.status(200).send({
      message: "Success!",
      data: result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleGetAvailableSubTestForTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(TestValidation.ID, req.params.id);
    const result = await getAvailableSubTestForTest(validatedId);

    res.status(200).send({
      message: "Success!",
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleDeleteSubTestFromTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedTestId = Validation.validate(TestValidation.ID, req.params.id);
    const validatedDetailId = Validation.validate(TestValidation.ID, req.params.detailId);

    const updatePayload = {
      updated_by: req.userDecode!.user_id,
      updated_at: new Date(),
    };

    await deleteSubTestFromTest(validatedTestId, validatedDetailId, updatePayload);

    res.status(200).send({
      message: "Success delete Sub Test from Test!",
    });
  } catch (e) {
    next(e);
  }
};
