import {
  createBusinessUnit,
  deleteBusinessUnit,
  getBusinessUnit,
  updateBusinessUnit,
} from "#dep/models/BusinessUnitModel";
import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Validation } from "#dep/validation/Validation";
import { BusinessUnitValidation } from "#dep/validation/BusinessUnitValidation";

export const handleCreateBusinessUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date();

    const payload = {
      id: uuidv4(),
      bu_code: req.body.bu_code,
      bu_name: req.body.bu_name,
      is_active: req.body.is_active,
      created_by: req.body.created_by,
      created_date: today,
    };

    const validatedRequest = Validation.validate(BusinessUnitValidation.CREATE, payload);
    const result = await createBusinessUnit(validatedRequest);
    res.status(200).send({
      message: `Success create business unit`,
      bu_code: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetBusinessUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let result = await getBusinessUnit();
    res.status(200).send({
      message: `Success get business unit`,
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleUpdateBusinessUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedRequest = Validation.validate(BusinessUnitValidation.UPDATE, req.body);
    const validatedId = Validation.validate(BusinessUnitValidation.ID, req.params.id);
    let result = await updateBusinessUnit(validatedRequest, validatedId);
    res.status(200).send({
      message: `Success update business unit`,
      bu_code: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleDeleteBusinessUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(BusinessUnitValidation.ID, req.params.id);
    await deleteBusinessUnit(validatedId);
    res.status(200).send({
      message: `Success delete business unit`,
      id: validatedId,
    });
  } catch (e) {
    next(e);
  }
};
