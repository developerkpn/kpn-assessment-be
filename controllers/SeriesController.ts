import {
  createSeries,
  deleteQuestionFromSeries,
  deleteSeries,
  getAvailableQuestionsForSeries,
  getSeries,
  getSeriesbyID,
  getSeriesDetail,
  updateSeries,
} from "#dep/models/SeriesModel";
import { NextFunction, Request, Response } from "express";
import { v7 as uuid } from "uuid";
import { Validation } from "#dep/validation/Validation";
import { SeriesValidation } from "#dep/validation/SeriesValidation";
import { SeriesDetailRequest, SeriesHeaderRequest, SeriesQuery, SeriesRequests } from "#dep/types/SeriesTypes";

export const handleCreateSeries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedRequest = Validation.validate(SeriesValidation.CREATE, req.body);

    const date = new Date();
    const seriesId = uuid();
    const creator = req.userDecode!.user_id;

    const seriesHeaderRequest: SeriesHeaderRequest = {
      id: seriesId,
      series_name: validatedRequest.series_name,
      series_code: validatedRequest.series_code,
      is_active: validatedRequest.is_active,
      created_by: creator,
      created_date: date,
    };

    const seriesDetailRequest = validatedRequest.questions.map((prev: SeriesDetailRequest) => ({
      ...prev,
      id: uuid(),
      series_id: seriesId,
      added_by: creator,
      added_at: date,
    }));

    const result = await createSeries(seriesHeaderRequest, seriesDetailRequest);

    res.status(200).send({
      message: `Series with code ${result} is created successfully!`,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetSeries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getSeries();
    res.status(200).send({
      message: "Success!",
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleDeleteSeries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(SeriesValidation.ID, req.params.id);
    const result = await deleteSeries(validatedId);
    res.status(200).send({
      message: `Series's with code ${result} deleted successfully!`,
    });
  } catch (e) {
    next(e);
  }
};

export const handleUpdateSeries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(SeriesValidation.ID, req.params.id);
    const validatedRequest = Validation.validate(SeriesValidation.UPDATE, req.body);

    const date = new Date();
    const seriesId = validatedId;
    const creator = req.userDecode!.user_id;

    const seriesHeaderRequest: SeriesHeaderRequest = {
      series_name: validatedRequest.series_name,
      series_code: validatedRequest.series_code,
      is_active: validatedRequest.is_active,
      updated_by: creator,
      updated_date: date,
    };

    const seriesDetailRequest = validatedRequest.questions.map((prev: SeriesDetailRequest) => ({
      ...prev,
      id: uuid(),
      series_id: seriesId,
      added_by: creator,
      added_at: date,
    }));

    const result = await updateSeries(validatedId, seriesHeaderRequest, seriesDetailRequest);

    res.status(200).send({
      message: `Series with code ${result} is updated successfully!`,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetDetailSeries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(SeriesValidation.ID, req.params.id);
    const result = await getSeriesDetail(validatedId);
    res.status(200).send({
      message: `Success!`,
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetSeriesByID = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await getSeriesbyID(id);
    res.status(200).send({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetAvailableQuestionForSeries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(SeriesValidation.ID, req.params.id);

    const result = await getAvailableQuestionsForSeries(validatedId);

    res.status(200).send({
      message: "Success!",
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleDeleteQuestionFromSeries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedSeriesId = Validation.validate(SeriesValidation.ID, req.params.id);
    const validatedQuestionId = Validation.validate(SeriesValidation.ID, req.params.questionId);
    const updatedBy = req.userDecode!.user_id;
    const updatedAt = new Date();

    const updatePayload = {
      updated_by: updatedBy,
      updated_date: updatedAt,
    };

    await deleteQuestionFromSeries(validatedSeriesId, validatedQuestionId, updatePayload);

    res.status(200).send({
      message: "Success Delete Question!",
    });
  } catch (e) {
    next(e);
  }
};
