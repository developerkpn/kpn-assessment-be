import { NextFunction, Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { SubTestDetailRequest, SubTestHeaderRequest, SubTestRequest } from "#dep/types/MasterDataTypes";
import { Validation } from "#dep/validation/Validation";
import { SeriesValidation } from "#dep/validation/SeriesValidation";
import { SubTestValidation } from "#dep/validation/SubTestValidation";
import {
  createSubTest,
  deleteSeriesFromSubTest,
  deleteSubTest,
  getAvailableSeriesForSubTest,
  getSubTest,
  getSubTestDetail,
  updateSubTest,
} from "#dep/models/SubTestModel";
import { SeriesDetailRequest } from "#dep/types/SeriesTypes";

export const handleCreateSubTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedRequest = Validation.validate(SubTestValidation.CREATE, req.body);

    const date = new Date();
    const subtestId = uuid();
    const creator = req.userDecode!.user_id;

    const subtestHeaderRequest: any = {
      id: subtestId,
      subtest_name: validatedRequest.subtest_name,
      subtest_code: validatedRequest.subtest_code,
      subtest_duration: validatedRequest.subtest_duration,
      criteria_id: validatedRequest.criteria_id,
      intro_desc: validatedRequest.intro_desc,
      series_example_id: validatedRequest.series_example_id,
      created_by: creator,
      created_at: date,
    };

    const subtestDetailRequest = validatedRequest.series.map((prev: any) => ({
      ...prev,
      id: uuid(),
      subtest_id: subtestId,
      added_by: creator,
      added_at: date,
    }));

    const result = await createSubTest(subtestHeaderRequest, subtestDetailRequest);

    res.status(201).send({
      message: `Sub Test with code ${result} is created successfully!`,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetSubTest = async (req: Request, res: Response) => {
  try {
    const result = await getSubTest();
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

export const handleUpdateSubTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedBy = req.userDecode!.user_id;
    const updatedAt = new Date();

    const subtestId = Validation.validate(SubTestValidation.ID, req.params.id);
    const validatedRequest = Validation.validate(SubTestValidation.UPDATE, req.body);
    console.log(validatedRequest);

    const updateHead: any = {
      subtest_name: validatedRequest.subtest_name,
      subtest_code: validatedRequest.subtest_code,
      subtest_duration: validatedRequest.subtest_duration,
      criteria_id: validatedRequest.criteria_id,
      is_active: validatedRequest.is_active,
      updated_by: updatedBy,
      updated_at: updatedAt,
      intro_desc: validatedRequest.intro_desc,
      series_example_id: validatedRequest.series_example_id,
    };

    console.log("masuk 1");
    console.log(updateHead);

    const deletedSeries =
      validatedRequest.deleted_series && validatedRequest.deleted_series.length > 0
        ? validatedRequest.deleted_series.map((prev: any) => ({
            ...prev,
            subtest_id: subtestId,
          }))
        : [];

    console.log("masuk 2");
    console.log(deletedSeries);

    const selectedSeries =
      validatedRequest.selected_series && validatedRequest.selected_series.length > 0
        ? validatedRequest.selected_series.map((prev: any) => ({
            ...prev,
            id: uuid(),
            subtest_id: subtestId,
            added_by: updatedBy,
            added_at: updatedAt,
          }))
        : [];

    console.log("masuk 3");
    console.log(selectedSeries);

    const result = await updateSubTest(subtestId, updateHead, deletedSeries, selectedSeries);

    res.status(200).send({
      message: `Sub Test with code ${result} is updated successfully!`,
      data: {
        validatedRequest,
        updateHead,
        deletedSeries,
        selectedSeries,
      },
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
};

export const handleGetSubTestDetail = async (req: Request, res: Response) => {
  try {
    const validatedId = Validation.validate(SubTestValidation.ID, req.params.id);
    const result = await getSubTestDetail(validatedId);
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
};

export const handleDeleteSeriesFromSubTest = async (req: Request, res: Response) => {
  try {
    const validatedSubtestId = Validation.validate(SubTestValidation.ID, req.params.id);
    const validatedDetailId = Validation.validate(SubTestValidation.ID, req.params.detailId);
    const updatedBy = req.userDecode!.user_id;
    const updatedAt = new Date();

    const updatePayload = {
      updated_by: updatedBy,
      updated_at: updatedAt,
    };

    await deleteSeriesFromSubTest(validatedSubtestId, validatedDetailId, updatePayload);

    res.status(200).send({
      message: "Success delete Series from Sub Test!",
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};
