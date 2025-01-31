import {
  addQuestionToSeries,
  createSeries, deleteQuestionFromSeries,
  deleteSeries, getListQuestionForSeries,
  getSeries,
  getSeriesDetail, getSeriesListQuestion,
  updateSeries
} from "#dep/models/SeriesModel";
import { SeriesRequest } from "#dep/types/MasterDataTypes";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {Validation} from "#dep/validation/Validation";
import {SeriesValidation} from "#dep/validation/SeriesValidation";
import {SeriesDetailRequest, SeriesHeaderRequest, SeriesQuery, SeriesRequests} from "#dep/types/SeriesTypes";
import {deleteQuestion} from "#dep/models/QuestionModel";
import {async} from "rxjs";
import {boolean, number} from "zod";

export const handleGetQuestionsList = async (req: Request, res: Response) => {
  try {
    const { page = 1, search = ""} = req.query;
    const result = await getListQuestionForSeries(Number(page), String(search));
    res.status(200).send({
      message: "Success!",
      result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
}

export const handleCreateSeries = async (req: Request, res: Response) => {
  try {
    const request: SeriesRequests = req.body;
    const date = new Date();
    const seriesId = uuidv4();
    const creator = req.userDecode!.user_id;

    const validatedRequest = Validation.validate(SeriesValidation.CREATE, request);

    const seriesHeaderRequest: SeriesHeaderRequest= {
      id: seriesId,
      series_name: validatedRequest.series_name,
      series_code: validatedRequest.series_code,
      is_active: validatedRequest.is_active,
      category_id: validatedRequest.category_id,
      created_by: creator,
      created_date: date,
    }

    // const seriesDetailRequest = validatedRequest.detail.map((prev: SeriesDetailRequest) => ({
    //   ...prev,
    //   id: uuidv4(),
    //   series_id: seriesId,
    //   added_by: creator,
    //   added_at: date,
    // }));

    const result = await createSeries(seriesHeaderRequest); //(seriesHeaderRequest, seriesDetailRequest)
    res.status(200).send({
      message: `Success create series`,
      series_name: result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleGetSeries = async (req: Request, res: Response) => {
  try {
    const validatedQuery: SeriesQuery = Validation.validate(SeriesValidation.QUERY, req.query);
    const result = await getSeries(validatedQuery.page!, validatedQuery.search!, validatedQuery.date!, validatedQuery.active!);
    res.status(200).send({
      message: "Success!",
      result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleDeleteSeries = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const validatedId = Validation.validate(SeriesValidation.ID, id);
    await deleteSeries(validatedId);
    res.status(200).send({
      message: `Success delete series`,
      id: id,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleUpdateSeries = async (req: Request, res: Response) => {
  const today = new Date();
  const id = req.params.id;
  const payload = { ...req.body, updated_date: today };
  try {
    const validatedRequest = Validation.validate(SeriesValidation.UPDATE, payload);
    const validatedId = Validation.validate(SeriesValidation.ID, id);
    let result = await updateSeries(validatedRequest, validatedId);
    res.status(200).send({
      message: `Success update series`,
      series_name: result,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const handleGetDetailSeries = async (req: Request, res: Response) => {
  try {
    const validatedId = Validation.validate(SeriesValidation.ID, req.params.id);
    const result = await getSeriesDetail(validatedId);
    res.status(200).send({
      message: `Success!`,
      data: result
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
}

export const handleSeriesListQuestion = async (req: Request, res: Response) => {
  try {
    const validatedId = Validation.validate(SeriesValidation.ID, req.params.id);
    const validatedQuery: SeriesQuery = Validation.validate(SeriesValidation.QUERY, req.query)
    const result = await getSeriesListQuestion(validatedId, validatedQuery.page!, validatedQuery.search!, validatedQuery.date!);
    res.status(200).send({
      message: `Success!`,
      data: result
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
}

export const handleAddQuestionToSeries = async (req: Request, res: Response) => {
  try {
    const validatedId = Validation.validate(SeriesValidation.ID, req.params.id);
    const validatedRequest = Validation.validate(SeriesValidation.ADDQUESTION, req.body)
    const updatedBy = req.userDecode!.user_id;
    const updatedAt = new Date();
    const addedBy = updatedBy;
    const addedAt = updatedAt;

    const updatePayload = {
      updated_by: updatedBy,
      updated_date: updatedAt,
    }

    const seriesDetailRequest = validatedRequest.detail.map((prev: SeriesDetailRequest) => ({
      ...prev,
      id: uuidv4(),
      series_id: validatedId,
      added_by: addedBy,
      added_at: addedAt,
    }));

    await addQuestionToSeries(validatedId, updatePayload, seriesDetailRequest);

    res.status(200).send({
      message: "Success Adding Question!",
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
}

export const handleDeleteQuestionFromSeries = async (req: Request, res: Response) => {
  try {
    const validatedSeriesId = Validation.validate(SeriesValidation.ID, req.params.id);
    const validatedDetailId = Validation.validate(SeriesValidation.ID, req.params.questionId);
    const updatedBy = req.userDecode!.user_id;
    const updatedAt = new Date();

    const updatePayload = {
      updated_by: updatedBy,
      updated_date: updatedAt,
    }

    await deleteQuestionFromSeries(validatedDetailId, validatedSeriesId, updatePayload);

    res.status(200).send({
      message: "Success Delete Question!",
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message
    });
  }
}
